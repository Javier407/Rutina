// ============================================================
//  Datos compartidos: almacenamiento, fechas, registro de cargas
// ============================================================
window.RUT = (function () {
  // ---------- Almacenamiento local (tolerante a fallos) ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } },
    del(k) { try { localStorage.removeItem(k); } catch { /* */ } },
    json(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* */ } }
  };

  // ---------- Utilidades ----------
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const toMin = (h) => { const [a, b] = h.split(":").map(Number); return a * 60 + b; };
  const clock = (sec) => { sec = Math.max(0, Math.round(sec)); return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`; };
  const efectivo = (e) => typeof e.series === "number" && e.rir !== "—";

  // ---------- Fechas (hora del dispositivo) ----------
  const dateKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const fromKey = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
  const fmt = (d, o) => new Intl.DateTimeFormat("es-CO", o).format(d).replace(/\./g, "");
  const fmtShort = (d) => fmt(d, { weekday: "short", day: "numeric", month: "short" });
  const fmtLong = (d) => fmt(d, { weekday: "long", day: "numeric", month: "long" });
  const fmtDay = (d) => fmt(d, { day: "numeric", month: "short" });
  // Lunes–viernes de esta semana; sábado y domingo muestran la semana que viene
  function weekDates() {
    const t = new Date(); t.setHours(0, 0, 0, 0);
    const dow = t.getDay();
    const monday = new Date(t);
    monday.setDate(t.getDate() + (dow === 0 ? 1 : dow === 6 ? 2 : 1 - dow));
    return [0, 1, 2, 3, 4].map((i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d; });
  }
  const todayIdx = () => { const d = new Date().getDay(); return d >= 1 && d <= 5 ? d - 1 : -1; };
  const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };

  // ---------- Interpretación de textos ----------
  function parseRest(s) {
    if (!s || s === "—") return 0;
    const n = (s.match(/\d+/g) || []).map(Number); if (!n.length) return 0;
    const v = Math.max(...n); return /min/.test(s) ? v * 60 : v;
  }
  // Ejercicios por tiempo: "5 min", "20 s", "40 s por lado", "10 × 5 s"
  function parseTime(reps) {
    if (!reps) return 0;
    let m = reps.match(/(\d+)\s*min/); if (m) return +m[1] * 60;
    m = reps.match(/(\d+)\s*s\b/); if (m) return +m[1];
    return 0;
  }
  function repRange(reps) {
    if (!reps || parseTime(reps)) return null;
    const n = (reps.match(/\d+/g) || []).map(Number); if (!n.length) return null;
    return [n[0], n[1] ?? n[0]];
  }

  // ---------- Series marcadas (puntos de las tarjetas) ----------
  const setsKey = (fecha, dayId) => `rutina.sets.${fecha}.${dayId}`;
  const getSets = (fecha, dayId) => store.json(setsKey(fecha, dayId), {}) || {};
  const saveSets = (fecha, dayId, v) => store.put(setsKey(fecha, dayId), v);

  // ---------- Registro de cargas ----------
  // rutina.log = { "<ejercicio>": [ { fecha, sets: [ {kg, reps} ] } ] }
  const LOG = "rutina.log";
  const allLog = () => store.json(LOG, {}) || {};
  function logSet(ex, fecha, i, kg, reps) {
    const log = allLog(); const h = log[ex] || (log[ex] = []);
    let e = h.find((x) => x.fecha === fecha);
    if (!e) { e = { fecha, sets: [] }; h.push(e); h.sort((a, b) => a.fecha.localeCompare(b.fecha)); }
    e.sets[i] = { kg: kg === "" || kg == null ? null : +kg, reps: reps === "" || reps == null ? null : +reps };
    store.put(LOG, log);
  }
  const history = (ex) => (allLog()[ex] || []).filter((e) => e.sets.some(Boolean));
  const lastBefore = (ex, fecha) => history(ex).filter((e) => e.fecha < fecha).pop() || null;
  const today = (ex, fecha) => history(ex).find((e) => e.fecha === fecha) || null;
  const setsText = (e) => e ? e.sets.filter(Boolean).map((s) => (s.kg != null ? `${s.kg} kg × ` : "") + (s.reps ?? "–")).join(" · ") : "";

  // Doble progresión: si llegaste al tope del rango en todas las series → sube peso
  function suggestion(ex, fecha) {
    const r = repRange(ex.reps); if (!r || !efectivo(ex)) return null;
    const last = lastBefore(ex.nombre, fecha); if (!last) return null;
    const s = last.sets.filter(Boolean); if (!s.length || s.every((x) => x.reps == null)) return null;
    const kg = Math.max(...s.map((x) => x.kg || 0));
    if (s.length >= ex.series && s.every((x) => (x.reps || 0) >= r[1])) {
      const inc = kg >= 40 ? 2.5 : kg >= 10 ? 2 : 1;
      return { type: "up", kg: +(kg + inc).toFixed(1), text: `Sube a ${+(kg + inc).toFixed(1)} kg: hiciste ${r[1]}+ reps en todas las series` };
    }
    if (s.some((x) => x.reps != null && x.reps < r[0])) return { type: "down", kg, text: `Mantén ${kg || ""} kg y busca llegar a ${r[0]} reps` };
    return { type: "keep", kg, text: `Mantén ${kg ? kg + " kg" : "el peso"} y suma repeticiones hasta ${r[1]}` };
  }
  const e1rm = (kg, reps) => kg && reps ? kg * (1 + reps / 30) : 0;

  // ---------- Sesiones terminadas ----------
  const SESS = "rutina.sesiones";
  const sessions = () => store.json(SESS, []) || [];
  function saveSession(s) { const all = sessions().filter((x) => !(x.fecha === s.fecha && x.dia === s.dia)); all.push(s); all.sort((a, b) => a.fecha.localeCompare(b.fecha)); store.put(SESS, all); }

  // ---------- Medidas ----------
  const MED = "rutina.medidas";
  const medidas = () => store.json(MED, []) || [];
  function saveMedida(m) { const all = medidas().filter((x) => x.fecha !== m.fecha); all.push(m); all.sort((a, b) => a.fecha.localeCompare(b.fecha)); store.put(MED, all); }
  function delMedida(fecha) { store.put(MED, medidas().filter((x) => x.fecha !== fecha)); }

  // ---------- Gráfica de líneas SVG ----------
  // series: [{ name, color, pts: [{x: etiqueta, y: número}] }]
  function lineChart(series, { h = 180, unit = "" } = {}) {
    const W = 560, H = h, P = { l: 38, r: 12, t: 14, b: 26 };
    const xs = [...new Set(series.flatMap((s) => s.pts.map((p) => p.x)))];
    const ys = series.flatMap((s) => s.pts.map((p) => p.y)).filter((y) => y != null);
    if (!xs.length || !ys.length) return `<div class="empty">Aún no hay datos. Aparecerán aquí cuando registres.</div>`;
    let lo = Math.min(...ys), hi = Math.max(...ys); if (lo === hi) { lo -= 1; hi += 1; }
    const pad = (hi - lo) * 0.12; lo -= pad; hi += pad;
    const X = (i) => P.l + (xs.length === 1 ? (W - P.l - P.r) / 2 : (i * (W - P.l - P.r)) / (xs.length - 1));
    const Y = (v) => P.t + (1 - (v - lo) / (hi - lo)) * (H - P.t - P.b);
    const id = "lg" + Math.random().toString(36).slice(2, 7);
    let s = `<svg class="lchart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs>`;
    series.forEach((se, k) => { s += `<linearGradient id="${id}${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${se.color}" stop-opacity=".35"/><stop offset="1" stop-color="${se.color}" stop-opacity="0"/></linearGradient>`; });
    s += `</defs>`;
    [0, 0.5, 1].forEach((k) => { const v = lo + (hi - lo) * k; const y = Y(v); s += `<line class="gl" x1="${P.l}" x2="${W - P.r}" y1="${y}" y2="${y}"/><text class="ax" x="${P.l - 6}" y="${y + 3}" text-anchor="end">${Math.round(v * 10) / 10}${unit}</text>`; });
    const step = Math.max(1, Math.ceil(xs.length / 6));
    xs.forEach((x, i) => { if (i % step === 0 || i === xs.length - 1) s += `<text class="ax" x="${X(i)}" y="${H - 8}" text-anchor="middle">${esc(x)}</text>`; });
    series.forEach((se, k) => {
      const pts = se.pts.map((p) => [X(xs.indexOf(p.x)), p.y == null ? null : Y(p.y)]).filter((p) => p[1] != null);
      if (!pts.length) return;
      const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
      s += `<path d="${d} L${pts[pts.length - 1][0]} ${H - P.b} L${pts[0][0]} ${H - P.b} Z" fill="url(#${id}${k})"/>`;
      s += `<path class="ln" d="${d}" stroke="${se.color}"/>`;
      pts.forEach((p) => { s += `<circle class="pt" cx="${p[0]}" cy="${p[1]}" r="3.5" fill="${se.color}"/>`; });
    });
    return s + `</svg>`;
  }

  // ---------- IndexedDB compartida (fotos y clips de motivación) ----------
  let idbp = null;
  function idb() {
    if (idbp) return idbp;
    idbp = new Promise((res, rej) => {
      if (!("indexedDB" in window)) return rej(new Error("sin IndexedDB"));
      const r = indexedDB.open("rutina", 2);
      r.onupgradeneeded = () => {
        const d = r.result;
        if (!d.objectStoreNames.contains("fotos")) d.createObjectStore("fotos", { keyPath: "id", autoIncrement: true });
        if (!d.objectStoreNames.contains("clips")) d.createObjectStore("clips", { keyPath: "id", autoIncrement: true });
      };
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
    return idbp;
  }
  async function idbTx(storeName, mode, fn) {
    const d = await idb();
    return new Promise((res, rej) => { const t = d.transaction(storeName, mode); const out = fn(t.objectStore(storeName)); t.oncomplete = () => res(out && out.result !== undefined ? out.result : out); t.onerror = () => rej(t.error); });
  }

  return {
    idb, idbTx,
    store, esc, toMin, clock, efectivo,
    dateKey, fromKey, fmtShort, fmtLong, fmtDay, weekDates, todayIdx, nowMin,
    parseRest, parseTime, repRange,
    getSets, saveSets,
    allLog, logSet, history, lastBefore, today, setsText, suggestion, e1rm,
    sessions, saveSession, medidas, saveMedida, delMedida,
    lineChart
  };
})();
