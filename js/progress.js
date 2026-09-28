// ============================================================
//  PROGRESO — sesiones, cargas, medidas, fotos y copia de seguridad
//  Las fotos se guardan en IndexedDB (solo en este dispositivo)
// ============================================================
window.PROGRESO = (function () {
  const R = RUT, $ = (s) => document.querySelector(s);
  const RED = "#ff2d46", WHITE = "#e7e7ea";

  // ---------- IndexedDB para fotos ----------
  const tx = (mode, fn) => R.idbTx("fotos", mode, fn);
  const allFotos = async () => { try { return await tx("readonly", (s) => s.getAll()); } catch { return []; } };
  const addFoto = (f) => tx("readwrite", (s) => s.add(f));
  const delFoto = (id) => tx("readwrite", (s) => s.delete(id));

  // Reduce la foto antes de guardarla (máx. 1280 px, JPEG)
  function shrink(file) {
    return new Promise((res) => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        const k = Math.min(1, 1280 / Math.max(img.width, img.height));
        const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url); res(c.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => { URL.revokeObjectURL(url); res(null); };
      img.src = url;
    });
  }

  // ---------- Secciones ----------
  function renderSesiones() {
    const ss = R.sessions();
    const vol = ss.reduce((a, s) => a + (s.volumen || 0), 0), series = ss.reduce((a, s) => a + (s.series || 0), 0);
    // racha: semanas consecutivas con al menos una sesión
    const weeks = new Set(ss.map((s) => { const d = R.fromKey(s.fecha); const m = new Date(d); m.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return R.dateKey(m); }));
    let streak = 0; const w = new Date(); w.setHours(0, 0, 0, 0); w.setDate(w.getDate() - ((w.getDay() + 6) % 7));
    while (weeks.has(R.dateKey(w))) { streak++; w.setDate(w.getDate() - 7); }
    const last = ss.slice(-14);
    $("#pgSesiones").innerHTML = `
      <div class="pg-kpis">
        <div><b>${ss.length}</b><small>sesiones</small></div>
        <div><b>${series}</b><small>series</small></div>
        <div><b>${vol.toLocaleString("es-CO")}</b><small>kg de volumen</small></div>
        <div class="hl"><b>${streak}</b><small>semanas seguidas</small></div>
      </div>
      <h4>Volumen por sesión</h4>
      ${R.lineChart([{ name: "Volumen", color: RED, pts: last.map((s) => ({ x: R.fmtDay(R.fromKey(s.fecha)), y: s.volumen })) }], { unit: "" })}
      ${last.length ? `<div class="pg-list">${last.slice().reverse().slice(0, 6).map((s) => `<div><span>${R.fmtShort(R.fromKey(s.fecha))}</span><b>${R.esc(s.nombre)}</b><span>${s.minutos} min · ${s.series} series${s.prs && s.prs.length ? ` · 🏆 ${s.prs.length}` : ""}</span></div>`).join("")}</div>` : ""}`;
  }

  function exerciseOptions() {
    const names = [];
    SEMANA.forEach((d) => d.bloques.forEach((b) => b.ejercicios.forEach((e) => { if (R.efectivo(e) && !names.includes(e.nombre)) names.push(e.nombre); })));
    const withData = names.filter((n) => R.history(n).length);
    return { names, withData };
  }
  function renderCargas(sel) {
    const { names, withData } = exerciseOptions();
    const pick = sel || R.store.get("rutina.pg.ex", withData[0] || names[0]);
    const h = R.history(pick);
    const top = h.map((e) => ({ x: R.fmtDay(R.fromKey(e.fecha)), y: Math.max(0, ...e.sets.filter(Boolean).map((s) => s.kg || 0)) || null }));
    const est = h.map((e) => ({ x: R.fmtDay(R.fromKey(e.fecha)), y: Math.round(Math.max(0, ...e.sets.filter(Boolean).map((s) => R.e1rm(s.kg, s.reps)))) || null }));
    $("#pgCargas").innerHTML = `
      <select id="pgEx" class="pg-select">${names.map((n) => `<option ${n === pick ? "selected" : ""}>${R.esc(n)}${withData.includes(n) ? " •" : ""}</option>`).join("")}</select>
      <div class="pg-legend"><span><i style="background:${RED}"></i>Peso máximo</span><span><i style="background:${WHITE}"></i>1RM estimado (Epley)</span></div>
      ${R.lineChart([{ name: "Peso", color: RED, pts: top }, { name: "1RM", color: WHITE, pts: est }], { unit: "" })}
      ${h.length ? `<div class="pg-list">${h.slice().reverse().slice(0, 5).map((e) => `<div><span>${R.fmtShort(R.fromKey(e.fecha))}</span><b>${R.esc(R.setsText(e))}</b></div>`).join("")}</div>` : ""}`;
    $("#pgEx").addEventListener("change", (ev) => { const v = ev.target.value.replace(/ •$/, ""); R.store.set("rutina.pg.ex", v); renderCargas(v); });
  }

  function renderMedidas() {
    const m = R.medidas();
    $("#pgMedidas").innerHTML = `
      <form class="pg-form" id="medForm">
        <label><small>Fecha</small><input type="date" name="fecha" value="${R.dateKey()}" required></label>
        <label><small>Cintura (cm, a la altura del ombligo)</small><input type="number" name="cintura" step="0.1" inputmode="decimal" placeholder="80.0"></label>
        <label><small>Peso corporal (kg)</small><input type="number" name="peso" step="0.1" inputmode="decimal" placeholder="70.0"></label>
        <button class="btn red" type="submit">Guardar medida</button>
      </form>
      <div class="pg-2">
        <div><h4>Cintura (cm)</h4>${R.lineChart([{ name: "Cintura", color: RED, pts: m.filter((x) => x.cintura).map((x) => ({ x: R.fmtDay(R.fromKey(x.fecha)), y: x.cintura })) }], { h: 160 })}</div>
        <div><h4>Peso (kg)</h4>${R.lineChart([{ name: "Peso", color: WHITE, pts: m.filter((x) => x.peso).map((x) => ({ x: R.fmtDay(R.fromKey(x.fecha)), y: x.peso })) }], { h: 160 })}</div>
      </div>
      ${m.length ? `<div class="pg-list">${m.slice().reverse().map((x) => `<div><span>${R.fmtShort(R.fromKey(x.fecha))}</span><b>${x.cintura ? x.cintura + " cm" : "—"} · ${x.peso ? x.peso + " kg" : "—"}</b><button class="pg-del" data-f="${x.fecha}" aria-label="Borrar">✕</button></div>`).join("")}</div>` : ""}`;
    $("#medForm").addEventListener("submit", (ev) => {
      ev.preventDefault(); const f = new FormData(ev.target);
      const c = parseFloat(f.get("cintura")), p = parseFloat(f.get("peso"));
      if (isNaN(c) && isNaN(p)) return;
      R.saveMedida({ fecha: f.get("fecha"), cintura: isNaN(c) ? null : c, peso: isNaN(p) ? null : p });
      renderMedidas();
    });
    $("#pgMedidas").querySelectorAll(".pg-del").forEach((b) => b.addEventListener("click", () => { if (confirm("¿Borrar esta medida?")) { R.delMedida(b.dataset.f); renderMedidas(); } }));
  }

  const POSES = ["Frente", "Perfil", "Espalda"];
  async function renderFotos() {
    const fotos = (await allFotos()).sort((a, b) => a.fecha.localeCompare(b.fecha));
    const fechas = [...new Set(fotos.map((f) => f.fecha))];
    const a = R.store.get("rutina.pg.fa", fechas[0] || ""), b = R.store.get("rutina.pg.fb", fechas[fechas.length - 1] || "");
    const pick = (fecha, pose) => fotos.find((f) => f.fecha === fecha && f.pose === pose);
    $("#pgFotos").innerHTML = `
      <div class="pg-upload">
        <label class="pg-date"><small>Fecha de las fotos</small><input type="date" id="fotoFecha" value="${R.dateKey()}"></label>
        ${POSES.map((p) => `<label class="btn pg-file">📷 ${p}<input type="file" accept="image/*" capture="environment" data-pose="${p}" hidden></label>`).join("")}
      </div>
      <p class="pg-note">Mismo lugar, misma luz, misma hora y en ayunas. Las fotos se guardan solo en este dispositivo.</p>
      ${fechas.length >= 1 ? `
        <div class="pg-compare-head">
          <label><small>Antes</small><select id="fa">${fechas.map((f) => `<option ${f === a ? "selected" : ""} value="${f}">${R.fmtShort(R.fromKey(f))}</option>`).join("")}</select></label>
          <label><small>Después</small><select id="fb">${fechas.map((f) => `<option ${f === b ? "selected" : ""} value="${f}">${R.fmtShort(R.fromKey(f))}</option>`).join("")}</select></label>
        </div>
        <div class="pg-compare">${POSES.map((p) => {
          const fa = pick(a, p), fb = pick(b, p);
          if (!fa && !fb) return "";
          return `<div class="pg-pair"><div class="eyebrow">${p}</div><div class="pg-imgs">
            <figure>${fa ? `<img src="${fa.data}" alt="${p} ${a}">` : `<div class="pg-ph">—</div>`}<figcaption>${R.fmtDay(R.fromKey(a))}</figcaption></figure>
            <figure>${fb ? `<img src="${fb.data}" alt="${p} ${b}">` : `<div class="pg-ph">—</div>`}<figcaption>${R.fmtDay(R.fromKey(b))}</figcaption></figure></div></div>`;
        }).join("")}</div>
        <details class="pg-all"><summary>Todas las fotos (${fotos.length})</summary><div class="pg-grid">${fotos.slice().reverse().map((f) => `<figure><img src="${f.data}" alt=""><figcaption>${R.fmtDay(R.fromKey(f.fecha))} · ${f.pose}<button class="pg-del" data-id="${f.id}">✕</button></figcaption></figure>`).join("")}</div></details>`
      : `<div class="empty">Sube tus primeras fotos de frente, perfil y espalda.</div>`}`;
    $("#pgFotos").querySelectorAll("input[type=file]").forEach((inp) => inp.addEventListener("change", async () => {
      const file = inp.files && inp.files[0]; if (!file) return;
      const data = await shrink(file); if (!data) return alert("No se pudo leer la imagen.");
      const fecha = $("#fotoFecha").value || R.dateKey();
      const old = fotos.find((f) => f.fecha === fecha && f.pose === inp.dataset.pose);
      if (old) await delFoto(old.id);
      await addFoto({ fecha, pose: inp.dataset.pose, data });
      R.store.set("rutina.pg.fb", fecha); renderFotos();
    }));
    const fa = $("#fa"), fb = $("#fb");
    if (fa) fa.addEventListener("change", () => { R.store.set("rutina.pg.fa", fa.value); renderFotos(); });
    if (fb) fb.addEventListener("change", () => { R.store.set("rutina.pg.fb", fb.value); renderFotos(); });
    $("#pgFotos").querySelectorAll(".pg-del").forEach((btn) => btn.addEventListener("click", async () => { if (confirm("¿Borrar esta foto?")) { await delFoto(+btn.dataset.id); renderFotos(); } }));
  }

  // ---------- Copia de seguridad ----------
  function renderBackup() {
    $("#pgBackup").innerHTML = `
      <p class="pg-note">Tus datos viven en el navegador de cada dispositivo. Exporta una copia para pasarlos del computador al celular o para no perderlos.</p>
      <div class="pg-upload">
        <button class="btn red" id="bkExport">⬇ Exportar copia</button>
        <label class="btn pg-file">⬆ Importar copia<input type="file" id="bkImport" accept="application/json,.json" hidden></label>
      </div>`;
    $("#bkExport").addEventListener("click", async () => {
      const data = { app: "rutina-estetica", version: 1, exportado: new Date().toISOString(), local: {}, fotos: await allFotos(), clips: (window.MOTIVA ? await MOTIVA.allClips() : []) };
      try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith("rutina.")) data.local[k] = localStorage.getItem(k); } } catch { /* */ }
      const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `rutina-copia-${R.dateKey()}.json`; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    });
    $("#bkImport").addEventListener("change", async (ev) => {
      const f = ev.target.files[0]; if (!f) return;
      try {
        const data = JSON.parse(await f.text());
        if (data.app !== "rutina-estetica") throw new Error("archivo no válido");
        if (!confirm("Esto reemplaza los datos de este dispositivo con los de la copia. ¿Continuar?")) return;
        Object.entries(data.local || {}).forEach(([k, v]) => R.store.set(k, v));
        for (const foto of data.fotos || []) { const { id, ...rest } = foto; await addFoto(rest); }
        if (window.MOTIVA) for (const c of data.clips || []) { const { id, ...rest } = c; await MOTIVA.addClip(rest); }
        alert("Copia importada."); location.reload();
      } catch (e) { alert("No se pudo importar: " + e.message); }
    });
  }

  function render() { renderSesiones(); renderCargas(); renderMedidas(); renderFotos(); if (window.MOTIVA) MOTIVA.renderPanel($("#pgMotiva")); renderBackup(); }
  return { render, renderSesiones };
})();
