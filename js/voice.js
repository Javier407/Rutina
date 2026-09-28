// ============================================================
//  Voz (español) y sonidos del entrenamiento
// ============================================================
window.VOZ = (function () {
  const KEY = "rutina.voz";
  let on = RUT.store.get(KEY, "1") === "1";
  let voice = null, ctx = null;

  function pickVoice() {
    if (!("speechSynthesis" in window)) return;
    const vs = speechSynthesis.getVoices();
    voice = vs.find((v) => /es[-_](CO|MX|US|419)/i.test(v.lang)) || vs.find((v) => /^es/i.test(v.lang)) || null;
  }
  if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }

  function say(text) {
    if (!on || !("speechSynthesis" in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = voice ? voice.lang : "es-ES"; if (voice) u.voice = voice;
      u.rate = 1.02; u.pitch = 1;
      speechSynthesis.speak(u);
    } catch { /* sin voz */ }
  }

  function audio() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  // Tono corto; se usa para 3-2-1 y fin de descanso
  function beep(freq = 880, dur = 0.14, vol = 0.22, when = 0) {
    if (!on) return; const c = audio(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = "sine"; o.frequency.value = freq; o.connect(g); g.connect(c.destination);
    const t = c.currentTime + when;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o.stop(t + dur + 0.02);
  }
  const tick = () => beep(660, 0.12, 0.2);
  const go = () => { beep(990, 0.18, 0.26); beep(1320, 0.3, 0.26, 0.2); if (navigator.vibrate) navigator.vibrate([180, 80, 260]); };
  const done = () => { [0, 0.16, 0.32, 0.5].forEach((w, i) => beep([784, 988, 1175, 1568][i], 0.2, 0.22, w)); };

  // Frases en español natural
  function restPhrase(sec) {
    if (sec >= 60) { const m = Math.floor(sec / 60), s = sec % 60; return `Descansa ${m === 1 ? "un minuto" : m + " minutos"}${s ? " y " + s + " segundos" : ""}`; }
    return `Descansa ${sec} segundos`;
  }

  return {
    get on() { return on; },
    toggle() { on = !on; RUT.store.set(KEY, on ? "1" : "0"); if (on) { audio(); say("Voz activada"); } else if ("speechSynthesis" in window) speechSynthesis.cancel(); return on; },
    unlock() { audio(); },          // se llama con un toque del usuario (requisito de iOS)
    say, beep, tick, go, done, restPhrase
  };
})();
