// ============================================================
//  Rutina Estética — interfaz principal
// ============================================================
(function () {
  const R = RUT;
  const $ = (s) => document.querySelector(s);
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html !== undefined) n.innerHTML = html; return n; };
  const esc = R.esc, store = R.store, toMin = R.toMin, efectivo = R.efectivo;
  const cvar = (t) => `var(--c-${t})`;
  const fmtMin = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
  const DAY_START = toMin("16:00"), DAY_END = toMin("18:00"), PX = 4;
  const FECHAS = R.weekDates();
  const todayIdx = R.todayIdx, nowMin = R.nowMin;

  let currentDay = store.get("rutina.dia", SEMANA[Math.max(0, todayIdx())].id);
  if (!SEMANA.some((d) => d.id === currentDay)) currentDay = SEMANA[0].id;
  let evFilter = "Todos";

  // ============ Aparición al hacer scroll ============
  const revealIO = new IntersectionObserver((ents) => ents.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); e.target.dispatchEvent(new Event("reveal")); revealIO.unobserve(e.target); }
  }), { threshold: 0.12 });
  const reveal = (n, delay = 0) => { n.classList.add("reveal"); n.style.transitionDelay = `${delay}ms`; revealIO.observe(n); return n; };
  function countUp(node, to, dur = 1200) {
    const t0 = performance.now();
    const step = (t) => { const k = Math.min(1, (t - t0) / dur); node.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  // ============ Pestañas ============
  function moveInd() { const a = document.querySelector(".tab.active"), ind = $("#tabInd"); if (a) { ind.style.left = a.offsetLeft + "px"; ind.style.width = a.offsetWidth + "px"; } }
  function showView(v) {
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.view === v));
    document.querySelectorAll(".view").forEach((s) => s.classList.toggle("active", s.id === `view-${v}`));
    store.set("rutina.vista", v); moveInd();
    if (v === "progreso") PROGRESO.render();
    if (typeof renderResume === "function") renderResume();
  }
  document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => showView(t.dataset.view)));
  window.addEventListener("resize", moveInd);

  // ============ Estado en vivo (con la fecha del dispositivo) ============
  function renderLive() {
    const i = todayIdx(), m = nowMin(), live = $("#live"), txt = $("#liveText");
    const hoy = R.fmtShort(new Date());
    live.classList.remove("on");
    if (i < 0) { txt.innerHTML = `${hoy} · descanso · próxima: <b>Lunes 16:00</b>`; return; }
    const d = SEMANA[i];
    if (m < DAY_START) { const r = DAY_START - m; txt.innerHTML = `${hoy} · <b>${esc(d.nombre)}</b> en ${Math.floor(r / 60)} h ${r % 60} min`; }
    else if (m < DAY_END) { const b = d.bloques.find((x) => m >= toMin(x.inicio) && m < toMin(x.fin)); live.classList.add("on"); txt.innerHTML = `${hoy} · en curso: <b>${b ? TIPOS[b.tipo] : "Sesión"}</b>`; }
    else txt.innerHTML = `${hoy} · <b>${esc(d.nombre)}</b> terminada`;
  }
  $("#live").addEventListener("click", () => { const i = todayIdx(); if (i >= 0) openDay(SEMANA[i].id); });

  // ============ Voz e instalación ============
  const vBtn = $("#voiceBtn");
  const vIcon = () => { vBtn.textContent = VOZ.on ? "🔊" : "🔇"; vBtn.title = VOZ.on ? "Voz activada" : "Voz desactivada"; };
  vBtn.addEventListener("click", () => { VOZ.toggle(); vIcon(); }); vIcon();

  let installEvt = null;
  const iBtn = $("#installBtn");
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installEvt = e; if (!standalone) iBtn.hidden = false; });
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (isIOS && !standalone) iBtn.hidden = false;
  iBtn.addEventListener("click", async () => {
    if (installEvt) { installEvt.prompt(); await installEvt.userChoice; installEvt = null; iBtn.hidden = true; }
    else alert("En iPhone: toca el botón Compartir (el cuadro con la flecha) y elige 'Agregar a inicio'.");
  });
  window.addEventListener("appinstalled", () => { iBtn.hidden = true; });

  // ============ Métricas ============
  const porMusculo = {};
  SEMANA.forEach((d) => d.bloques.forEach((b) => b.ejercicios.forEach((e) => { if (efectivo(e)) porMusculo[e.musculos[0]] = (porMusculo[e.musculos[0]] || 0) + e.series; })));
  const PRIORIDAD = ["Deltoide lateral", "Dorsal", "Pecho superior"];

  function renderStats() {
    const total = Object.values(porMusculo).reduce((a, b) => a + b, 0);
    const items = [
      { k: "Deltoide lateral", v: porMusculo["Deltoide lateral"] || 0, u: "series / semana", hl: true },
      { k: "Dorsal", v: porMusculo["Dorsal"] || 0, u: "series / semana" },
      { k: "Pecho superior", v: porMusculo["Pecho superior"] || 0, u: "series / semana" },
      { k: "Volumen total", v: total, u: "series efectivas" },
      { k: "Sesiones hechas", v: R.sessions().length, u: "registradas" }
    ];
    const wrap = $("#stats"); wrap.innerHTML = "";
    items.forEach((it, i) => {
      const n = el("div", "stat glass" + (it.hl ? " hl" : ""), `<div class="k">${it.k}</div><div class="v">0</div><div class="u">${it.u}</div>
        <svg class="spark" viewBox="0 0 90 40"><path d="M0 34 L15 28 L30 30 L45 18 L60 22 L75 8 L90 12" fill="none" stroke="#ff2d46" stroke-width="3" stroke-linecap="round"/></svg>`);
      wrap.appendChild(reveal(n, i * 70));
      n.addEventListener("reveal", () => countUp(n.querySelector(".v"), it.v));
    });
  }

  function renderBars() {
    const rows = Object.entries(porMusculo).sort((a, b) => b[1] - a[1]).slice(0, 11);
    const max = Math.max(...rows.map((r) => r[1]), 12), box = $("#bars"); box.innerHTML = "";
    rows.forEach(([m, v]) => box.appendChild(el("div", "bar-row" + (PRIORIDAD.includes(m) ? "" : " muted"),
      `<span class="name" title="${esc(m)}">${esc(m)}</span><div class="bar-zone"><div class="bar-track"><div class="bar-fill" data-w="${(v / max) * 100}"></div></div><i class="bar-mark" style="left:${(10 / max) * 100}%"></i></div><span class="val">${v}</span>`)));
    box.closest(".chart").addEventListener("reveal", () => box.querySelectorAll(".bar-fill").forEach((f, i) => setTimeout(() => { f.style.width = f.dataset.w + "%"; }, i * 60)));
  }

  const REGIONES = [["Hombros", ["Deltoide", "Manguito"]], ["Pecho", ["Pecho"]], ["Espalda", ["Dorsal", "Trapecio", "Romboides", "Serrato", "Columna"]],
    ["Brazos", ["Bíceps", "Tríceps"]], ["Piernas", ["Cuádriceps", "Isquio", "Glúteo", "Gemelos"]], ["Core", ["abdominal", "Oblicuos", "Transverso", "Core"]]];
  function renderRadar() {
    const vals = REGIONES.map(([n, ks]) => [n, Object.entries(porMusculo).filter(([m]) => ks.some((k) => m.includes(k))).reduce((a, [, v]) => a + v, 0)]);
    const max = Math.max(...vals.map((v) => v[1])) * 1.1, cx = 130, cy = 118, Rr = 84, n = vals.length;
    const P = (i, r) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; };
    let s = `<svg viewBox="0 0 260 236">`;
    [0.25, 0.5, 0.75, 1].forEach((k) => { s += `<polygon class="grid-poly" points="${vals.map((_, i) => P(i, Rr * k).join(",")).join(" ")}"/>`; });
    vals.forEach((_, i) => { const [x, y] = P(i, Rr); s += `<line class="axis" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/>`; });
    const pts = vals.map(([, v], i) => P(i, (v / max) * Rr));
    s += `<polygon class="area" points="${pts.map((p) => p.join(",")).join(" ")}"/>`;
    pts.forEach((p) => { s += `<circle class="dot" cx="${p[0]}" cy="${p[1]}" r="3.5"/>`; });
    vals.forEach(([nm, v], i) => { const [x, y] = P(i, Rr + 18); s += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle">${nm} · ${v}</text>`; });
    $("#radar").innerHTML = s + "</svg>";
    $("#radar").closest(".chart").addEventListener("reveal", () => $("#radar .area").classList.add("grow"));
  }

  function renderDonut() {
    const mins = {}; let total = 0;
    SEMANA.forEach((d) => d.bloques.forEach((b) => { const m = toMin(b.fin) - toMin(b.inicio); mins[b.tipo] = (mins[b.tipo] || 0) + m; total += m; }));
    const r = 70, C = 2 * Math.PI * r; let acc = 0;
    let s = `<svg viewBox="0 0 200 200"><g transform="rotate(-90 100 100)">`;
    Object.entries(mins).forEach(([t, m]) => { const len = (m / total) * C; s += `<circle class="seg" cx="100" cy="100" r="${r}" stroke="${cvar(t)}" stroke-dasharray="0 ${C}" data-d="${Math.max(0, len - 2)} ${C}" stroke-dashoffset="${-acc}"/>`; acc += len; });
    s += `</g><text class="center-v" x="100" y="98" text-anchor="middle">${Math.round((mins.prioridad / total) * 100)}%</text><text class="center-k" x="100" y="116" text-anchor="middle">deltoide lateral</text></svg>`;
    $("#donut").innerHTML = s;
    $("#donutLegend").innerHTML = Object.entries(mins).map(([t, m]) => `<span><i class="dot" style="background:${cvar(t)}"></i>${TIPOS[t]} · ${m}′</span>`).join("");
    $("#donut").closest(".chart").addEventListener("reveal", () => $("#donut").querySelectorAll(".seg").forEach((c, i) => setTimeout(() => c.setAttribute("stroke-dasharray", c.dataset.d), i * 120)));
  }

  // ============ Calendario ============
  function renderCalendar() {
    const cal = $("#calendar"); cal.innerHTML = "";
    const times = el("div", "cal-times"); times.appendChild(el("div"));
    for (let m = 0; m < 120; m += 10) times.appendChild(el("div", "", fmtMin(DAY_START + m)));
    cal.appendChild(times);
    const ti = todayIdx(), nm = nowMin(); let k = 0;
    SEMANA.forEach((d, di) => {
      const col = el("div", "cal-col" + (di === ti ? " today" : ""));
      const head = el("div", "cal-head", `<b>${d.dia} <span class="cal-date">${R.fmtDay(FECHAS[di])}</span></b><small>${esc(d.nombre)}</small>`);
      head.addEventListener("click", () => openDay(d.id));
      const body = el("div", "cal-body");
      d.bloques.forEach((b) => {
        const top = (toMin(b.inicio) - DAY_START) * PX, h = (toMin(b.fin) - toMin(b.inicio)) * PX;
        const bl = el("div", "cal-block " + b.tipo);
        Object.assign(bl.style, { top: top + 2 + "px", height: h - 4 + "px", transitionDelay: `${k++ * 35}ms` });
        bl.style.setProperty("--c", cvar(b.tipo));
        bl.innerHTML = `<b>${TIPOS[b.tipo]}</b><span>${b.inicio}–${b.fin}</span>` + (h >= 100 ? `<div class="ex">${b.ejercicios.map((e) => "· " + esc(e.nombre)).join("<br>")}</div>` : "");
        bl.addEventListener("click", () => openDay(d.id));
        body.appendChild(bl);
      });
      if (di === ti && nm >= DAY_START && nm < DAY_END) { const line = el("div", "now-line"); line.style.top = (nm - DAY_START) * PX + "px"; body.appendChild(line); }
      col.append(head, body); cal.appendChild(col);
    });
    cal.closest(".calendar-wrap").addEventListener("reveal", () => cal.classList.add("in"));
    $("#restDays").innerHTML = DESCANSO.map((d) => `<div class="rest glass"><b>${d.dia}</b>${esc(d.nota)}</div>`).join("");
  }

  // ============ Temporizador de la tarjeta ============
  let activeTimer = null;
  function makeTimer(secs) {
    const C = 2 * Math.PI * 10;
    const btn = el("button", "timer", `<svg viewBox="0 0 26 26"><circle class="t-bg" cx="13" cy="13" r="10"/><circle class="t-fg" cx="13" cy="13" r="10" stroke-dasharray="${C}" stroke-dashoffset="0"/></svg><span>${R.clock(secs)}</span>`);
    btn.title = "Iniciar descanso";
    const fg = btn.querySelector(".t-fg"), lbl = btn.querySelector("span");
    const reset = () => { btn.classList.remove("running"); fg.setAttribute("stroke-dashoffset", 0); lbl.textContent = R.clock(secs); };
    btn.addEventListener("click", () => {
      VOZ.unlock();
      if (activeTimer && activeTimer.btn === btn) { clearInterval(activeTimer.id); activeTimer = null; reset(); return; }
      if (activeTimer) { clearInterval(activeTimer.id); activeTimer.reset(); }
      btn.classList.remove("finished"); btn.classList.add("running");
      const end = Date.now() + secs * 1000, cues = {};
      const tick = () => {
        const left = Math.max(0, (end - Date.now()) / 1000), s = Math.ceil(left);
        lbl.textContent = R.clock(s); fg.setAttribute("stroke-dashoffset", C * (1 - left / secs));
        [3, 2, 1].forEach((n) => { if (s === n && !cues[n]) { cues[n] = 1; VOZ.tick(); } });
        if (left <= 0) { clearInterval(activeTimer.id); activeTimer = null; reset(); btn.classList.add("finished"); VOZ.go(); }
      };
      activeTimer = { btn, reset, id: setInterval(tick, 200) }; tick();
    });
    return btn;
  }

  // ============ Vista del día ============
  function openDay(id) { currentDay = id; store.set("rutina.dia", id); renderDay(); showView("dia"); window.scrollTo({ top: 0, behavior: "smooth" }); }

  function renderDay() {
    const fecha = R.dateKey();
    const picker = $("#dayPicker"); picker.innerHTML = "";
    SEMANA.forEach((d, i) => {
      const c = el("button", "chip" + (d.id === currentDay ? " active" : ""), `<b>${d.dia.slice(0, 3)} ${FECHAS[i].getDate()}</b> · ${esc(d.nombre)}${i === todayIdx() ? " ●" : ""}`);
      c.addEventListener("click", () => { currentDay = d.id; store.set("rutina.dia", d.id); renderDay(); });
      picker.appendChild(c);
    });

    const d = SEMANA.find((x) => x.id === currentDay), di = SEMANA.indexOf(d);
    const state = R.getSets(fecha, d.id);
    const allEx = d.bloques.flatMap((b) => b.ejercicios);
    const totalEf = allEx.filter(efectivo).reduce((a, e) => a + e.series, 0);
    const act = SESION.active(), mine = act && act.dayId === d.id;
    const isToday = di === todayIdx();

    const hero = $("#dayHero"), C = 2 * Math.PI * 42;
    const segs = d.bloques.map((b) => `<div class="tl-seg" title="${TIPOS[b.tipo]} ${b.inicio}–${b.fin}" style="--c:${cvar(b.tipo)};flex:${toMin(b.fin) - toMin(b.inicio)}"></div>`).join("");
    const nm = nowMin(), showNow = isToday && nm >= DAY_START && nm < DAY_END;
    const fechaTxt = R.fmtLong(FECHAS[di]);
    hero.innerHTML = `
      <div>
        <div class="eyebrow">${isToday ? "Hoy · " : ""}${fechaTxt} · 16:00–18:00</div>
        <h2>${esc(d.nombre)}</h2>
        <p>${esc(d.enfoque)} · ${allEx.length} ejercicios · ${totalEf} series efectivas</p>
        <div class="day-actions">
          <button class="btn-start" id="startDay"><span class="play">▶</span>${mine ? "Continuar sesión" : "Iniciar día"}</button>
          <button class="btn" id="resetSets">Reiniciar series</button>
        </div>
        ${!isToday && !mine ? `<p class="hint">Hoy es ${R.fmtLong(new Date())}. Puedes iniciar este día igual si lo cambiaste de fecha.</p>` : ""}
      </div>
      <div class="ring-wrap"><svg viewBox="0 0 100 100"><circle class="ring-bg" cx="50" cy="50" r="42"/><circle class="ring-fg" id="ringFg" cx="50" cy="50" r="42" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg>
        <div class="ring-label"><div><b id="ringVal">0</b><br><small>series hoy</small></div></div></div>
      <div class="timeline"><div class="tl-bar">${segs}${showNow ? `<i class="tl-now" style="left:${((nm - DAY_START) / 120) * 100}%"></i>` : ""}</div>
        <div class="tl-labels"><span>16:00</span><span>16:30</span><span>17:00</span><span>17:30</span><span>18:00</span></div></div>`;
    const updateRing = () => {
      let done = 0; const st2 = R.getSets(fecha, d.id);
      allEx.forEach((e, i) => { if (efectivo(e)) done += (st2[i] || []).filter(Boolean).length; });
      $("#ringVal").textContent = `${done}/${totalEf}`;
      $("#ringFg").setAttribute("stroke-dashoffset", C * (1 - (totalEf ? done / totalEf : 0)));
    };
    requestAnimationFrame(updateRing);
    $("#startDay").addEventListener("click", () => SESION.start(d.id));
    $("#resetSets").addEventListener("click", () => { if (confirm("¿Borrar las series marcadas hoy para este día?")) { R.saveSets(fecha, d.id, {}); renderDay(); } });

    const wrap = $("#dayBlocks"); wrap.innerHTML = "";
    let exIdx = 0, n = 0;
    d.bloques.forEach((b) => {
      const sec = el("div", "block"); sec.style.setProperty("--c", cvar(b.tipo));
      sec.appendChild(el("div", "block-title", `<span class="tag">${TIPOS[b.tipo]}</span><span class="time">${b.inicio}–${b.fin}</span><span class="rule"></span>`));
      const cards = el("div", "cards");
      b.ejercicios.forEach((e) => { const idx = exIdx++; cards.appendChild(reveal(renderCard(e, b, idx, ++n, state, d.id, fecha, updateRing), (n % 3) * 80)); });
      sec.appendChild(cards); wrap.appendChild(sec);
    });
  }

  function renderCard(e, b, idx, num, state, dayId, fecha, onChange) {
    const card = el("article", "card glass"); card.style.setProperty("--c", cvar(b.tipo));
    const stage = el("div", "stage", `<span class="badge-n">${String(num).padStart(2, "0")}</span><span class="badge-t">${esc(e.musculos[0])}</span>`);
    card.appendChild(stage); FIGURAS.mount(stage, e.anim, Math.random() * 1500);

    const cites = e.estudios.length ? e.estudios.map((id) => ESTUDIOS[id] ? `<button class="cite" data-study="${id}">${esc(ESTUDIOS[id].autores.split(/[ ,]/)[0])} ${ESTUDIOS[id].anio}</button>` : "").join("") : `<span class="no-cite">Preparación / movilidad</span>`;
    const ef = efectivo(e), last = ef ? R.lastBefore(e.nombre, fecha) : null, sug = ef ? R.suggestion(e, fecha) : null;
    const body = el("div", "body", `
      <h3>${esc(e.nombre)}</h3>
      <div class="muscles">${e.musculos.map((m, i) => `<span class="muscle${i === 0 ? " main" : ""}">${esc(m)}</span>`).join("")}</div>
      <div class="params">
        <div class="param"><div class="k">Series</div><div class="v">${e.series}</div></div>
        <div class="param"><div class="k">Reps</div><div class="v">${esc(e.reps)}</div></div>
        <div class="param"><div class="k">RIR</div><div class="v">${esc(e.rir)}</div></div>
        <div class="param"><div class="k">Descanso</div><div class="v">${esc(e.descanso)}</div></div>
      </div>
      ${ef ? `<div class="lastlog">${last ? `<span>Última (${R.fmtDay(R.fromKey(last.fecha))}):</span> <b>${esc(R.setsText(last))}</b>` : `<span>Sin registros todavía</span>`}
        <button class="hist-btn" title="Ver historial">📈</button></div>` : ""}
      ${sug ? `<div class="sug ${sug.type}">${sug.type === "up" ? "▲" : sug.type === "down" ? "▼" : "●"} ${esc(sug.text)}</div>` : ""}
      <p class="tech">${esc(e.tecnica)}</p>`);

    if (typeof e.series === "number") {
      const sets = el("div", "sets", `<span class="lbl">Series</span>`);
      const arr = state[idx] || (state[idx] = Array(e.series).fill(false));
      const sync = () => card.classList.toggle("done", arr.every(Boolean));
      for (let s = 0; s < e.series; s++) {
        const dot = el("button", "set-dot" + (arr[s] ? " on" : ""), s + 1);
        dot.addEventListener("click", () => { arr[s] = !arr[s]; dot.classList.toggle("on", arr[s]); R.saveSets(fecha, dayId, state); sync(); onChange(); });
        sets.appendChild(dot);
      }
      sync(); body.appendChild(sets);
    }
    const foot = el("div", "card-foot", `<div class="cites">${cites}</div>`);
    const secs = R.parseRest(e.descanso); if (secs) foot.appendChild(makeTimer(secs));
    body.appendChild(foot);
    body.querySelectorAll(".cite").forEach((btn) => btn.addEventListener("click", () => openStudy(btn.dataset.study)));
    const hb = body.querySelector(".hist-btn"); if (hb) hb.addEventListener("click", () => openHistory(e));
    card.appendChild(body);
    return card;
  }

  // ============ Aviso de sesión en curso ============
  function renderResume() {
    const bar = $("#resumeBar"), act = SESION.active();
    if (!act || document.body.classList.contains("in-session")) { bar.hidden = true; return; }
    const d = SEMANA.find((x) => x.id === act.dayId);
    bar.innerHTML = `<span class="pulse"></span><div><small>Sesión en curso</small><b>${esc(d.nombre)}</b></div><button class="btn-start sm" id="resumeGo">▶ Continuar</button>`;
    bar.hidden = false;
    $("#resumeGo").addEventListener("click", SESION.resume);
  }
  SESION.onChange(() => { renderResume(); if ($("#view-dia").classList.contains("active")) renderDay(); if ($("#view-progreso").classList.contains("active")) PROGRESO.renderSesiones(); });

  // ============ Evidencia ============
  const usosDe = (id) => [...new Set(SEMANA.flatMap((d) => d.bloques.flatMap((b) => b.ejercicios.filter((e) => e.estudios.includes(id)).map((e) => e.nombre))))];
  function studyHTML(id, s) {
    const usos = usosDe(id);
    return `<div class="meta"><span class="badge">${esc(s.tipo)}</span><span>${esc(s.tema)}</span><span class="year">${s.anio}</span></div>
      <h3>${esc(s.titulo)}</h3><p class="authors">${esc(s.autores)} — <i>${esc(s.revista)}</i></p>
      <div class="lbl">Hallazgo</div><p>${esc(s.hallazgo)}</p>
      <div class="lbl">Cómo se aplica</div><p>${esc(s.aplicacion)}</p>
      ${usos.length ? `<div class="used">Usado en: ${usos.map(esc).join(", ")}</div>` : ""}
      <a class="link" href="${esc(s.url)}" target="_blank" rel="noopener">Ver estudio ↗</a>`;
  }
  function renderMethod() {
    const tipos = {}; Object.values(ESTUDIOS).forEach((s) => { tipos[s.tipo] = (tipos[s.tipo] || 0) + 1; });
    const rows = Object.entries(tipos).sort((a, b) => b[1] - a[1]), max = Math.max(...rows.map((r) => r[1])), m = $("#method");
    m.innerHTML = `<div><div class="eyebrow">Metodología base</div><h2>${esc(METODOLOGIA.fuente)}</h2>
        <ul>${METODOLOGIA.principios.map((p) => `<li>${esc(p)}</li>`).join("")}</ul><p>${esc(METODOLOGIA.nota)}</p></div>
      <div><div class="eyebrow">Tipo de evidencia</div><h2>${Object.keys(ESTUDIOS).length} estudios</h2>
        <div class="bars">${rows.map(([t, v]) => `<div class="bar-row"><span class="name">${esc(t)}</span><div class="bar-track"><div class="bar-fill" data-w="${(v / max) * 100}"></div></div><span class="val">${v}</span></div>`).join("")}</div></div>`;
    reveal(m); m.addEventListener("reveal", () => m.querySelectorAll(".bar-fill").forEach((f, i) => setTimeout(() => { f.style.width = f.dataset.w + "%"; }, i * 90)));
  }
  function renderEvidence() {
    const temas = ["Todos", ...new Set(Object.values(ESTUDIOS).map((s) => s.tema))], fl = $("#evFilters"); fl.innerHTML = "";
    temas.forEach((t) => { const c = el("button", "chip" + (t === evFilter ? " active" : ""), esc(t)); c.addEventListener("click", () => { evFilter = t; renderEvidence(); }); fl.appendChild(c); });
    const ev = $("#evidence"); ev.innerHTML = "";
    Object.entries(ESTUDIOS).filter(([, s]) => evFilter === "Todos" || s.tema === evFilter).forEach(([id, s], i) => ev.appendChild(reveal(el("article", "study glass", studyHTML(id, s)), (i % 3) * 70)));
  }

  // ============ Panel lateral ============
  function openDrawer(html) {
    $("#drawerBody").innerHTML = html;
    $("#drawer").classList.add("open"); $("#drawer").setAttribute("aria-hidden", "false");
    const bd = $("#drawerBackdrop"); bd.hidden = false; requestAnimationFrame(() => bd.classList.add("show"));
  }
  function closeDrawer() {
    $("#drawer").classList.remove("open"); $("#drawer").setAttribute("aria-hidden", "true");
    const bd = $("#drawerBackdrop"); bd.classList.remove("show"); setTimeout(() => { bd.hidden = true; }, 250);
  }
  const openStudy = (id) => { const s = ESTUDIOS[id]; if (s) openDrawer(`<article class="study">${studyHTML(id, s)}</article>`); };
  function openHistory(e) {
    const h = R.history(e.nombre);
    const top = h.map((x) => ({ x: R.fmtDay(R.fromKey(x.fecha)), y: Math.max(0, ...x.sets.filter(Boolean).map((s) => s.kg || 0)) || null }));
    const est = h.map((x) => ({ x: R.fmtDay(R.fromKey(x.fecha)), y: Math.round(Math.max(0, ...x.sets.filter(Boolean).map((s) => R.e1rm(s.kg, s.reps)))) || null }));
    const sug = R.suggestion(e, R.dateKey());
    openDrawer(`<div class="hist"><div class="eyebrow">Historial</div><h3>${esc(e.nombre)}</h3>
      <p class="muted">Objetivo: ${esc(e.series)} × ${esc(e.reps)} · RIR ${esc(e.rir)}</p>
      ${sug ? `<div class="sug ${sug.type}">${esc(sug.text)}</div>` : ""}
      <div class="pg-legend"><span><i style="background:#ff2d46"></i>Peso máximo</span><span><i style="background:#e7e7ea"></i>1RM estimado</span></div>
      ${R.lineChart([{ name: "Peso", color: "#ff2d46", pts: top }, { name: "1RM", color: "#e7e7ea", pts: est }])}
      <div class="pg-list">${h.slice().reverse().map((x) => `<div><span>${R.fmtShort(R.fromKey(x.fecha))}</span><b>${esc(R.setsText(x))}</b></div>`).join("") || `<div class="empty">Registra pesos en el modo "Iniciar día" y aparecerán aquí.</div>`}</div></div>`);
  }
  $("#drawerClose").addEventListener("click", closeDrawer);
  $("#drawerBackdrop").addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });

  // ============ App instalable (service worker) ============
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  // ============ Inicio ============
  renderLive(); setInterval(renderLive, 30000);
  renderStats(); renderBars(); renderRadar(); renderDonut(); renderCalendar();
  renderDay(); renderMethod(); renderEvidence(); renderResume();
  document.querySelectorAll(".reveal:not(.in)").forEach((n) => revealIO.observe(n));
  const params = new URLSearchParams(location.search);
  showView(params.get("vista") || store.get("rutina.vista", "semana"));
  if (params.get("iniciar") === "hoy" && todayIdx() >= 0) { openDay(SEMANA[todayIdx()].id); }
  if (document.fonts) document.fonts.ready.then(moveInd);
})();
