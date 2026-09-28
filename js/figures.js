// ============================================================
//  FIGURAS ANIMADAS — mismo estilo para todos los ejercicios
//  Silueta vectorial con cinemática: cada ejercicio define poses
//  clave; el motor interpola ángulos (no posiciones) para que los
//  segmentos conserven su longitud, como un GIF pero en vector.
// ============================================================
(function () {
  // ---------- Proporciones (unidades del viewBox 0 0 200 160) ----------
  const L = { TORSO: 44, NECK: 13, HEAD: 9, UP: 25, FORE: 23, THIGH: 36, SHIN: 34, FOOT: 11, SHW: 14, HPW: 7 };
  const FLOOR = 150;
  const R = Math.PI / 180;
  // Ángulo absoluto: 0 = abajo, 90 = adelante (derecha), 180 = arriba, 270 = atrás
  const dir = (a) => [Math.sin(a * R), Math.cos(a * R)];
  const add = (p, v, k = 1) => [p[0] + v[0] * k, p[1] + v[1] * k];
  const sub = (p, v, k = 1) => [p[0] - v[0] * k, p[1] - v[1] * k];

  // Cinemática inversa de 2 segmentos (s = lado hacia donde dobla la articulación)
  function ik(base, target, a, b, s) {
    let dx = target[0] - base[0], dy = target[1] - base[1];
    let d = Math.hypot(dx, dy);
    const max = a + b - 0.01;
    if (d > max) { target = [base[0] + dx / d * max, base[1] + dy / d * max]; d = max; }
    const th = Math.atan2(dy, dx);
    const al = Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
    return [[base[0] + a * Math.cos(th + s * al), base[1] + a * Math.sin(th + s * al)], target];
  }

  // ---------- Pose de perfil (mira a la derecha) ----------
  function S(o) {
    const t = o.t ?? 180;
    let hip, neck;
    if (o.neck) { neck = o.neck; hip = sub(neck, dir(t), L.TORSO); }
    else { hip = o.hip; neck = add(hip, dir(t), L.TORSO); }
    const head = add(add(neck, dir(o.h ?? t), L.NECK), [o.chin ?? 0, 0]);
    const p = { hip, neck, head };
    const arm = (handAt, a, eb, kE, kH) => {
      if (handAt) { const [el, ha] = ik(neck, handAt, L.UP, L.FORE, eb ?? 1); p[kE] = el; p[kH] = ha; }
      else { const aa = a || [0, 0]; p[kE] = add(neck, dir(aa[0]), L.UP); p[kH] = add(p[kE], dir(aa[1]), L.FORE); }
    };
    arm(o.handAt, o.a, o.eb, "el", "ha");
    arm(o.hand2At ?? (o.a2 ? null : o.handAt), o.a2 ?? o.a, o.eb2 ?? o.eb, "el2", "ha2");
    const leg = (footAt, l, kb, f, kK, kA, kT) => {
      if (footAt) { const [kn, an] = ik(hip, footAt, L.THIGH, L.SHIN, kb ?? -1); p[kK] = kn; p[kA] = an; }
      else { const ll = l || [0, 0]; p[kK] = add(hip, dir(ll[0]), L.THIGH); p[kA] = add(p[kK], dir(ll[1]), L.SHIN); }
      p[kT] = add(p[kA], dir(f ?? 90), L.FOOT);
    };
    leg(o.footAt, o.l, o.kb, o.f, "kn", "an", "to");
    leg(o.foot2At ?? (o.l2 ? null : o.footAt), o.l2 ?? o.l, o.kb2 ?? o.kb, o.f2 ?? o.f, "kn2", "an2", "to2");
    return p;
  }

  // ---------- Pose de frente ----------
  function F(o) {
    const hip = o.hip, t = o.t ?? 180;
    const neck = add(hip, dir(t), L.TORSO);
    const head = add(neck, dir(t), L.NECK);
    const shL = [neck[0] - L.SHW, neck[1] + 4], shR = [neck[0] + L.SHW, neck[1] + 4];
    const dL = (a) => [-Math.sin(a * R), Math.cos(a * R)];
    const dR = (a) => [Math.sin(a * R), Math.cos(a * R)];
    const a = o.a || [5, 5], aR = o.aR || a;
    const r = o.reach ?? 1, rR = o.reachR ?? r;
    const elL = add(shL, dL(a[0]), L.UP * r), haL = add(elL, dL(a[1]), L.FORE * r);
    const elR = add(shR, dR(aR[0]), L.UP * rR), haR = add(elR, dR(aR[1]), L.FORE * rR);
    const l = o.l || [3, 0], lr = o.lr ?? 1;
    const hpL = [hip[0] - L.HPW, hip[1]], hpR = [hip[0] + L.HPW, hip[1]];
    const knL = add(hpL, dL(l[0]), L.THIGH * lr), anL = add(knL, dL(l[1]), L.SHIN);
    const knR = add(hpR, dR(l[0]), L.THIGH * lr), anR = add(knR, dR(l[1]), L.SHIN);
    return { hip, neck, head, shL, elL, haL, shR, elR, haR, hpL, knL, anL, hpR, knR, anR };
  }

  const EDGES = {
    side: [["hip", "neck"], ["neck", "head"], ["neck", "el"], ["el", "ha"], ["neck", "el2"], ["el2", "ha2"],
      ["hip", "kn"], ["kn", "an"], ["an", "to"], ["hip", "kn2"], ["kn2", "an2"], ["an2", "to2"]],
    front: [["hip", "neck"], ["neck", "head"], ["neck", "shL"], ["shL", "elL"], ["elL", "haL"], ["neck", "shR"], ["shR", "elR"], ["elR", "haR"],
      ["hip", "hpL"], ["hpL", "knL"], ["knL", "anL"], ["hip", "hpR"], ["hpR", "knR"], ["knR", "anR"]]
  };

  // Segmentos dibujados: [a, b, grosor, capa]  capa: far = lado lejano
  const BONES = {
    side: [
      ["kn2", "an2", 6, "far"], ["hip", "kn2", 7, "far"], ["an2", "to2", 4, "far"],
      ["neck", "el2", 5.5, "far"], ["el2", "ha2", 5, "far"],
      ["hip", "neck", 10, "near"], ["neck", "head", 5, "near"],
      ["hip", "kn", 7.5, "near"], ["kn", "an", 6.5, "near"], ["an", "to", 4.5, "near"],
      ["neck", "el", 6, "near"], ["el", "ha", 5.5, "near"]
    ],
    front: [
      ["hpL", "knL", 7.5, "near"], ["knL", "anL", 6.5, "near"], ["hpR", "knR", 7.5, "near"], ["knR", "anR", 6.5, "near"],
      ["hpL", "hpR", 8, "near"], ["hip", "neck", 12, "near"], ["shL", "shR", 8, "near"], ["neck", "head", 5, "near"],
      ["shL", "elL", 6, "near"], ["elL", "haL", 5.5, "near"], ["shR", "elR", 6, "near"], ["elR", "haR", 5.5, "near"]
    ]
  };

  // Resaltados: segmentos rojos sobre el hueso
  const HL_SEG = {
    side: {
      upperArm: [["neck", "el", 6], ["neck", "el2", 5.5]], foreArm: [["el", "ha", 5.5]],
      thigh: [["hip", "kn", 7.5], ["hip", "kn2", 7]], shin: [["kn", "an", 6.5], ["kn2", "an2", 6]],
      neck: [["neck", "head", 5]], torso: [["hip", "neck", 10]]
    },
    front: {
      upperArm: [["shL", "elL", 6], ["shR", "elR", 6]], foreArm: [["elL", "haL", 5.5], ["elR", "haR", 5.5]],
      thigh: [["hpL", "knL", 7.5], ["hpR", "knR", 7.5]], shin: [["knL", "anL", 6.5], ["knR", "anR", 6.5]],
      torso: [["hip", "neck", 12]], neck: [["neck", "head", 5]]
    }
  };

  // Manchas de músculo (brillo rojo pulsante)
  function blobs(view, p, list) {
    const out = [];
    const v = [p.neck[0] - p.hip[0], p.neck[1] - p.hip[1]];
    const n = Math.hypot(v[0], v[1]) || 1;
    const u = [v[0] / n, v[1] / n];            // cadera → cuello
    const fw = [-u[1], u[0]];                   // normal hacia el pecho
    const along = (k) => [p.neck[0] - v[0] * k, p.neck[1] - v[1] * k];
    list.forEach((m) => {
      if (view === "side") {
        if (m === "delt") out.push([p.neck[0] + fw[0] * 1 - u[0] * 3, p.neck[1] + fw[1] * 1 - u[1] * 3, 6]);
        if (m === "chest") { const q = along(0.25); out.push([q[0] + fw[0] * 5, q[1] + fw[1] * 5, 7]); }
        if (m === "lats") { const q = along(0.38); out.push([q[0] - fw[0] * 5, q[1] - fw[1] * 5, 8]); }
        if (m === "abs") { const q = along(0.66); out.push([q[0] + fw[0] * 4, q[1] + fw[1] * 4, 7]); }
        if (m === "glute") out.push([p.hip[0] - fw[0] * 5, p.hip[1] - fw[1] * 5, 7]);
        if (m === "calf") { const k = p.kn, a = p.an; out.push([(k[0] + a[0]) / 2 - 3, (k[1] + a[1]) / 2 - 3, 5]); }
      } else {
        if (m === "delt") { out.push([p.shL[0] - 2, p.shL[1], 6.5]); out.push([p.shR[0] + 2, p.shR[1], 6.5]); }
        if (m === "chest") { out.push([p.neck[0] - 7, p.neck[1] + 12, 7]); out.push([p.neck[0] + 7, p.neck[1] + 12, 7]); }
        if (m === "lats") { out.push([p.neck[0] - 11, p.neck[1] + 18, 7]); out.push([p.neck[0] + 11, p.neck[1] + 18, 7]); }
        if (m === "abs") out.push([p.hip[0], p.hip[1] - 14, 8]);
        if (m === "glute") { out.push([p.hpL[0], p.hpL[1], 6]); out.push([p.hpR[0], p.hpR[1], 6]); }
      }
    });
    return out;
  }

  // ---------- Utilidades de equipo estático ----------
  const floor = () => ({ l: [8, FLOOR + 1, 192, FLOOR + 1, 2], cls: "floor" });
  const bench = (x1, y1, x2, y2) => ({ l: [x1, y1, x2, y2, 7], cls: "pad" });
  const post = (x1, y1, x2, y2) => ({ l: [x1, y1, x2, y2, 3], cls: "eq" });
  const STAND = { hip: [100, 77], footAt: [102, 146], foot2At: [98, 146] };
  const FSTAND = { hip: [100, 77] };

  // ============================================================
  //  DEFINICIONES DE EJERCICIOS
  //  view, frames (poses), props estáticos, dyn (equipo móvil),
  //  hl (músculo resaltado), root (punto que se interpola lineal),
  //  mode: "pingpong" (ida y vuelta) o "loop"
  // ============================================================
  const A = {};

  A.bike = {
    view: "side", mode: "loop", seg: 320, hold: 0, ease: "linear",
    frames: [[100, 115], [113, 128], [100, 141], [87, 128]].map((f, i, arr) => S({
      hip: [80, 93], t: 160, handAt: [140, 64], eb: 1, footAt: f, foot2At: arr[(i + 2) % 4], f: 95
    })),
    props: [floor(), { l: [68, 96, 92, 96, 5], cls: "pad" }, post(80, 98, 100, 128), post(100, 128, 132, 64), { l: [128, 64, 146, 64, 4], cls: "eq" },
      { c: [100, 128, 13], cls: "ring" }, post(100, 128, 100, 150), post(80, 150, 125, 150)],
    hl: ["thigh"]
  };

  A.row_erg = {
    view: "side",
    frames: [
      S({ hip: [80, 128], t: 158, footAt: [128, 134], handAt: [142, 88], eb: 1, f: 60 }),
      S({ hip: [52, 128], t: 205, footAt: [128, 134], handAt: [60, 102], eb: -1, f: 60 })
    ],
    props: [floor(), post(20, 142, 150, 142), { l: [131, 120, 134, 146, 5], cls: "pad" }, { c: [168, 118, 14], cls: "ring" }],
    dyn: [{ cable: [160, 112, "ha"] }, { seat: "hip" }, { grip: "ha" }],
    hl: ["lats", "thigh"]
  };

  A.band_dislocate = {
    view: "side", mode: "loop", seg: 900, hold: 150,
    frames: [S({ ...STAND, a: [25, 25] }), S({ ...STAND, a: [180, 180] }), S({ ...STAND, a: [320, 320] }), S({ ...STAND, a: [180, 180] })],
    props: [floor()], dyn: [{ grip: "ha", bandbar: true }], hl: ["delt"]
  };

  A.chin_tuck = {
    view: "side", hold: 700,
    frames: [S({ ...STAND, a: [4, 4], chin: 5, h: 168 }), S({ ...STAND, a: [4, 4], chin: -3, h: 184 })],
    props: [floor(), { l: [84, 5, 84, 150, 3], cls: "wall" }], hl: ["neck"]
  };

  A.wall_slide = {
    view: "front",
    frames: [F({ ...FSTAND, a: [80, 178] }), F({ ...FSTAND, a: [150, 172] })],
    props: [floor(), { r: [60, 4, 80, 146, 6], cls: "wallbg" }], hl: ["delt", "lats"]
  };

  A.band_pullapart = {
    view: "front",
    frames: [F({ ...FSTAND, a: [90, 90], reach: 0.3 }), F({ ...FSTAND, a: [90, 90], reach: 1 })],
    props: [floor()], dyn: [{ band: ["haL", "haR"] }], hl: ["delt"]
  };

  const inclineBench = [floor(), bench(126, 120, 76, 92), bench(118, 121, 146, 121), post(128, 122, 128, 150), post(90, 102, 90, 150)];
  A.incline_db_press = {
    view: "side",
    frames: [
      S({ hip: [120, 112], t: 240, footAt: [160, 146], handAt: [86, 80], eb: -1 }),
      S({ hip: [120, 112], t: 240, footAt: [160, 146], handAt: [86, 44], eb: -1 })
    ],
    props: inclineBench, dyn: [{ dumb: "ha" }], hl: ["chest", "delt"]
  };
  A.incline_smith = {
    ...A.incline_db_press,
    props: [...inclineBench, { l: [74, 4, 74, 150, 3], cls: "eq" }, { l: [98, 4, 98, 150, 3], cls: "eq" }],
    dyn: [{ plate: "ha" }]
  };

  A.lat_pulldown = {
    view: "side",
    frames: [
      S({ hip: [92, 112], t: 188, footAt: [132, 146], handAt: [104, 38], eb: 1 }),
      S({ hip: [92, 112], t: 196, footAt: [132, 146], handAt: [100, 76], eb: 1 })
    ],
    props: [floor(), { l: [76, 116, 112, 116, 6], cls: "pad" }, post(94, 118, 94, 150), { c: [124, 104, 5], cls: "padc" },
      post(158, 6, 158, 150), post(108, 6, 158, 6)],
    dyn: [{ cable: [108, 8, "ha"] }, { grip: "ha", bar: true }], hl: ["lats"]
  };

  A.machine_chest_press = {
    view: "side",
    frames: [
      S({ hip: [80, 110], t: 182, footAt: [120, 146], handAt: [100, 72], eb: 1 }),
      S({ hip: [80, 110], t: 182, footAt: [120, 146], handAt: [126, 72], eb: 1 })
    ],
    props: [floor(), bench(70, 58, 72, 110), bench(68, 114, 100, 114), post(82, 116, 82, 150)],
    dyn: [{ grip: "ha" }, { rail: ["ha", 150, 72] }], hl: ["chest"]
  };

  A.chest_supported_row = {
    view: "side",
    frames: [
      S({ hip: [70, 80], t: 135, footAt: [66, 146], kb: -1, handAt: [108, 97], eb: 1 }),
      S({ hip: [70, 80], t: 135, footAt: [66, 146], kb: -1, handAt: [88, 70], eb: 1 })
    ],
    props: [floor(), bench(82, 90, 114, 58), post(98, 74, 98, 150), post(78, 150, 118, 150)],
    dyn: [{ dumb: "ha" }], hl: ["lats", "delt"]
  };

  A.overhead_triceps = {
    view: "side",
    frames: [
      S({ hip: [100, 80], t: 162, footAt: [116, 146], foot2At: [82, 146], a: [160, 300] }),
      S({ hip: [100, 80], t: 162, footAt: [116, 146], foot2At: [82, 146], a: [160, 162] })
    ],
    props: [floor(), post(28, 20, 28, 150)], dyn: [{ cable: [30, 96, "ha"] }, { grip: "ha" }], hl: ["upperArm"]
  };

  A.incline_curl = {
    view: "side",
    frames: [
      S({ hip: [112, 114], t: 215, footAt: [152, 146], a: [352, 352] }),
      S({ hip: [112, 114], t: 215, footAt: [152, 146], a: [352, 165] })
    ],
    props: [floor(), bench(118, 118, 82, 72), bench(106, 120, 134, 120), post(112, 122, 112, 150)],
    dyn: [{ dumb: "ha" }], hl: ["upperArm"]
  };

  A.cable_lateral_raise = {
    view: "front",
    frames: [F({ ...FSTAND, a: [-12, -8], aR: [35, 20] }), F({ ...FSTAND, a: [88, 88], aR: [35, 20] })],
    props: [floor(), post(150, 10, 150, 150)], dyn: [{ cable: [148, 142, "haL"] }, { grip: "haL" }], hl: ["delt"]
  };
  A.db_lateral_raise = {
    view: "front",
    frames: [F({ ...FSTAND, t: 184, a: [10, 10] }), F({ ...FSTAND, t: 184, a: [86, 90] })],
    props: [floor()], dyn: [{ dumb: "haL" }, { dumb: "haR" }], hl: ["delt"]
  };
  A.cable_y_raise = {
    view: "front",
    frames: [F({ ...FSTAND, a: [-28, -28] }), F({ ...FSTAND, a: [138, 140] })],
    props: [floor(), post(18, 10, 18, 150), post(182, 10, 182, 150)],
    dyn: [{ cable: [180, 142, "haL"] }, { cable: [20, 142, "haR"] }], hl: ["delt"]
  };

  A.doorway_stretch = {
    view: "side", hold: 600,
    frames: [
      S({ hip: [96, 77], t: 180, footAt: [100, 146], foot2At: [84, 146], handAt: [72, 10], eb: -1 }),
      S({ hip: [104, 78], t: 170, footAt: [100, 146], foot2At: [84, 146], handAt: [72, 10], eb: -1 })
    ],
    props: [floor(), { l: [66, 0, 66, 150, 6], cls: "wall" }], hl: ["chest"]
  };

  A.goblet_squat = {
    view: "side", root: "an",
    frames: [
      S({ hip: [100, 77], t: 180, footAt: [102, 146], foot2At: [98, 146], handAt: [110, 52], eb: 1 }),
      S({ hip: [82, 112], t: 148, footAt: [102, 146], foot2At: [98, 146], handAt: [116, 94], eb: 1 })
    ],
    props: [floor()], dyn: [{ dumb: "ha", vert: true }], hl: ["thigh", "glute"]
  };
  A.squat = {
    view: "side", root: "an",
    frames: [
      S({ hip: [100, 77], t: 180, footAt: [102, 146], foot2At: [98, 146], handAt: [94, 36], eb: -1 }),
      S({ hip: [80, 110], t: 140, footAt: [102, 146], foot2At: [98, 146], handAt: [104, 80], eb: -1 })
    ],
    props: [floor()], dyn: [{ plate: "ha" }], hl: ["thigh", "glute"]
  };
  A.rdl = {
    view: "side", root: "an",
    frames: [
      S({ hip: [100, 77], t: 180, footAt: [104, 146], foot2At: [100, 146], a: [2, 2] }),
      S({ hip: [82, 80], t: 102, footAt: [104, 146], foot2At: [100, 146], a: [0, 0] })
    ],
    props: [floor()], dyn: [{ plate: "ha" }], hl: ["thigh", "glute"]
  };

  A.leg_extension = {
    view: "side",
    frames: [S({ hip: [90, 104], t: 192, l: [90, 2], f: 90, handAt: [94, 110] }), S({ hip: [90, 104], t: 192, l: [90, 86], f: 176, handAt: [94, 110] })],
    props: [floor(), bench(76, 108, 128, 108), bench(72, 60, 76, 106), post(100, 110, 100, 150), { c: [128, 118, 4], cls: "eq" }],
    dyn: [{ pad: "an" }], hl: ["thigh"]
  };
  A.seated_leg_curl = {
    view: "side",
    frames: [S({ hip: [90, 104], t: 174, l: [90, 82], f: 170, handAt: [96, 110] }), S({ hip: [90, 104], t: 174, l: [90, 338], f: 80, handAt: [96, 110] })],
    props: [floor(), bench(74, 108, 128, 108), bench(70, 60, 74, 106), post(96, 110, 96, 150), { r: [108, 92, 24, 6, 3], cls: "padr" }],
    dyn: [{ pad: "an" }], hl: ["thigh"]
  };
  A.calf_raise = {
    view: "side", root: "to",
    frames: [S({ hip: [100, 78], t: 180, footAt: [100, 147], f: 114, a: [2, 2] }), S({ hip: [100, 66], t: 180, footAt: [102, 136], f: 48, a: [2, 2] })],
    props: [floor(), { r: [104, 144, 44, 7, 2], cls: "step" }], hl: ["calf", "shin"]
  };
  A.cable_crunch = {
    view: "side",
    frames: [
      S({ hip: [108, 112], t: 170, l: [2, 270], f: 270, handAt: [120, 66], eb: 1 }),
      S({ hip: [108, 112], t: 100, h: 60, l: [2, 270], f: 270, handAt: [150, 112], eb: 1 })
    ],
    props: [floor(), post(176, 4, 176, 150)], dyn: [{ cable: [174, 6, "ha"] }, { grip: "ha" }], hl: ["abs"]
  };

  A.hip_flexor_stretch = {
    view: "side", hold: 600,
    frames: [
      S({ hip: [94, 104], t: 180, footAt: [128, 147], foot2At: [50, 148], kb2: 1, f2: 270, a: [4, 4] }),
      S({ hip: [104, 106], t: 178, footAt: [128, 147], foot2At: [50, 148], kb2: 1, f2: 270, a: [4, 4] })
    ],
    props: [floor(), { r: [60, 146, 36, 4, 2], cls: "mat" }], hl: ["thigh", "glute"]
  };

  A.dead_bug = {
    view: "side",
    frames: [
      S({ hip: [72, 138], t: 90, a: [180, 180], a2: [180, 180], l: [180, 270], l2: [180, 270], f: 180 }),
      S({ hip: [72, 138], t: 90, a: [112, 112], a2: [180, 180], l: [180, 270], l2: [264, 266], f: 180, f2: 270 })
    ],
    props: [floor()], hl: ["abs"]
  };
  A.plank = {
    view: "side", hold: 500,
    frames: [
      S({ hip: [82, 124], t: 95, a: [0, 90], l: [288, 288], f: 0 }),
      S({ hip: [82, 121], t: 98, a: [2, 90], l: [290, 290], f: 0 })
    ],
    props: [floor(), { r: [100, 146, 70, 4, 2], cls: "mat" }], hl: ["abs", "glute"]
  };

  A.external_rotation = {
    view: "front",
    frames: [F({ ...FSTAND, a: [6, -80], aR: [4, 4] }), F({ ...FSTAND, a: [6, 55], aR: [4, 4] })],
    props: [floor(), post(176, 60, 176, 150)], dyn: [{ band: [[174, 104], "haL"] }], hl: ["delt"]
  };
  A.face_pull = {
    view: "side",
    frames: [
      S({ ...STAND, handAt: [142, 34], eb: 1 }),
      S({ ...STAND, handAt: [108, 18], eb: -1 })
    ],
    props: [floor(), post(176, 4, 176, 150)], dyn: [{ cable: [174, 30, "ha"] }, { grip: "ha" }], hl: ["delt"]
  };
  A.shoulder_press = {
    view: "front",
    frames: [F({ hip: [100, 102], lr: 0.35, a: [78, 178] }), F({ hip: [100, 102], lr: 0.35, a: [160, 176] })],
    props: [floor(), { r: [80, 40, 40, 64, 5], cls: "padr" }, { r: [76, 102, 48, 8, 3], cls: "padr" }, post(100, 110, 100, 150)],
    dyn: [{ dumb: "haL" }, { dumb: "haR" }], hl: ["delt"]
  };
  A.low_high_fly = {
    view: "front",
    frames: [F({ ...FSTAND, a: [40, 36] }), F({ ...FSTAND, a: [205, 190], reach: 0.6 })],
    props: [floor(), post(18, 10, 18, 150), post(182, 10, 182, 150)],
    dyn: [{ cable: [20, 142, "haL"] }, { cable: [180, 142, "haR"] }], hl: ["chest"]
  };
  A.pushdown = {
    view: "side",
    frames: [S({ ...STAND, t: 172, a: [2, 150] }), S({ ...STAND, t: 172, a: [2, 4] })],
    props: [floor(), post(150, 4, 150, 150)], dyn: [{ cable: [148, 8, "ha"] }, { grip: "ha" }], hl: ["upperArm"]
  };

  const BAR = [{ l: [70, 6, 140, 6, 4], cls: "eq" }, post(72, 6, 72, 150), post(138, 6, 138, 150)];
  A.dead_hang = {
    view: "side", root: "ha", hold: 500,
    frames: [
      S({ neck: [100, 58], t: 180, handAt: [104, 8], eb: 1, l: [8, 330], f: 20 }),
      S({ neck: [100, 50], t: 182, handAt: [104, 8], eb: 1, l: [8, 330], f: 20 })
    ],
    props: [floor(), ...BAR], hl: ["lats"]
  };
  A.pullup = {
    view: "side", root: "ha",
    frames: [
      S({ neck: [100, 56], t: 180, handAt: [104, 8], eb: 1, l: [8, 330], f: 20 }),
      S({ neck: [98, 22], t: 186, handAt: [104, 8], eb: 1, l: [10, 330], f: 20 })
    ],
    props: [floor(), ...BAR], hl: ["lats", "upperArm"]
  };
  A.hanging_leg_raise = {
    view: "side", root: "ha",
    frames: [
      S({ neck: [100, 56], t: 180, handAt: [104, 8], eb: 1, l: [6, 350], f: 30 }),
      S({ neck: [100, 56], t: 190, handAt: [104, 8], eb: 1, l: [108, 20], f: 110 })
    ],
    props: [floor(), ...BAR], hl: ["abs"]
  };

  A.y_raise = {
    view: "side",
    frames: [
      S({ hip: [70, 80], t: 135, footAt: [66, 146], kb: -1, a: [4, 4] }),
      S({ hip: [70, 80], t: 135, footAt: [66, 146], kb: -1, a: [138, 138] })
    ],
    props: [floor(), bench(82, 90, 114, 58), post(98, 74, 98, 150), post(78, 150, 118, 150)],
    hl: ["delt", "lats"]
  };

  A.db_row = {
    view: "side",
    frames: [
      S({ neck: [118, 84], t: 95, hand2At: [120, 128], a: [0, 0], footAt: [58, 147], foot2At: [42, 128], kb2: 1, f2: 270 }),
      S({ neck: [118, 84], t: 97, hand2At: [120, 128], handAt: [96, 98], eb: 1, footAt: [58, 147], foot2At: [42, 128], kb2: 1, f2: 270 })
    ],
    props: [floor(), bench(34, 133, 132, 133), post(44, 136, 44, 150), post(124, 136, 124, 150)],
    dyn: [{ dumb: "ha" }], hl: ["lats"]
  };

  A.straight_arm_pulldown = {
    view: "side",
    frames: [S({ ...STAND, t: 160, a: [148, 148] }), S({ ...STAND, t: 160, a: [8, 8] })],
    props: [floor(), post(176, 4, 176, 150)], dyn: [{ cable: [174, 8, "ha"] }, { grip: "ha", bar: true }], hl: ["lats"]
  };

  A.seated_row = {
    view: "side",
    frames: [
      S({ hip: [70, 118], t: 150, footAt: [128, 124], handAt: [140, 98], eb: 1, f: 170 }),
      S({ hip: [70, 118], t: 184, footAt: [128, 124], handAt: [92, 102], eb: 1, f: 170 })
    ],
    props: [floor(), bench(48, 122, 96, 122), post(72, 124, 72, 150), { l: [132, 110, 134, 140, 5], cls: "pad" }, post(176, 60, 176, 150)],
    dyn: [{ cable: [174, 112, "ha"] }, { grip: "ha" }], hl: ["lats"]
  };

  A.rear_delt_fly = {
    view: "front",
    frames: [F({ hip: [100, 102], lr: 0.35, a: [90, 90], reach: 0.3 }), F({ hip: [100, 102], lr: 0.35, a: [92, 92], reach: 1 })],
    props: [floor(), { r: [76, 102, 48, 8, 3], cls: "padr" }, post(100, 110, 100, 150), { r: [88, 64, 24, 30, 5], cls: "padr" }],
    dyn: [{ grip: "haL" }, { grip: "haR" }], hl: ["delt"]
  };

  A.bayesian_curl = {
    view: "side",
    frames: [
      S({ hip: [104, 77], t: 176, footAt: [118, 146], foot2At: [88, 146], a: [340, 345] }),
      S({ hip: [104, 77], t: 176, footAt: [118, 146], foot2At: [88, 146], a: [340, 165] })
    ],
    props: [floor(), post(24, 60, 24, 150)], dyn: [{ cable: [26, 128, "ha"] }, { grip: "ha" }], hl: ["upperArm"]
  };

  A.thoracic_extension = {
    view: "side", hold: 500,
    frames: [
      S({ hip: [62, 140], t: 78, h: 80, handAt: [126, 118], eb: 1, footAt: [26, 148], kb: 1, f: 270 }),
      S({ hip: [62, 140], t: 98, h: 110, handAt: [128, 138], eb: 1, footAt: [26, 148], kb: 1, f: 270 })
    ],
    props: [floor(), { c: [92, 141, 9], cls: "roller" }], hl: ["torso"]
  };

  A.glute_bridge = {
    view: "side", root: "neck",
    frames: [
      S({ neck: [54, 142], t: 270, h: 270, footAt: [126, 147], kb: -1, handAt: [94, 147], f: 90 }),
      S({ neck: [54, 142], t: 294, h: 270, footAt: [126, 147], kb: -1, handAt: [92, 147], f: 90 })
    ],
    props: [floor(), { r: [30, 146, 110, 4, 2], cls: "mat" }], hl: ["glute"]
  };

  A.hip_thrust = {
    view: "side", root: "neck",
    frames: [
      S({ neck: [66, 112], t: 222, h: 230, footAt: [140, 147], kb: -1, handAt: [96, 134] }),
      S({ neck: [66, 112], t: 272, h: 250, footAt: [140, 147], kb: -1, handAt: [108, 106] })
    ],
    props: [floor(), bench(24, 118, 66, 118), post(30, 120, 30, 150), post(60, 120, 60, 150)],
    dyn: [{ plate: "hip" }], hl: ["glute"]
  };

  A.bulgarian = {
    view: "side", root: "an",
    frames: [
      S({ hip: [96, 80], t: 176, footAt: [124, 147], foot2At: [50, 116], kb2: 1, f2: 250, a: [0, 0] }),
      S({ hip: [92, 108], t: 160, footAt: [124, 147], foot2At: [50, 116], kb2: 1, f2: 250, a: [0, 0] })
    ],
    props: [floor(), bench(24, 121, 62, 121), post(30, 124, 30, 150), post(56, 124, 56, 150)],
    dyn: [{ dumb: "ha" }], hl: ["thigh", "glute"]
  };

  A.leg_press = {
    view: "side",
    frames: [
      S({ hip: [70, 122], t: 238, footAt: [102, 84], kb: 1, f: 170, handAt: [74, 128] }),
      S({ hip: [70, 122], t: 238, footAt: [128, 58], kb: 1, f: 170, handAt: [74, 128] })
    ],
    props: [floor(), bench(76, 130, 30, 102), post(56, 124, 56, 150), post(100, 150, 176, 30)],
    dyn: [{ platform: "an" }], hl: ["thigh"]
  };

  A.pallof = {
    view: "side", hold: 600,
    frames: [S({ ...STAND, handAt: [112, 60], eb: 1 }), S({ ...STAND, handAt: [146, 58], eb: 1 })],
    props: [floor(), { l: [30, 30, 30, 150, 3], cls: "eq back" }], dyn: [{ cable: [32, 60, "ha", "back"] }, { grip: "ha" }], hl: ["abs"]
  };

  A.hamstring_stretch = {
    view: "side", hold: 700,
    frames: [
      S({ hip: [80, 140], t: 90, l: [158, 158], l2: [270, 270], f: 160, f2: 180, handAt: [98, 100], eb: 1 }),
      S({ hip: [80, 140], t: 90, l: [146, 146], l2: [270, 270], f: 150, f2: 180, handAt: [104, 96], eb: 1 })
    ],
    props: [floor()], dyn: [{ strap: ["ha", "an"] }], hl: ["thigh"]
  };

  // Alias
  A.couch_stretch = A.hip_flexor_stretch;

  // ============================================================
  //  MOTOR
  // ============================================================
  const NS = "http://www.w3.org/2000/svg";
  const mk = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };

  // Árbol a partir de un nodo raíz (BFS) para interpolar ángulos
  function order(view, root) {
    const adj = {};
    EDGES[view].forEach(([a, b]) => { (adj[a] = adj[a] || []).push(b); (adj[b] = adj[b] || []).push(a); });
    const seen = new Set([root]), out = [], q = [root];
    while (q.length) { const p = q.shift(); (adj[p] || []).forEach((c) => { if (!seen.has(c)) { seen.add(c); out.push([p, c]); q.push(c); } }); }
    return out;
  }

  function lerpPose(def, A0, B0, e) {
    const root = def.root || "hip";
    const p = { [root]: [A0[root][0] + (B0[root][0] - A0[root][0]) * e, A0[root][1] + (B0[root][1] - A0[root][1]) * e] };
    def._order = def._order || order(def.view, root);
    def._order.forEach(([a, c]) => {
      const va = [A0[c][0] - A0[a][0], A0[c][1] - A0[a][1]], vb = [B0[c][0] - B0[a][0], B0[c][1] - B0[a][1]];
      const la = Math.hypot(...va), lb = Math.hypot(...vb);
      const aa = Math.atan2(va[1], va[0]); let d = Math.atan2(vb[1], vb[0]) - aa;
      while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
      const ang = aa + d * e, len = la + (lb - la) * e;
      p[c] = [p[a][0] + Math.cos(ang) * len, p[a][1] + Math.sin(ang) * len];
    });
    return p;
  }

  const ease = { inout: (x) => 0.5 - 0.5 * Math.cos(Math.PI * x), linear: (x) => x };

  // Devuelve la pose para el tiempo t (ms)
  function poseAt(def, t) {
    const fr = def.frames, n = fr.length;
    const seg = def.seg ?? 1100, hold = def.hold ?? 280, ez = ease[def.ease || "inout"];
    const loop = def.mode === "loop" || n > 2;
    const steps = loop ? n : 2;
    const unit = seg + hold, total = unit * steps;
    let tt = t % total; const i = Math.floor(tt / unit); const local = tt - i * unit;
    const e = local < hold ? 0 : ez(Math.min(1, (local - hold) / seg));
    const from = fr[i % n], to = loop ? fr[(i + 1) % n] : fr[(i + 1) % 2];
    return lerpPose(def, from, to, e);
  }

  function pt(p, ref) { return typeof ref === "string" ? p[ref] : ref; }

  // Crea la figura SVG dentro de `host` y devuelve { update(t) }
  function create(host, key) {
    const def = A[key];
    const svg = mk("svg", { viewBox: "0 -26 200 186", class: "fig", role: "img", "aria-label": "Animación de referencia del ejercicio" });
    const defs = mk("defs", {}, svg);
    const gid = "g" + Math.random().toString(36).slice(2, 8);
    const f = mk("filter", { id: gid, x: "-50%", y: "-50%", width: "200%", height: "200%" }, defs);
    mk("feGaussianBlur", { stdDeviation: "3.2" }, f);
    if (!def) { mk("text", { x: 100, y: 84, "text-anchor": "middle", class: "fig-missing" }, svg).textContent = "Sin animación"; host.appendChild(svg); return { update() {} }; }

    const gBack = mk("g", {}, svg), gStatic = mk("g", {}, svg), gFar = mk("g", { class: "far" }, svg);
    const gGlow = mk("g", { class: "glow", filter: `url(#${gid})` }, svg);
    const gNear = mk("g", { class: "near" }, svg), gHl = mk("g", { class: "hl" }, svg), gFront = mk("g", {}, svg);

    (def.props || []).forEach((s) => {
      const parent = (s.cls || "").includes("back") ? gBack : gStatic;
      if (s.l) mk("line", { x1: s.l[0], y1: s.l[1], x2: s.l[2], y2: s.l[3], "stroke-width": s.l[4] || 3, class: "p " + (s.cls || "eq") }, parent);
      if (s.c) mk("circle", { cx: s.c[0], cy: s.c[1], r: s.c[2], class: "p " + (s.cls || "eq") }, parent);
      if (s.r) mk("rect", { x: s.r[0], y: s.r[1], width: s.r[2], height: s.r[3], rx: s.r[4] || 2, class: "p " + (s.cls || "eq") }, parent);
    });

    const bones = BONES[def.view].map(([a, b, w, layer]) => ({ a, b, el: mk("line", { "stroke-width": w, class: "bone " + layer }, layer === "far" ? gFar : gNear) }));
    const head = mk("circle", { r: L.HEAD, class: "head" }, gNear);
    const hls = [];
    (def.hl || []).forEach((h) => (HL_SEG[def.view][h] || []).forEach(([a, b, w]) => {
      hls.push({ a, b, el: mk("line", { "stroke-width": w, class: "hlseg" }, gHl), glow: mk("line", { "stroke-width": w + 6, class: "hlglow" }, gGlow) });
    }));
    const blobEls = [];

    // Equipo móvil
    const dyn = (def.dyn || []).map((d) => {
      const o = { d };
      if (d.cable) {
        const par = d.cable[3] === "back" ? gBack : gStatic;
        mk("circle", { cx: d.cable[0], cy: d.cable[1], r: 4, class: "p pulley" }, par);
        o.el = mk("line", { class: "cable" }, par);
      }
      if (d.band) o.el = mk("line", { class: "band" }, gFront);
      if (d.strap) o.el = mk("line", { class: "band" }, gFront);
      if (d.rail) o.el = mk("line", { class: "p eq", "stroke-width": 3 }, gStatic);
      if (d.dumb) {
        o.el = mk("g", { class: "dumb" }, gFront);
        if (d.vert) { mk("rect", { x: -2, y: -8, width: 4, height: 16, rx: 1 }, o.el); mk("rect", { x: -6, y: -11, width: 12, height: 5, rx: 2 }, o.el); mk("rect", { x: -6, y: 6, width: 12, height: 5, rx: 2 }, o.el); }
        else { mk("rect", { x: -8, y: -1.8, width: 16, height: 3.6, rx: 1 }, o.el); mk("rect", { x: -11, y: -5.5, width: 5, height: 11, rx: 2 }, o.el); mk("rect", { x: 6, y: -5.5, width: 5, height: 11, rx: 2 }, o.el); }
      }
      if (d.plate) { o.el = mk("g", { class: "plate" }, gFront); mk("circle", { r: 10 }, o.el); mk("circle", { r: 3, class: "hub" }, o.el); }
      if (d.grip) { o.el = mk("g", {}, gFront); mk("circle", { r: 3, class: "gripc" }, o.el); if (d.bar || d.bandbar) mk("line", { x1: -9, y1: 0, x2: 9, y2: 0, class: d.bandbar ? "band" : "gripbar" }, o.el); }
      if (d.pad) o.el = mk("circle", { r: 5.5, class: "p padc" }, gFront);
      if (d.seat) o.el = mk("rect", { width: 26, height: 6, rx: 2, class: "p pad2" }, gStatic);
      if (d.platform) o.el = mk("line", { class: "p eq", "stroke-width": 6 }, gStatic);
      return o;
    });

    host.appendChild(svg);

    function update(t) {
      const p = poseAt(def, t);
      bones.forEach((b) => { const A1 = p[b.a], B1 = p[b.b]; if (!A1 || !B1) return; b.el.setAttribute("x1", A1[0]); b.el.setAttribute("y1", A1[1]); b.el.setAttribute("x2", B1[0]); b.el.setAttribute("y2", B1[1]); });
      head.setAttribute("cx", p.head[0]); head.setAttribute("cy", p.head[1]);
      hls.forEach((h) => { const A1 = p[h.a], B1 = p[h.b]; [h.el, h.glow].forEach((el) => { el.setAttribute("x1", A1[0]); el.setAttribute("y1", A1[1]); el.setAttribute("x2", B1[0]); el.setAttribute("y2", B1[1]); }); });
      const bl = blobs(def.view, p, def.hl || []);
      while (blobEls.length < bl.length) blobEls.push({ core: mk("circle", { class: "blob" }, gHl), glow: mk("circle", { class: "blobglow" }, gGlow) });
      bl.forEach((b, i) => { const e = blobEls[i]; e.core.setAttribute("cx", b[0]); e.core.setAttribute("cy", b[1]); e.core.setAttribute("r", b[2] * 0.62); e.glow.setAttribute("cx", b[0]); e.glow.setAttribute("cy", b[1]); e.glow.setAttribute("r", b[2] * 1.25); });
      dyn.forEach(({ d, el }) => {
        if (d.cable) { const q = pt(p, d.cable[2]); el.setAttribute("x1", d.cable[0]); el.setAttribute("y1", d.cable[1]); el.setAttribute("x2", q[0]); el.setAttribute("y2", q[1]); }
        if (d.band || d.strap) { const [a, b] = d.band || d.strap; const qa = pt(p, a), qb = pt(p, b); el.setAttribute("x1", qa[0]); el.setAttribute("y1", qa[1]); el.setAttribute("x2", qb[0]); el.setAttribute("y2", qb[1]); }
        if (d.rail) { const q = pt(p, d.rail[0]); el.setAttribute("x1", q[0]); el.setAttribute("y1", q[1]); el.setAttribute("x2", d.rail[1]); el.setAttribute("y2", d.rail[2]); }
        const at = d.dumb || d.plate || d.grip || d.pad;
        if (at) { const q = p[at]; if (d.pad) { el.setAttribute("cx", q[0]); el.setAttribute("cy", q[1]); } else el.setAttribute("transform", `translate(${q[0]},${q[1]})`); }
        if (d.seat) { const q = p[d.seat]; el.setAttribute("x", q[0] - 13); el.setAttribute("y", q[1] + 5); }
        if (d.platform) { const q = p[d.platform]; el.setAttribute("x1", q[0] - 10); el.setAttribute("y1", q[1] - 10); el.setAttribute("x2", q[0] + 12); el.setAttribute("y2", q[1] + 12); }
      });
    }
    update(0);
    return { update, def };
  }

  // ---------- Bucle global: solo anima lo visible ----------
  const live = new Set();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const io = "IntersectionObserver" in window ? new IntersectionObserver((ents) => ents.forEach((e) => {
    const f = e.target.__fig; if (!f) return; e.isIntersecting ? live.add(f) : live.delete(f);
  }), { rootMargin: "80px" }) : null;
  let t0 = performance.now();
  function tick(now) {
    const t = now - t0;
    live.forEach((f) => f.update(t + f.offset));
    requestAnimationFrame(tick);
  }
  if (!reduce) requestAnimationFrame(tick);

  window.FIGURAS = {
    keys: Object.keys(A),
    mount(host, key, offset = 0) {
      const f = create(host, key);
      f.offset = offset;
      if (reduce) { f.update(((f.def && f.def.seg) || 1100) + ((f.def && f.def.hold) || 280)); return f; }
      host.__fig = f;
      if (io) io.observe(host); else live.add(f);
      return f;
    },
    unmount(host) { const f = host && host.__fig; if (f) { live.delete(f); if (io) io.unobserve(host); host.__fig = null; } },
    render: create // usado por las pruebas
  };
})();
