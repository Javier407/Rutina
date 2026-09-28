// ============================================================
//  MOTIVACIÓN — gritos al cambiar de serie, de ejercicio y al terminar
//  1) Clips propios del usuario (se guardan solo en su dispositivo)
//  2) Si no hay clip para ese momento: frase de gimnasio + bocina
// ============================================================
window.MOTIVA = (function () {
  const R = RUT, V = VOZ;
  const KEY = "rutina.motiva";          // "todo" | "clips" | "frases" | "off"
  const EVENTS = { serie: "Cambio de serie", ejercicio: "Cambio de ejercicio", final: "Final del día", cualquiera: "Cualquier momento" };

  // Frases originales, estilo grito de gimnasio
  const FRASES = {
    serie: [
      "¡Yeah buddy!", "¡Light weight, baby!", "¡Una menos, sigue así!", "¡Eso es, bestia!", "¡Así se entrena!",
      "¡Nada de excusas!", "¡Esa serie fue tuya!", "¡Más fuerte que ayer!", "¡Vamos, que se puede!", "¡Ese músculo está creciendo!",
      "¡Ain't nothing but a peanut!", "¡Respira y a la siguiente!"
    ],
    ejercicio: [
      "¡Ejercicio liquidado! ¡Al siguiente!", "¡Yeah buddy! ¡Siguiente máquina!", "¡Everybody wants to be a bodybuilder, but nobody wants to lift heavy weight!",
      "¡Uno menos en la lista!", "¡Así se construye la forma de V!", "¡Hombros de piedra, vamos por más!", "¡Hoy no se negocia! ¡Siguiente!"
    ],
    final: [
      "¡Sesión terminada! ¡Light weight, baby!", "¡Día completo! ¡Eres una máquina!", "¡Yeah buddy! ¡Nos vemos en la próxima!", "¡Otro día más cerca del físico que quieres!"
    ]
  };

  const mode = () => R.store.get(KEY, "todo");
  const setMode = (m) => R.store.set(KEY, m);
  const last = {};
  const pick = (arr, k) => { if (arr.length < 2) return arr[0]; let i; do { i = Math.floor(Math.random() * arr.length); } while (i === last[k]); last[k] = i; return arr[i]; };

  // ---------- Clips ----------
  const allClips = async () => { try { return await R.idbTx("clips", "readonly", (s) => s.getAll()); } catch { return []; } };
  const addClip = (c) => R.idbTx("clips", "readwrite", (s) => s.add(c));
  const delClip = (id) => R.idbTx("clips", "readwrite", (s) => s.delete(id));
  let player = null;
  function playData(data, vol = 1) {
    return new Promise((res) => {
      try {
        if (player) { player.pause(); }
        player = new Audio(data); player.volume = vol;
        const done = () => { clearTimeout(tm); res(); };
        const tm = setTimeout(res, 9000);   // tope por si el clip es largo
        player.onended = done; player.onerror = done;
        player.play().catch(done);
      } catch { res(); }
    });
  }
  const stop = () => { if (player) { player.pause(); player = null; } };

  // Lanza la motivación para un evento; termina cuando acaba de sonar
  async function play(evento) {
    const m = mode();
    if (m === "off" || !V.on) return;
    if (m !== "frases") {
      const clips = (await allClips()).filter((c) => c.evento === evento || c.evento === "cualquiera");
      if (clips.length) { const c = pick(clips, "clip-" + evento); return playData(c.data); }
      if (m === "clips") return;
    }
    if (evento !== "serie") V.horn();
    await new Promise((r) => setTimeout(r, evento !== "serie" ? 650 : 0));
    return V.say(pick(FRASES[evento], evento), { hype: true });
  }

  // ---------- Panel de configuración (pestaña Progreso) ----------
  async function renderPanel(host) {
    if (!host) return;
    const clips = await allClips(), m = mode();
    const modos = [["todo", "Clips + frases"], ["clips", "Solo mis clips"], ["frases", "Solo frases"], ["off", "Apagado"]];
    host.innerHTML = `
      <p class="pg-note">Suena al terminar una serie, al pasar de ejercicio y al finalizar el día. Si no tienes un clip para ese momento, suena una frase de gimnasio con bocina.</p>
      <div class="mv-modes">${modos.map(([k, t]) => `<button class="chip${k === m ? " active" : ""}" data-m="${k}">${t}</button>`).join("")}</div>
      <div class="mv-test">${Object.entries(EVENTS).filter(([k]) => k !== "cualquiera").map(([k, t]) => `<button class="btn" data-test="${k}">▶ Probar: ${t.toLowerCase()}</button>`).join("")}</div>
      <h4>Mis clips</h4>
      <div class="pg-upload mv-up">
        <label><small>¿Cuándo suena?</small><select id="mvEvento" class="pg-select">${Object.entries(EVENTS).map(([k, t]) => `<option value="${k}">${t}</option>`).join("")}</select></label>
        <label class="btn red pg-file">＋ Subir audio<input type="file" id="mvFile" accept="audio/*" multiple hidden></label>
      </div>
      <p class="pg-note">Sube tus propios audios cortos (mp3, m4a, wav; ideal menos de 8 segundos). Se guardan solo en este dispositivo y no se publican en la página.</p>
      <div class="mv-list">${clips.length ? clips.map((c) => `<div class="mv-clip"><button class="mv-play" data-id="${c.id}" aria-label="Reproducir">▶</button><div><b>${R.esc(c.nombre)}</b><small>${EVENTS[c.evento] || c.evento}</small></div><button class="pg-del" data-del="${c.id}" aria-label="Borrar">✕</button></div>`).join("") : `<div class="empty">Aún no has subido clips. Mientras tanto suenan las frases.</div>`}</div>`;

    host.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { setMode(b.dataset.m); renderPanel(host); }));
    host.querySelectorAll("[data-test]").forEach((b) => b.addEventListener("click", () => { V.unlock(); if (!V.on) V.toggle(); play(b.dataset.test); }));
    host.querySelector("#mvFile").addEventListener("change", async (ev) => {
      const evento = host.querySelector("#mvEvento").value;
      for (const f of ev.target.files) {
        if (f.size > 3 * 1024 * 1024) { alert(`"${f.name}" pesa más de 3 MB. Usa un clip más corto.`); continue; }
        const data = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => res(null); r.readAsDataURL(f); });
        if (data) await addClip({ nombre: f.name.replace(/\.[^.]+$/, ""), evento, data });
      }
      renderPanel(host);
    });
    const byId = Object.fromEntries(clips.map((c) => [c.id, c]));
    host.querySelectorAll(".mv-play").forEach((b) => b.addEventListener("click", () => { V.unlock(); playData(byId[b.dataset.id].data); }));
    host.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", async () => { if (confirm("¿Borrar este clip?")) { await delClip(+b.dataset.del); renderPanel(host); } }));
  }

  return { play, stop, renderPanel, allClips, addClip, EVENTS };
})();
