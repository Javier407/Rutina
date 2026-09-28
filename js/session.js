// ============================================================
//  MODO GUIADO — "Iniciar día"
//  Serie → "Serie hecha" → descanso en grande → siguiente serie
//  Al terminar todas las series: descanso del ejercicio → siguiente
// ============================================================
window.SESION = (function () {
  const R = RUT, V = VOZ;
  const KEY = "rutina.session.activa";
  let st = R.store.json(KEY, null);
  if (st && st.fecha !== R.dateKey()) { st = null; R.store.del(KEY); } // una sesión vieja no se reanuda
  let root = null, loop = null, wake = null, onChange = () => {};
  let cues = {};           // avisos ya dados en el descanso actual
  let holdEnd = 0, holdTotal = 0; // cronómetro de ejercicios por tiempo

  const dayOf = (id) => SEMANA.find((d) => d.id === id);
  const exList = (day) => day.bloques.flatMap((b) => b.ejercicios.map((e) => ({ e, tipo: b.tipo })));
  function steps(day) {
    const out = []; let k = 0;
    day.bloques.forEach((b) => b.ejercicios.forEach((e) => {
      const n = typeof e.series === "number" ? e.series : 1;
      for (let s = 0; s < n; s++) out.push({ ex: k, s, n });
      k++;
    }));
    return out;
  }
  const save = () => { if (st) R.store.put(KEY, st); else R.store.del(KEY); onChange(); };
  const speakReps = (r) => String(r).replace(/–/g, " a ").replace(/×/g, " por ");

  // ---------- Pantalla siempre encendida ----------
  async function lockScreen() { try { if ("wakeLock" in navigator && !wake) { wake = await navigator.wakeLock.request("screen"); wake.addEventListener("release", () => { wake = null; }); } } catch { /* no soportado */ } }
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && root && !root.hidden) { lockScreen(); render(); } });

  // ---------- Estructura de la pantalla ----------
  function build() {
    if (root) return;
    root = document.createElement("div");
    root.id = "session"; root.hidden = true;
    root.innerHTML = `
      <div class="s-top">
        <button class="s-icon" id="sClose" aria-label="Pausar sesión">✕</button>
        <div class="s-prog" id="sProg"></div>
        <div class="s-clock" id="sClock">0:00</div>
        <button class="s-icon" id="sVoice" aria-label="Voz">🔊</button>
      </div>
      <div class="s-body" id="sBody"></div>`;
    document.body.appendChild(root);
    root.querySelector("#sClose").addEventListener("click", pause);
    const vb = root.querySelector("#sVoice");
    const vIcon = () => { vb.textContent = V.on ? "🔊" : "🔇"; };
    vb.addEventListener("click", () => { V.toggle(); vIcon(); }); vIcon();
  }

  function open() {
    build(); root.hidden = false; document.body.classList.add("in-session");
    lockScreen(); render();
    clearInterval(loop); loop = setInterval(tickLoop, 200);
  }
  function hide() {
    if (!root) return;
    root.hidden = true; document.body.classList.remove("in-session");
    clearInterval(loop); loop = null;
    if (wake) { wake.release().catch(() => {}); wake = null; }
    root.querySelectorAll(".s-fig").forEach((h) => FIGURAS.unmount(h));
    onChange();
  }
  function pause() {
    if (st && st.phase !== "done" && !confirm("¿Pausar la sesión? Podrás continuarla desde el botón 'Continuar'.")) return;
    if (st && st.phase === "done") { st = null; save(); }
    hide();
  }

  // ---------- Inicio ----------
  function start(dayId) {
    V.unlock();
    if (st && !(st.dayId === dayId) && !confirm("Tienes otra sesión en curso. ¿Empezar esta y descartar la otra?")) return;
    if (!st || st.dayId !== dayId) {
      st = { dayId, fecha: R.dateKey(), i: 0, phase: "work", startedAt: Date.now(), restEnd: 0, restTotal: 0 };
      save();
      const d = dayOf(dayId), first = exList(d)[0].e;
      setTimeout(() => V.say(`Empezamos ${d.nombre}. Primer ejercicio: ${first.nombre}. ${first.series} series de ${speakReps(first.reps)}.`), 250);
    }
    open();
  }
  const resume = () => { if (st) { V.unlock(); open(); } };

  // ---------- Transiciones ----------
  function announceWork() {
    const d = dayOf(st.dayId), sp = steps(d)[st.i], { e } = exList(d)[sp.ex];
    if (sp.s === 0) V.say(`${e.nombre}. ${sp.n > 1 ? sp.n + " series de " : ""}${speakReps(e.reps)}.`);
    else V.say(`Serie ${sp.s + 1} de ${sp.n}.`);
  }

  function setDone() {
    const d = dayOf(st.dayId), all = steps(d), sp = all[st.i], { e } = exList(d)[sp.ex];
    // Guarda carga y marca la serie
    if (R.efectivo(e)) {
      const kg = root.querySelector("#inKg")?.value ?? "", reps = root.querySelector("#inReps")?.value ?? "";
      R.logSet(e.nombre, st.fecha, sp.s, kg, reps);
    }
    const sets = R.getSets(st.fecha, st.dayId);
    const arr = sets[sp.ex] || (sets[sp.ex] = Array(sp.n).fill(false)); arr[sp.s] = true;
    R.saveSets(st.fecha, st.dayId, sets);
    holdEnd = 0;

    const next = st.i + 1;
    if (next >= all.length) return finish();
    const rest = R.parseRest(e.descanso);
    const changing = all[next].ex !== sp.ex;
    st.i = next;
    if (rest > 0) { st.phase = "rest"; st.restTotal = rest; st.restEnd = Date.now() + rest * 1000; cues = {}; }
    else st.phase = "work";
    save(); render();
    // Primero la motivación, luego la información del descanso o del siguiente ejercicio
    const info = rest > 0 ? V.restPhrase(rest) + (changing ? `. Luego: ${exList(d)[all[next].ex].e.nombre}.` : ".") : null;
    const hype = window.MOTIVA ? MOTIVA.play(changing ? "ejercicio" : "serie") : Promise.resolve();
    const step = st.i;
    hype.then(() => {
      if (!st || st.i !== step) return;
      if (info && st.phase === "rest") V.say(info, { queue: true });
      else if (!info && st.phase === "work") announceWork();
    });
  }
  function endRest() { if (window.MOTIVA) MOTIVA.stop(); st.phase = "work"; st.restEnd = 0; save(); V.go(); announceWork(); render(); }
  function prev() { if (st.i > 0) { st.i--; st.phase = "work"; holdEnd = 0; save(); render(); } }
  function skipExercise() {
    const all = steps(dayOf(st.dayId)), cur = all[st.i].ex;
    let j = st.i; while (j < all.length && all[j].ex === cur) j++;
    if (j >= all.length) return finish();
    st.i = j; st.phase = "work"; holdEnd = 0; save(); announceWork(); render();
  }
  function addRest(sec) { st.restEnd += sec * 1000; st.restTotal = Math.max(1, st.restTotal + sec); save(); }

  function finish() {
    const d = dayOf(st.dayId), exs = exList(d);
    let series = 0, vol = 0; const prs = [];
    exs.forEach(({ e }) => {
      const t = R.today(e.nombre, st.fecha); if (!t) return;
      const done = t.sets.filter(Boolean); series += done.length;
      done.forEach((s) => { vol += (s.kg || 0) * (s.reps || 0); });
      const best = Math.max(0, ...done.map((s) => R.e1rm(s.kg, s.reps)));
      const prevBest = Math.max(0, ...R.history(e.nombre).filter((h) => h.fecha < st.fecha).flatMap((h) => h.sets.filter(Boolean).map((s) => R.e1rm(s.kg, s.reps))));
      if (best > 0 && prevBest > 0 && best > prevBest) prs.push(e.nombre);
    });
    const dur = Math.round((Date.now() - st.startedAt) / 60000);
    R.saveSession({ fecha: st.fecha, dia: d.id, nombre: d.nombre, minutos: dur, series, volumen: Math.round(vol), prs });
    st.phase = "done"; st.summary = { dur, series, vol: Math.round(vol), prs };
    save(); V.done();
    const resumen = `Sesión terminada. ${series} series en ${dur} minutos.`;
    setTimeout(() => { (window.MOTIVA ? MOTIVA.play("final") : Promise.resolve()).then(() => V.say(resumen, { queue: true })); }, 700);
    render();
  }

  // ---------- Bucle de tiempo ----------
  function tickLoop() {
    if (!st || !root || root.hidden) return;
    const clk = root.querySelector("#sClock");
    if (clk && st.phase !== "done") clk.textContent = R.clock((Date.now() - st.startedAt) / 1000);
    if (st.phase === "rest") {
      const left = (st.restEnd - Date.now()) / 1000;
      const secs = Math.ceil(left);
      const big = root.querySelector("#restBig"), ring = root.querySelector("#restRing");
      if (big) big.textContent = R.clock(secs);
      if (ring) { const C = +ring.dataset.c; ring.style.strokeDashoffset = C * (1 - Math.max(0, left) / st.restTotal); }
      root.querySelector(".s-rest")?.classList.toggle("urgent", secs <= 10);
      if (secs <= 10 && secs > 3 && !cues.t10 && st.restTotal >= 20) { cues.t10 = 1; V.say("Quedan diez segundos"); }
      [3, 2, 1].forEach((n) => { if (secs === n && !cues["b" + n]) { cues["b" + n] = 1; V.tick(); } });
      if (left <= 0) endRest();
    }
    if (holdEnd) {
      const left = (holdEnd - Date.now()) / 1000, b = root.querySelector("#holdBtn");
      if (b) { b.querySelector("span").textContent = R.clock(Math.ceil(left)); b.style.setProperty("--p", Math.max(0, left) / holdTotal); }
      if (left <= 0) { holdEnd = 0; V.go(); V.say("Tiempo"); if (b) { b.classList.remove("running"); b.querySelector("span").textContent = "Listo ✓"; } }
    }
  }

  // ---------- Dibujo ----------
  function progress(day, all) {
    const exs = exList(day), cur = st.phase === "done" ? all.length : st.i;
    return exs.map(({ tipo }, k) => {
      const mine = all.map((s, i) => [s, i]).filter(([s]) => s.ex === k);
      const done = mine.filter(([, i]) => i < cur).length;
      return `<i style="--c:var(--c-${tipo})"><b style="width:${(done / mine.length) * 100}%"></b></i>`;
    }).join("");
  }

  function mountFig(sel, key) {
    const h = root.querySelector(sel); if (!h) return;
    FIGURAS.mount(h, key, 0);
  }

  function render() {
    if (!root || !st) return;
    root.querySelectorAll(".s-fig").forEach((h) => FIGURAS.unmount(h));
    const d = dayOf(st.dayId), all = steps(d), exs = exList(d), body = root.querySelector("#sBody");
    root.querySelector("#sProg").innerHTML = progress(d, all);
    root.dataset.phase = st.phase;

    if (st.phase === "done") {
      const s = st.summary || {};
      root.querySelector("#sClock").textContent = "✓";
      body.innerHTML = `<div class="s-done">
        <div class="s-trophy">🏆</div>
        <div class="eyebrow">${R.esc(d.nombre)} · ${R.fmtLong(R.fromKey(st.fecha))}</div>
        <h2>¡Sesión terminada!</h2>
        <div class="s-sum">
          <div><b>${s.dur}</b><small>minutos</small></div>
          <div><b>${s.series}</b><small>series registradas</small></div>
          <div><b>${(s.vol || 0).toLocaleString("es-CO")}</b><small>kg de volumen</small></div>
        </div>
        ${s.prs && s.prs.length ? `<div class="s-prs"><div class="eyebrow">Nuevos récords</div>${s.prs.map((p) => `<span>${R.esc(p)}</span>`).join("")}</div>` : ""}
        <button class="s-main" id="sExit">Cerrar</button></div>`;
      body.querySelector("#sExit").addEventListener("click", () => { st = null; save(); hide(); });
      return;
    }

    const sp = all[st.i], { e, tipo } = exs[sp.ex];
    const exNum = sp.ex + 1, exTot = exs.length;

    if (st.phase === "rest") {
      const C = 2 * Math.PI * 120, prevSp = all[st.i - 1];
      const changing = prevSp && prevSp.ex !== sp.ex;
      body.innerHTML = `<div class="s-rest">
        <div class="eyebrow">${changing ? "Descanso · cambio de ejercicio" : "Descanso"}</div>
        <div class="s-ringwrap">
          <svg viewBox="0 0 260 260"><circle class="r-bg" cx="130" cy="130" r="120"/><circle class="r-fg" id="restRing" data-c="${C}" cx="130" cy="130" r="120" stroke-dasharray="${C}" style="stroke-dashoffset:0"/></svg>
          <div class="s-big" id="restBig">${R.clock(st.restTotal)}</div>
        </div>
        <div class="s-rest-btns">
          <button class="s-sec" id="rMinus">−15 s</button>
          <button class="s-main ghost" id="rSkip">Saltar descanso ▶</button>
          <button class="s-sec" id="rPlus">+15 s</button>
        </div>
        <div class="s-next">
          <div class="s-fig s-fig-sm"></div>
          <div><div class="eyebrow">Siguiente</div><b>${R.esc(e.nombre)}</b><small>Serie ${sp.s + 1} de ${sp.n} · ${R.esc(e.reps)}${e.rir !== "—" ? " · RIR " + R.esc(e.rir) : ""}</small></div>
        </div></div>`;
      mountFig(".s-fig", e.anim);
      body.querySelector("#rMinus").addEventListener("click", () => addRest(-15));
      body.querySelector("#rPlus").addEventListener("click", () => addRest(15));
      body.querySelector("#rSkip").addEventListener("click", endRest);
      tickLoop();
      return;
    }

    // ----- Trabajo -----
    const ef = R.efectivo(e);
    const todayE = R.today(e.nombre, st.fecha), last = R.lastBefore(e.nombre, st.fecha), sug = R.suggestion(e, st.fecha);
    const r = R.repRange(e.reps);
    const cur = todayE && todayE.sets[sp.s], prevToday = todayE && todayE.sets[sp.s - 1];
    const lastSame = last && (last.sets[sp.s] || last.sets.filter(Boolean).pop());
    const kgDef = cur?.kg ?? prevToday?.kg ?? (sug && sug.type === "up" ? sug.kg : lastSame?.kg) ?? "";
    const repsDef = cur?.reps ?? lastSame?.reps ?? (r ? r[1] : "");
    const hold = R.parseTime(e.reps);
    const isLastSet = sp.s === sp.n - 1, isLastStep = st.i === all.length - 1;
    const label = isLastStep ? "Finalizar día ✓" : isLastSet ? "Terminar ejercicio ✓" : "Serie hecha ✓";

    body.innerHTML = `<div class="s-work" style="--c:var(--c-${tipo})">
      <div class="s-meta"><span class="tag">${TIPOS[tipo]}</span><span>Ejercicio ${exNum}/${exTot}</span></div>
      <h2>${R.esc(e.nombre)}</h2>
      <div class="s-stage"><div class="s-fig"></div></div>
      <div class="s-setrow">
        <div class="s-setnum"><small>Serie</small><b>${sp.s + 1}<i>/${sp.n}</i></b></div>
        <div class="s-target"><div><small>Objetivo</small><b>${R.esc(e.reps)}</b></div><div><small>RIR</small><b>${R.esc(e.rir)}</b></div><div><small>Descanso</small><b>${R.esc(e.descanso)}</b></div></div>
      </div>
      ${ef ? `
        ${last ? `<div class="s-last">Última vez (${R.fmtDay(R.fromKey(last.fecha))}): <b>${R.esc(R.setsText(last))}</b></div>` : `<div class="s-last">Primera vez registrando este ejercicio</div>`}
        ${sug ? `<div class="s-sug ${sug.type}">${sug.type === "up" ? "▲" : sug.type === "down" ? "▼" : "●"} ${R.esc(sug.text)}</div>` : ""}
        <div class="s-inputs">
          <label><small>Peso (kg)</small><div class="stepper"><button data-f="inKg" data-d="-1">−</button><input id="inKg" type="number" inputmode="decimal" step="0.5" value="${kgDef}" placeholder="kg"><button data-f="inKg" data-d="1">+</button></div></label>
          <label><small>Repeticiones</small><div class="stepper"><button data-f="inReps" data-d="-1">−</button><input id="inReps" type="number" inputmode="numeric" value="${repsDef}" placeholder="${r ? r[1] : ""}"><button data-f="inReps" data-d="1">+</button></div></label>
        </div>` : ""}
      ${hold ? `<button class="s-hold" id="holdBtn" style="--p:1">▶ Cronómetro <span>${R.clock(hold)}</span></button>` : ""}
      <p class="s-tech">${R.esc(e.tecnica)}</p>
      <div class="s-actions">
        <button class="s-sec" id="wPrev" ${st.i === 0 ? "disabled" : ""}>◀</button>
        <button class="s-main" id="wDone">${label}</button>
        <button class="s-sec" id="wSkip" title="Saltar ejercicio">⏭</button>
      </div></div>`;
    mountFig(".s-fig", e.anim);

    body.querySelectorAll(".stepper button").forEach((b) => b.addEventListener("click", () => {
      const inp = body.querySelector("#" + b.dataset.f), dir = +b.dataset.d;
      const v = parseFloat(inp.value) || 0;
      const step = b.dataset.f === "inKg" ? (v >= 20 ? 2.5 : 1) : 1;
      inp.value = Math.max(0, +(v + dir * step).toFixed(1));
    }));
    const hb = body.querySelector("#holdBtn");
    if (hb) hb.addEventListener("click", () => {
      if (holdEnd) { holdEnd = 0; hb.classList.remove("running"); hb.querySelector("span").textContent = R.clock(hold); return; }
      holdTotal = hold; holdEnd = Date.now() + hold * 1000; hb.classList.add("running"); V.beep(880, 0.1);
    });
    body.querySelector("#wDone").addEventListener("click", setDone);
    body.querySelector("#wPrev").addEventListener("click", prev);
    body.querySelector("#wSkip").addEventListener("click", () => { if (confirm("¿Saltar el resto de este ejercicio?")) skipExercise(); });
  }

  return {
    start, resume,
    active: () => (st && st.phase !== "done" ? st : null),
    onChange(fn) { onChange = fn; }
  };
})();
