// ============================================================
//  MOTIVACIÓN
//  En los últimos segundos de cada descanso aparece un video (o una
//  animación con grito) en el centro, con todo lo demás desenfocado.
//  Videos y audios los sube el usuario y se guardan solo en su equipo.
// ============================================================
window.MOTIVA = (function () {
  const R = RUT, V = VOZ;
  const KEY = "rutina.motiva";            // "todo" | "clips" | "frases" | "off"
  const KEY_S = "rutina.motiva.seg";      // segundos antes de empezar
  const EVENTS = { serie: "Cambio de serie", ejercicio: "Cambio de ejercicio", final: "Final del día", cualquiera: "Cualquier momento" };

  const FRASES = {
    serie: [
      "¡Yeah buddy!", "¡Light weight, baby!", "¡Una más, vamos!", "¡Eso es, bestia!", "¡Así se entrena!",
      "¡Nada de excusas!", "¡A romperla!", "¡Más fuerte que ayer!", "¡Vamos, que se puede!", "¡Ese músculo está creciendo!",
      "¡Ain't nothing but a peanut!", "¡Concéntrate y dale!"
    ],
    ejercicio: [
      "¡Siguiente ejercicio! ¡Yeah buddy!", "¡Nueva máquina, misma bestia!", "¡Everybody wants to be a bodybuilder!",
      "¡Uno menos en la lista!", "¡Así se construye la forma de V!", "¡Hombros de piedra, vamos!", "¡Hoy no se negocia!"
    ],
    final: [
      "¡Sesión terminada! ¡Light weight, baby!", "¡Día completo! ¡Eres una máquina!", "¡Yeah buddy! ¡Nos vemos en la próxima!", "¡Otro día más cerca del físico que quieres!"
    ]
  };

  const mode = () => R.store.get(KEY, "todo");
  const setMode = (m) => R.store.set(KEY, m);
  const seconds = () => Math.max(3, Math.min(20, +R.store.get(KEY_S, "6") || 6));
  const enabled = () => mode() !== "off" && V.on;
  const last = {};
  const pick = (arr, k) => { if (!arr.length) return null; if (arr.length < 2) return arr[0]; let i; do { i = Math.floor(Math.random() * arr.length); } while (i === last[k]); last[k] = i; return arr[i]; };

  // ---------- Almacenamiento de clips (audio y video) ----------
  const allClips = async () => { try { return await R.idbTx("clips", "readonly", (s) => s.getAll()); } catch { return []; } };
  const addClip = (c) => R.idbTx("clips", "readwrite", (s) => s.add(c));
  const delClip = (id) => R.idbTx("clips", "readwrite", (s) => s.delete(id));
  const tipoDe = (c) => c.tipo || (/^data:video/.test(c.data || "") ? "video" : "audio");
  const urls = new Map();
  const srcOf = (c) => { if (c.blob) { if (!urls.has(c.id)) urls.set(c.id, URL.createObjectURL(c.blob)); return urls.get(c.id); } return c.data; };
  const toDataURL = (blob) => new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => res(null); r.readAsDataURL(blob); });
  // Para la copia de seguridad: los blobs se convierten a texto
  async function exportClips() { const out = []; for (const c of await allClips()) { const { blob, ...rest } = c; out.push(blob ? { ...rest, data: await toDataURL(blob) } : rest); } return out; }
  async function forEvent(evento, tipo) { return (await allClips()).filter((c) => (c.evento === evento || c.evento === "cualquiera") && tipoDe(c) === tipo); }

  let player = null;
  function playAudio(src) {
    return new Promise((res) => {
      try {
        if (player) player.pause();
        player = new Audio(src);
        const done = () => { clearTimeout(tm); res(); };
        const tm = setTimeout(res, 9000);
        player.onended = done; player.onerror = done;
        player.play().catch(done);
      } catch { res(); }
    });
  }
  const stopAudio = () => { if (player) { player.pause(); player = null; } };

  // Grito corto (audio propio o frase con bocina); usado al final del día y en las pruebas
  async function play(evento) {
    if (!enabled()) return;
    if (mode() !== "frases") {
      const a = pick(await forEvent(evento, "audio"), "a-" + evento);
      if (a) return playAudio(srcOf(a));
      if (mode() === "clips") return;
    }
    if (evento !== "serie") V.horn();
    await new Promise((r) => setTimeout(r, evento !== "serie" ? 650 : 0));
    return V.say(pick(FRASES[evento], evento), { hype: true });
  }

  // ---------- Momento motivacional en pantalla ----------
  // Llena `host` con el video (o la animación) y devuelve una función para detenerlo.
  async function hype(evento, host, siguiente) {
    host.innerHTML = "";
    const m = mode();
    const video = m !== "frases" ? pick(await forEvent(evento, "video"), "v-" + evento) : null;
    const frase = pick(FRASES[evento] || FRASES.serie, "f-" + evento);
    let stopped = false;

    if (video) {
      const v = document.createElement("video");
      v.className = "hype-video"; v.src = srcOf(video); v.playsInline = true; v.setAttribute("playsinline", ""); v.preload = "auto";
      host.appendChild(v);
      v.play().catch(() => { v.muted = true; v.play().catch(() => {}); });
      return () => { stopped = true; v.pause(); v.removeAttribute("src"); v.load(); };
    }

    // Sin video: animación propia con grito
    host.innerHTML = `<div class="hype-fx">
        <div class="hype-rays"></div>
        <div class="hype-word">${R.esc(frase.replace(/[¡!]/g, ""))}</div>
        ${siguiente ? `<div class="hype-sub">${R.esc(siguiente)}</div>` : ""}
      </div>`;
    if (m !== "off") {
      const a = m !== "frases" ? pick(await forEvent(evento, "audio"), "a-" + evento) : null;
      if (a) playAudio(srcOf(a));
      else if (m !== "clips") { V.horn(); setTimeout(() => { if (!stopped) V.say(frase, { hype: true }); }, 600); }
    }
    return () => { stopped = true; stopAudio(); };
  }

  // Vista previa fuera de la sesión (botones "Probar")
  async function demo(evento) {
    V.unlock();
    const wrap = document.createElement("div");
    wrap.className = "hype-demo";
    wrap.innerHTML = `<div class="hype-card"><div class="hype-pill"><span>Empieza en</span><b id="demoCount">${R.clock(seconds())}</b></div><div class="hype-stage"></div></div>`;
    document.body.appendChild(wrap);
    const stop = await hype(evento, wrap.querySelector(".hype-stage"), "Siguiente: Press inclinado · Serie 2 de 3");
    const end = Date.now() + seconds() * 1000;
    const iv = setInterval(() => {
      const left = (end - Date.now()) / 1000;
      const c = wrap.querySelector("#demoCount"); if (c) c.textContent = R.clock(Math.ceil(left));
      if (left <= 0) close();
    }, 200);
    const close = () => { clearInterval(iv); stop(); V.go(); wrap.classList.add("out"); setTimeout(() => wrap.remove(), 300); };
    wrap.addEventListener("click", close);
  }

  // ---------- Panel de configuración (pestaña Progreso) ----------
  async function renderPanel(host) {
    if (!host) return;
    const clips = await allClips(), m = mode(), sec = seconds();
    const modos = [["todo", "Mis videos/clips + frases"], ["clips", "Solo lo mío"], ["frases", "Solo frases y animación"], ["off", "Apagado"]];
    host.innerHTML = `
      <p class="pg-note">En cada descanso primero ves el cronómetro y qué sigue. En los últimos <b>${sec} segundos</b> todo se desenfoca y aparece el video en el centro; al terminar arranca la siguiente serie. Si no tienes un video para ese momento, sale una animación con grito y bocina.</p>
      <div class="mv-modes">${modos.map(([k, t]) => `<button class="chip${k === m ? " active" : ""}" data-m="${k}">${t}</button>`).join("")}</div>
      <label class="mv-range"><span>Duración del momento motivacional</span><input type="range" id="mvSec" min="3" max="20" step="1" value="${sec}"><b id="mvSecV">${sec} s</b></label>
      <div class="mv-test">
        <button class="btn" data-demo="serie">▶ Ver: cambio de serie</button>
        <button class="btn" data-demo="ejercicio">▶ Ver: cambio de ejercicio</button>
        <button class="btn" data-test="final">🔊 Oír: final del día</button>
      </div>
      <h4>Mis videos y audios</h4>
      <div class="pg-upload mv-up">
        <label><small>¿Cuándo aparece?</small><select id="mvEvento" class="pg-select">${Object.entries(EVENTS).map(([k, t]) => `<option value="${k}">${t}</option>`).join("")}</select></label>
        <label class="btn red pg-file">＋ Subir video o audio<input type="file" id="mvFile" accept="video/*,audio/*" multiple hidden></label>
      </div>
      <p class="pg-note">Videos cortos (idealmente de ${sec} a 10 segundos, máx. 40 MB) o audios. Se guardan solo en este dispositivo y no se publican en la página.</p>
      <div class="mv-list">${clips.length ? clips.map((c) => {
        const t = tipoDe(c);
        return `<div class="mv-clip">${t === "video" ? `<video class="mv-thumb" src="${srcOf(c)}#t=0.5" muted playsinline preload="metadata"></video>` : `<button class="mv-play" data-id="${c.id}" aria-label="Reproducir">▶</button>`}
          <div><b>${R.esc(c.nombre)}</b><small>${t === "video" ? "🎬 Video" : "🔊 Audio"} · ${EVENTS[c.evento] || c.evento}</small></div>
          <button class="pg-del" data-del="${c.id}" aria-label="Borrar">✕</button></div>`;
      }).join("") : `<div class="empty">Aún no has subido videos ni audios. Mientras tanto aparece la animación con grito.</div>`}</div>`;

    host.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { setMode(b.dataset.m); renderPanel(host); }));
    const rs = host.querySelector("#mvSec");
    rs.addEventListener("input", () => { host.querySelector("#mvSecV").textContent = rs.value + " s"; });
    rs.addEventListener("change", () => { R.store.set(KEY_S, rs.value); renderPanel(host); });
    host.querySelectorAll("[data-demo]").forEach((b) => b.addEventListener("click", () => { if (!V.on) V.toggle(); demo(b.dataset.demo); }));
    host.querySelectorAll("[data-test]").forEach((b) => b.addEventListener("click", () => { V.unlock(); if (!V.on) V.toggle(); play(b.dataset.test); }));
    host.querySelector("#mvFile").addEventListener("change", async (ev) => {
      const evento = host.querySelector("#mvEvento").value;
      for (const f of ev.target.files) {
        const tipo = f.type.startsWith("video") ? "video" : "audio";
        const max = tipo === "video" ? 40 : 5;
        if (f.size > max * 1024 * 1024) { alert(`"${f.name}" pesa más de ${max} MB. Usa un clip más corto.`); continue; }
        await addClip({ nombre: f.name.replace(/\.[^.]+$/, ""), evento, tipo, mime: f.type, blob: f });
      }
      renderPanel(host);
    });
    const byId = Object.fromEntries(clips.map((c) => [c.id, c]));
    host.querySelectorAll(".mv-play").forEach((b) => b.addEventListener("click", () => { V.unlock(); playAudio(srcOf(byId[b.dataset.id])); }));
    host.querySelectorAll(".mv-thumb").forEach((v) => v.addEventListener("click", () => { v.muted = false; v.currentTime = 0; v.paused ? v.play() : v.pause(); }));
    host.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", async () => { if (confirm("¿Borrar este clip?")) { await delClip(+b.dataset.del); renderPanel(host); } }));
  }

  return { play, hype, demo, stop: stopAudio, seconds, enabled, renderPanel, allClips: exportClips, addClip, EVENTS };
})();
