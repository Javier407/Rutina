// ============================================================
//  DATOS DE LA RUTINA — edita aquí ejercicios, series y estudios
//  Estructura: ESTUDIOS (evidencia) + SEMANA (días → bloques → ejercicios)
// ============================================================

const ESTUDIOS = {
  // ---------- Volumen y frecuencia ----------
  schoenfeld2017: {
    tema: "Volumen y frecuencia",
    autores: "Schoenfeld BJ, Ogborn D, Krieger JW",
    anio: 2017,
    titulo: "Dose-response relationship between weekly resistance training volume and increases in muscle mass",
    revista: "Journal of Sports Sciences, 35(11):1073–1082",
    tipo: "Metaanálisis",
    hallazgo: "Relación dosis-respuesta: más series semanales por músculo producen más hipertrofia; 10+ series por semana mostraron los mejores resultados.",
    aplicacion: "Los músculos prioritarios (deltoide lateral, dorsal, pecho superior) reciben más de 10 series por semana.",
    url: "https://doi.org/10.1080/02640414.2016.1210197"
  },
  pelland2025: {
    tema: "Volumen y frecuencia",
    autores: "Pelland JC, Remmert JF, Robinson ZP, Hinson SR, Zourdos MC",
    anio: 2025,
    titulo: "The Resistance Training Dose Response: Meta-Regressions Exploring the Effects of Weekly Volume and Frequency on Muscle Hypertrophy and Strength Gains",
    revista: "Sports Medicine",
    tipo: "Metarregresión",
    hallazgo: "El volumen semanal sigue una relación positiva con la hipertrofia, con rendimientos decrecientes a volúmenes altos. La frecuencia aporta poco cuando el volumen está igualado.",
    aplicacion: "Se sube el volumen solo donde hay un punto débil, sin inflar el resto, y se reparte en 2–4 días por semana para que cada sesión rinda.",
    url: "https://doi.org/10.1007/s40279-025-02344-w"
  },
  schoenfeld2016freq: {
    tema: "Volumen y frecuencia",
    autores: "Schoenfeld BJ, Ogborn D, Krieger JW",
    anio: 2016,
    titulo: "Effects of resistance training frequency on measures of muscle hypertrophy",
    revista: "Sports Medicine, 46(11):1689–1697",
    tipo: "Metaanálisis",
    hallazgo: "Entrenar cada músculo al menos 2 veces por semana dio mejores resultados de hipertrofia que 1 vez.",
    aplicacion: "Cada grupo muscular aparece al menos 2 veces en la semana; el deltoide lateral, 4.",
    url: "https://doi.org/10.1007/s40279-016-0543-8"
  },

  // ---------- Intensidad del esfuerzo ----------
  refalo2023: {
    tema: "Esfuerzo (RIR)",
    autores: "Refalo MC, Helms ER, Trexler ET, Hamilton DL, Fyfe JJ",
    anio: 2023,
    titulo: "Influence of Resistance Training Proximity-to-Failure on Skeletal Muscle Hypertrophy",
    revista: "Sports Medicine, 53(3):649–665",
    tipo: "Metaanálisis",
    hallazgo: "Terminar las series más cerca del fallo dio una ventaja pequeña en hipertrofia, con una relación no lineal.",
    aplicacion: "Las series efectivas se hacen a RIR 0–2: cerca del fallo, sin buscarlo siempre en los compuestos.",
    url: "https://doi.org/10.1007/s40279-022-01784-y"
  },
  robinson2024: {
    tema: "Esfuerzo (RIR)",
    autores: "Robinson ZP, Pelland JC, Remmert JF, Refalo MC, Jukic I, Steele J, Zourdos MC",
    anio: 2024,
    titulo: "Exploring the dose–response relationship between estimated resistance training proximity to failure, strength gain, and muscle hypertrophy",
    revista: "Sports Medicine, 54(9):2209–2231",
    tipo: "Metarregresión",
    hallazgo: "Acercarse al fallo favorece la hipertrofia, mientras que la fuerza no mejora por ir al fallo.",
    aplicacion: "Compuestos pesados a RIR 1–2 (cuidan la fuerza y la fatiga); aislamientos a RIR 0–1.",
    url: "https://doi.org/10.1007/s40279-024-02069-2"
  },
  refalo2024: {
    tema: "Esfuerzo (RIR)",
    autores: "Refalo MC, Helms ER, Robinson ZP, Hamilton DL, Fyfe JJ",
    anio: 2024,
    titulo: "Similar muscle hypertrophy following eight weeks of resistance training to momentary muscular failure or with repetitions-in-reserve",
    revista: "Journal of Sports Sciences, 42:85–101",
    tipo: "Ensayo controlado",
    hallazgo: "En personas entrenadas, ir al fallo y dejar 1–2 repeticiones en reserva produjeron un crecimiento similar del cuádriceps.",
    aplicacion: "No hace falta llegar al fallo en sentadilla, peso muerto rumano ni prensas: RIR 1–2 basta.",
    url: "https://doi.org/10.1080/02640414.2024.2321021"
  },

  // ---------- Descanso y progresión ----------
  schoenfeld2016rest: {
    tema: "Descanso y progresión",
    autores: "Schoenfeld BJ, Pope ZK, Benik FM, et al.",
    anio: 2016,
    titulo: "Longer Interset Rest Periods Enhance Muscle Strength and Hypertrophy in Resistance-Trained Men",
    revista: "Journal of Strength and Conditioning Research, 30(7):1805–1812",
    tipo: "Ensayo aleatorizado",
    hallazgo: "Descansar 3 minutos entre series produjo más fuerza y más grosor muscular en el muslo que descansar 1 minuto.",
    aplicacion: "2–3 min en compuestos; 90 s–2 min en aislamientos. Por eso el bloque dura 2 horas.",
    url: "https://doi.org/10.1519/JSC.0000000000001272"
  },
  singer2024: {
    tema: "Descanso y progresión",
    autores: "Singer A, Wolf M, Generoso L, Arias E, et al.",
    anio: 2024,
    titulo: "Give it a rest: a systematic review with Bayesian meta-analysis on the effect of inter-set rest interval duration on muscle hypertrophy",
    revista: "Frontiers in Sports and Active Living",
    tipo: "Metaanálisis bayesiano",
    hallazgo: "Descansar más de 60 s tiene una ligera ventaja para la hipertrofia; por encima de ~90 s la diferencia adicional es pequeña.",
    aplicacion: "En los aislamientos no se baja de 90 s; en los compuestos se descansa más porque la fatiga general es mayor.",
    url: "https://doi.org/10.3389/fspor.2024.1429789"
  },
  plotkin2022: {
    tema: "Descanso y progresión",
    autores: "Plotkin D, Coleman M, Van Every D, et al., Schoenfeld BJ",
    anio: 2022,
    titulo: "Progressive overload without progressing load? The effects of load or repetition progression on muscular adaptations",
    revista: "PeerJ, 10:e14142",
    tipo: "Ensayo aleatorizado",
    hallazgo: "Progresar sumando repeticiones o sumando peso produjo una hipertrofia similar en 8 semanas.",
    aplicacion: "Doble progresión: primero llenas el rango de repeticiones y luego subes el peso.",
    url: "https://doi.org/10.7717/peerj.14142"
  },

  // ---------- Rango de movimiento / posición estirada ----------
  maeo2023: {
    tema: "Rango de movimiento",
    autores: "Maeo S, Wu Y, Huang M, et al.",
    anio: 2023,
    titulo: "Triceps brachii hypertrophy is substantially greater after elbow extension training performed in the overhead versus neutral arm position",
    revista: "European Journal of Sport Science, 23(7):1240–1250",
    tipo: "Ensayo intra-sujeto",
    hallazgo: "La extensión de tríceps con el brazo sobre la cabeza produjo más crecimiento del tríceps (sobre todo de la cabeza larga) que con el brazo al costado.",
    aplicacion: "La extensión sobre la cabeza es el ejercicio principal de tríceps.",
    url: "https://doi.org/10.1080/17461391.2022.2100279"
  },
  maeo2021: {
    tema: "Rango de movimiento",
    autores: "Maeo S, Huang M, Wu Y, et al.",
    anio: 2021,
    titulo: "Greater Hamstrings Muscle Hypertrophy but Similar Damage Protection after Training at Long versus Short Muscle Lengths",
    revista: "Medicine & Science in Sports & Exercise, 53(4):825–837",
    tipo: "Ensayo intra-sujeto",
    hallazgo: "El curl femoral sentado produjo más crecimiento de isquiotibiales que el acostado (+14 % vs +9 %).",
    aplicacion: "Curl femoral sentado en los dos días de pierna.",
    url: "https://doi.org/10.1249/MSS.0000000000002523"
  },
  pedrosa2022: {
    tema: "Rango de movimiento",
    autores: "Pedrosa GF, Lima FV, Schoenfeld BJ, et al.",
    anio: 2022,
    titulo: "Partial range of motion training elicits favorable improvements in muscular adaptations when carried out at long muscle lengths",
    revista: "European Journal of Sport Science, 22(8):1250–1260",
    tipo: "Ensayo aleatorizado",
    hallazgo: "En la extensión de cuádriceps, los parciales en la parte estirada del movimiento dieron más hipertrofia que los parciales en la parte corta.",
    aplicacion: "Si usas parciales, hazlos en la parte estirada (por ejemplo, al final de la última serie).",
    url: "https://doi.org/10.1080/17461391.2021.1927199"
  },
  wolf2025: {
    tema: "Rango de movimiento",
    autores: "Wolf M, Korakakis PA, Piñero A, et al.",
    anio: 2025,
    titulo: "Lengthened partial repetitions elicit similar muscular adaptations as a full range of motion during resistance training in trained individuals",
    revista: "PeerJ, 13:e18904",
    tipo: "Ensayo aleatorizado",
    hallazgo: "En personas entrenadas, los parciales en posición estirada dieron resultados similares al rango completo.",
    aplicacion: "La base es el rango completo; los parciales estirados son una herramienta opcional, no obligatoria.",
    url: "https://doi.org/10.7717/peerj.18904"
  },
  kassiano2023a: {
    tema: "Rango de movimiento",
    autores: "Kassiano W, Costa B, Nunes JP, Ribeiro AS, Schoenfeld BJ, Cyrino ES",
    anio: 2023,
    titulo: "Which ROMs Lead to Rome? A Systematic Review of the Effects of Range of Motion on Muscle Hypertrophy",
    revista: "Journal of Strength and Conditioning Research, 37(5):1135–1144",
    tipo: "Revisión sistemática",
    hallazgo: "Entrenar a longitudes musculares largas (rango completo o parciales estirados) tiende a favorecer la hipertrofia en varios músculos, aunque los resultados varían.",
    aplicacion: "Se eligen variantes con buen estiramiento bajo carga: curl inclinado, curl bayesiano, peso muerto rumano, aperturas.",
    url: "https://doi.org/10.1519/JSC.0000000000004415"
  },
  kassiano2023b: {
    tema: "Rango de movimiento",
    autores: "Kassiano W, Costa B, Kunevaliki G, et al.",
    anio: 2023,
    titulo: "Greater Gastrocnemius Muscle Hypertrophy After Partial Range of Motion Training Performed at Long Muscle Lengths",
    revista: "Journal of Strength and Conditioning Research, 37(9):1746–1753",
    tipo: "Ensayo aleatorizado",
    hallazgo: "En la elevación de talones, trabajar la parte estirada del movimiento produjo más crecimiento del gemelo.",
    aplicacion: "En las pantorrillas, pausa de 1–2 s abajo, con el talón bien estirado.",
    url: "https://doi.org/10.1519/JSC.0000000000004460"
  },

  // ---------- Selección de ejercicios específicos ----------
  chaves2020: {
    tema: "Selección de ejercicios",
    autores: "Chaves SF, Rocha-Júnior VA, Encarnação IGA, et al.",
    anio: 2020,
    titulo: "Effects of Horizontal and Incline Bench Press on Neuromuscular Adaptations in Untrained Young Men",
    revista: "International Journal of Exercise Science, 13(6)",
    tipo: "Ensayo aleatorizado",
    hallazgo: "El grupo que solo hizo press inclinado tuvo el mayor aumento de grosor en la parte superior del pectoral.",
    aplicacion: "El press inclinado va primero en los días de empuje para priorizar el pecho superior.",
    url: "https://pubmed.ncbi.nlm.nih.gov/32922646/"
  },
  coratella2020: {
    tema: "Selección de ejercicios",
    autores: "Coratella G, Tornatore G, Longo S, Esposito F, Cè E",
    anio: 2020,
    titulo: "An Electromyographic Analysis of Lateral Raise Variations and Frontal Raise in Competitive Bodybuilders",
    revista: "Int J Environ Res Public Health, 17(17):6015",
    tipo: "Estudio EMG",
    hallazgo: "La elevación lateral con el húmero en rotación neutra activó más el deltoide medio; rotarlo hacia adentro desplaza el trabajo al deltoide posterior y al trapecio.",
    aplicacion: "Elevaciones laterales con agarre neutro, sin girar el pulgar hacia abajo.",
    url: "https://doi.org/10.3390/ijerph17176015"
  },
  larsen2025: {
    tema: "Selección de ejercicios",
    autores: "Larsen S, Wolf M, Schoenfeld BJ, et al.",
    anio: 2025,
    titulo: "Dumbbell versus cable lateral raises for lateral deltoid hypertrophy: an experimental study",
    revista: "Frontiers in Physiology, 16:1611468",
    tipo: "Ensayo intra-sujeto",
    hallazgo: "Las elevaciones laterales con mancuerna y con polea produjeron un crecimiento similar del deltoide lateral (2 sesiones × 5 series a la semana).",
    aplicacion: "Se combinan polea y mancuerna según disponibilidad; lo que importa es el volumen y el esfuerzo.",
    url: "https://doi.org/10.3389/fphys.2025.1611468"
  },

  // ---------- Postura ----------
  sheikhhoseini2018: {
    tema: "Postura",
    autores: "Sheikhhoseini R, Shahrbanian S, Sayyadi P, O'Sullivan K",
    anio: 2018,
    titulo: "Effectiveness of Therapeutic Exercise on Forward Head Posture: A Systematic Review and Meta-analysis",
    revista: "Journal of Manipulative and Physiological Therapeutics, 41(6):530–539",
    tipo: "Metaanálisis",
    hallazgo: "Los programas de ejercicio terapéutico mejoraron los ángulos de la postura de cabeza adelantada.",
    aplicacion: "Chin tucks y fortalecimiento de flexores profundos del cuello en cada día de tren superior.",
    url: "https://doi.org/10.1016/j.jmpt.2018.02.002"
  },
  sepehri2024: {
    tema: "Postura",
    autores: "Sepehri S, Sheikhhoseini R, Piri H, Sayyadi P",
    anio: 2024,
    titulo: "The effect of various therapeutic exercises on forward head posture, rounded shoulder, and hyperkyphosis among people with upper crossed syndrome",
    revista: "BMC Musculoskeletal Disorders, 25(1):105",
    tipo: "Metaanálisis",
    hallazgo: "Combinar fuerza, estiramientos y ejercicios de hombro y escápula mejoró la cabeza adelantada, los hombros redondeados y la cifosis.",
    aplicacion: "El bloque de postura mezcla fortalecimiento (face pull, Y-raise), estiramiento de pectoral y control escapular.",
    url: "https://doi.org/10.1186/s12891-024-07224-4"
  }
};

// Nota metodológica (no es un estudio): base de la estructura
const METODOLOGIA = {
  fuente: "Jeff Nippard",
  principios: [
    "Split Upper / Lower + Push / Pull / Legs de 5 días",
    "RIR para regular el esfuerzo (1–2 en compuestos, 0–1 en aislamientos)",
    "Doble progresión: llenar el rango de repeticiones antes de subir peso",
    "Preferir variantes con carga en la posición estirada",
    "Más volumen solo en los puntos débiles"
  ],
  nota: "Nippard aplica y divulga la evidencia; los estudios de la pestaña Evidencia son la fuente primaria."
};

// ------------------------------------------------------------
//  Tipos de bloque (colores en styles.css)
// ------------------------------------------------------------
const TIPOS = {
  calentamiento: "Calentamiento",
  postura: "Postura",
  core: "Core y pelvis",
  principal: "Bloque principal",
  prioridad: "Prioridad: deltoide lateral",
  enfriamiento: "Enfriamiento"
};

// ------------------------------------------------------------
//  SEMANA — 5 días, 16:00 a 18:00
// ------------------------------------------------------------
const SEMANA = [
  {
    id: "lun",
    dia: "Lunes",
    nombre: "Upper · Fuerza",
    enfoque: "Pecho superior, dorsal, deltoide lateral",
    bloques: [
      {
        tipo: "calentamiento", inicio: "16:00", fin: "16:10",
        ejercicios: [
          { nombre: "Remo ergómetro o bicicleta", anim: "row_erg", musculos: ["General"], series: 1, reps: "5 min", rir: "—", descanso: "—",
            tecnica: "Ritmo suave, hasta sudar ligeramente.", estudios: [] },
          { nombre: "Movilidad de hombro con banda (dislocaciones)", anim: "band_dislocate", musculos: ["Hombro"], series: 2, reps: "10", rir: "—", descanso: "—",
            tecnica: "Brazos rectos, agarre ancho; sube y baja sin encoger los hombros.", estudios: [] }
        ]
      },
      {
        tipo: "postura", inicio: "16:10", fin: "16:25",
        ejercicios: [
          { nombre: "Chin tucks (retracción cervical)", anim: "chin_tuck", musculos: ["Flexores profundos del cuello"], series: 2, reps: "10 × 5 s", rir: "—", descanso: "30 s",
            tecnica: "Mete el mentón como haciendo papada, nuca larga. Mantén 5 s sin inclinar la cabeza.", estudios: ["sheikhhoseini2018"] },
          { nombre: "Wall slides (deslizamientos en pared)", anim: "wall_slide", musculos: ["Serrato", "Trapecio inferior"], series: 2, reps: "10", rir: "—", descanso: "30 s",
            tecnica: "Espalda baja, nuca y antebrazos contra la pared. Sube sin despegar la zona lumbar.", estudios: ["sepehri2024"] },
          { nombre: "Band pull-apart", anim: "band_pullapart", musculos: ["Deltoide posterior", "Romboides"], series: 2, reps: "15", rir: "2", descanso: "30 s",
            tecnica: "Brazos rectos a la altura del pecho; junta las escápulas al final.", estudios: ["sepehri2024"] }
        ]
      },
      {
        tipo: "principal", inicio: "16:25", fin: "17:35",
        ejercicios: [
          { nombre: "Press inclinado con mancuernas (30°)", anim: "incline_db_press", musculos: ["Pecho superior", "Deltoide anterior"], series: 3, reps: "6–8", rir: "1–2", descanso: "3 min",
            tecnica: "Baja hasta sentir el estiramiento del pecho, codos a ~45°. Escápulas juntas y abajo.", estudios: ["chaves2020", "schoenfeld2016rest", "plotkin2022"] },
          { nombre: "Jalón al pecho, agarre medio", anim: "lat_pulldown", musculos: ["Dorsal", "Redondo mayor"], series: 3, reps: "8–10", rir: "1–2", descanso: "2–3 min",
            tecnica: "Deja que el dorsal se estire arriba. Tira llevando los codos hacia las caderas, pecho alto.", estudios: ["schoenfeld2017", "robinson2024"] },
          { nombre: "Press de pecho en máquina", anim: "machine_chest_press", musculos: ["Pecho", "Tríceps"], series: 2, reps: "8–10", rir: "1", descanso: "2 min",
            tecnica: "Pausa corta con el pecho estirado; no bloquees los codos arriba.", estudios: ["refalo2023"] },
          { nombre: "Remo con pecho apoyado", anim: "chest_supported_row", musculos: ["Dorsal medio", "Romboides", "Deltoide posterior"], series: 3, reps: "8–10", rir: "1–2", descanso: "2 min",
            tecnica: "Pecho pegado al banco; sin impulso. Deja que las escápulas se abran al bajar.", estudios: ["sepehri2024", "schoenfeld2017"] },
          { nombre: "Extensión de tríceps sobre la cabeza en polea", anim: "overhead_triceps", musculos: ["Tríceps (cabeza larga)"], series: 3, reps: "10–12", rir: "0–1", descanso: "90 s",
            tecnica: "De espaldas a la polea, codos junto a la cabeza. Baja hasta que el tríceps se estire del todo.", estudios: ["maeo2023"] },
          { nombre: "Curl inclinado con mancuernas", anim: "incline_curl", musculos: ["Bíceps"], series: 2, reps: "10–12", rir: "0–1", descanso: "90 s",
            tecnica: "Banco a 45–60°, brazos colgando detrás del torso. Sube sin adelantar los codos.", estudios: ["kassiano2023a"] }
        ]
      },
      {
        tipo: "prioridad", inicio: "17:35", fin: "17:50",
        ejercicios: [
          { nombre: "Elevación lateral en polea (unilateral)", anim: "cable_lateral_raise", musculos: ["Deltoide lateral"], series: 4, reps: "10–15", rir: "0–1", descanso: "90 s",
            tecnica: "Polea a la altura de la mano, cable por delante o detrás del cuerpo. Sube hasta ~90° con el pulgar neutro; baja en 2 s.", estudios: ["larsen2025", "coratella2020", "schoenfeld2016freq", "singer2024"] }
        ]
      },
      {
        tipo: "enfriamiento", inicio: "17:50", fin: "18:00",
        ejercicios: [
          { nombre: "Estiramiento de pectoral en el marco de la puerta", anim: "doorway_stretch", musculos: ["Pectoral menor", "Pectoral mayor"], series: 2, reps: "40 s por lado", rir: "—", descanso: "—",
            tecnica: "Antebrazo en el marco, codo a la altura del hombro. Avanza el pecho sin arquear la espalda baja.", estudios: ["sepehri2024"] }
        ]
      }
    ]
  },
  {
    id: "mar",
    dia: "Martes",
    nombre: "Lower · Cuádriceps",
    enfoque: "Cuádriceps, isquios y control de pelvis",
    bloques: [
      {
        tipo: "calentamiento", inicio: "16:00", fin: "16:10",
        ejercicios: [
          { nombre: "Bicicleta estática", anim: "bike", musculos: ["General"], series: 1, reps: "5 min", rir: "—", descanso: "—",
            tecnica: "Cadencia suave.", estudios: [] },
          { nombre: "Sentadilla goblet ligera + movilidad de tobillo", anim: "goblet_squat", musculos: ["Cadera", "Tobillo"], series: 2, reps: "8", rir: "—", descanso: "—",
            tecnica: "Baja profundo y mantén 2 s abajo empujando las rodillas hacia afuera.", estudios: [] }
        ]
      },
      {
        tipo: "core", inicio: "16:10", fin: "16:25",
        ejercicios: [
          { nombre: "Dead bug", anim: "dead_bug", musculos: ["Transverso", "Recto abdominal"], series: 2, reps: "8 por lado", rir: "—", descanso: "30 s",
            tecnica: "Zona lumbar pegada al suelo todo el tiempo; exhala al extender brazo y pierna contrarios.", estudios: [] },
          { nombre: "Plancha RKC", anim: "plank", musculos: ["Core", "Glúteo"], series: 2, reps: "20 s", rir: "—", descanso: "45 s",
            tecnica: "Aprieta glúteos y lleva la pelvis a retroversión (cola hacia abajo). Es corta pero muy intensa.", estudios: [] },
          { nombre: "Estiramiento de flexores de cadera (media rodilla)", anim: "hip_flexor_stretch", musculos: ["Psoas", "Recto femoral"], series: 2, reps: "40 s por lado", rir: "—", descanso: "—",
            tecnica: "Aprieta el glúteo de la pierna de atrás y mete la pelvis antes de avanzar la cadera.", estudios: [] }
        ]
      },
      {
        tipo: "principal", inicio: "16:25", fin: "17:45",
        ejercicios: [
          { nombre: "Sentadilla hack (o sentadilla libre)", anim: "squat", musculos: ["Cuádriceps", "Glúteo"], series: 3, reps: "6–8", rir: "1–2", descanso: "3 min",
            tecnica: "Baja todo lo que tu movilidad permita con la espalda neutra; controla la bajada en 2–3 s.", estudios: ["refalo2024", "schoenfeld2016rest"] },
          { nombre: "Peso muerto rumano", anim: "rdl", musculos: ["Isquiotibiales", "Glúteo"], series: 3, reps: "8–10", rir: "2", descanso: "3 min",
            tecnica: "Cadera atrás, barra pegada a las piernas; baja hasta sentir el estiramiento de los isquios sin redondear la espalda.", estudios: ["kassiano2023a", "robinson2024"] },
          { nombre: "Extensión de cuádriceps", anim: "leg_extension", musculos: ["Cuádriceps"], series: 3, reps: "10–15", rir: "0–1", descanso: "90 s",
            tecnica: "Rango completo. En la última serie, al llegar al fallo, suma 4–6 parciales en la parte baja (estirada).", estudios: ["pedrosa2022", "wolf2025"] },
          { nombre: "Curl femoral sentado", anim: "seated_leg_curl", musculos: ["Isquiotibiales"], series: 3, reps: "10–12", rir: "0–1", descanso: "90 s",
            tecnica: "Inclínate un poco hacia adelante para estirar más los isquios; baja en 2 s.", estudios: ["maeo2021"] },
          { nombre: "Elevación de talones de pie", anim: "calf_raise", musculos: ["Gemelos"], series: 3, reps: "10–15", rir: "0–1", descanso: "60–90 s",
            tecnica: "Pausa de 1–2 s abajo con el talón totalmente estirado; sube controlado.", estudios: ["kassiano2023b"] },
          { nombre: "Crunch en polea", anim: "cable_crunch", musculos: ["Recto abdominal"], series: 3, reps: "10–12", rir: "1", descanso: "60 s",
            tecnica: "Enrolla la columna llevando las costillas hacia la pelvis; la cadera no se mueve.", estudios: ["schoenfeld2017"] }
        ]
      },
      {
        tipo: "enfriamiento", inicio: "17:45", fin: "18:00",
        ejercicios: [
          { nombre: "Estiramiento de flexores de cadera + cuádriceps en sofá", anim: "couch_stretch", musculos: ["Psoas", "Recto femoral"], series: 2, reps: "45 s por lado", rir: "—", descanso: "—",
            tecnica: "Rodilla de atrás contra la pared o el sofá, glúteo apretado, torso erguido.", estudios: [] }
        ]
      }
    ]
  },
  {
    id: "mie",
    dia: "Miércoles",
    nombre: "Push · Hombro y pecho superior",
    enfoque: "Deltoide lateral (doble), pecho superior, tríceps",
    bloques: [
      {
        tipo: "calentamiento", inicio: "16:00", fin: "16:10",
        ejercicios: [
          { nombre: "Rotación externa con banda", anim: "external_rotation", musculos: ["Manguito rotador"], series: 2, reps: "15", rir: "—", descanso: "—",
            tecnica: "Codo pegado al cuerpo a 90°; gira el antebrazo hacia afuera lentamente.", estudios: [] },
          { nombre: "Press inclinado con mancuernas ligeras", anim: "incline_db_press", musculos: ["Pecho", "Hombro"], series: 2, reps: "10", rir: "—", descanso: "—",
            tecnica: "Series de aproximación, sin fatiga.", estudios: [] }
        ]
      },
      {
        tipo: "postura", inicio: "16:10", fin: "16:20",
        ejercicios: [
          { nombre: "Face pull con rotación externa", anim: "face_pull", musculos: ["Deltoide posterior", "Manguito rotador", "Trapecio medio"], series: 3, reps: "15", rir: "2", descanso: "45 s",
            tecnica: "Polea a la altura de la cara; tira hacia la frente separando la cuerda y termina con los puños arriba.", estudios: ["sepehri2024"] },
          { nombre: "Chin tucks", anim: "chin_tuck", musculos: ["Flexores profundos del cuello"], series: 1, reps: "10 × 5 s", rir: "—", descanso: "—",
            tecnica: "Igual que el lunes.", estudios: ["sheikhhoseini2018"] }
        ]
      },
      {
        tipo: "principal", inicio: "16:20", fin: "17:30",
        ejercicios: [
          { nombre: "Press inclinado en multipower o máquina", anim: "incline_smith", musculos: ["Pecho superior"], series: 3, reps: "8–10", rir: "1–2", descanso: "2–3 min",
            tecnica: "Banco a 30°, bajada controlada hasta la parte alta del pecho.", estudios: ["chaves2020"] },
          { nombre: "Press militar con mancuernas sentado", anim: "shoulder_press", musculos: ["Deltoide anterior", "Deltoide lateral", "Tríceps"], series: 3, reps: "6–10", rir: "1–2", descanso: "2–3 min",
            tecnica: "Respaldo casi vertical; baja hasta que las mancuernas queden a la altura de las orejas.", estudios: ["robinson2024"] },
          { nombre: "Aperturas en polea de abajo hacia arriba", anim: "low_high_fly", musculos: ["Pecho superior"], series: 3, reps: "12–15", rir: "0–1", descanso: "90 s",
            tecnica: "Poleas abajo; sube las manos en arco hasta la altura de la barbilla. Estira bien atrás.", estudios: ["kassiano2023a"] },
          { nombre: "Extensión de tríceps sobre la cabeza con cuerda o barra EZ", anim: "overhead_triceps", musculos: ["Tríceps (cabeza larga)"], series: 2, reps: "10–12", rir: "0–1", descanso: "90 s",
            tecnica: "Codos apuntando al frente, estiramiento completo detrás de la cabeza.", estudios: ["maeo2023"] },
          { nombre: "Extensión de tríceps en polea (pushdown)", anim: "pushdown", musculos: ["Tríceps"], series: 2, reps: "12–15", rir: "0–1", descanso: "60–90 s",
            tecnica: "Codos fijos al costado; extiende del todo y aprieta.", estudios: ["schoenfeld2017"] }
        ]
      },
      {
        tipo: "prioridad", inicio: "17:30", fin: "17:50",
        ejercicios: [
          { nombre: "Elevación lateral con mancuernas", anim: "db_lateral_raise", musculos: ["Deltoide lateral"], series: 3, reps: "12–20", rir: "0–1", descanso: "90 s",
            tecnica: "Torso un poco inclinado hacia adelante, pulgar neutro, sube hasta ~90°. En la última serie, termina con parciales en la mitad baja.", estudios: ["coratella2020", "larsen2025", "wolf2025"] },
          { nombre: "Elevación lateral en máquina o polea", anim: "cable_lateral_raise", musculos: ["Deltoide lateral"], series: 3, reps: "12–15", rir: "0–1", descanso: "90 s",
            tecnica: "Movimiento estricto, bajada de 2 s, sin encoger los hombros.", estudios: ["larsen2025", "schoenfeld2017", "pelland2025"] }
        ]
      },
      {
        tipo: "enfriamiento", inicio: "17:50", fin: "18:00",
        ejercicios: [
          { nombre: "Estiramiento de pectoral en el marco de la puerta", anim: "doorway_stretch", musculos: ["Pectoral menor"], series: 2, reps: "40 s por lado", rir: "—", descanso: "—",
            tecnica: "Codo a la altura del hombro; avanza el pecho.", estudios: ["sepehri2024"] }
        ]
      }
    ]
  },
  {
    id: "jue",
    dia: "Jueves",
    nombre: "Pull · Dorsal y postura",
    enfoque: "Amplitud de espalda (forma de V), deltoide posterior, bíceps",
    bloques: [
      {
        tipo: "calentamiento", inicio: "16:00", fin: "16:10",
        ejercicios: [
          { nombre: "Remo ergómetro", anim: "row_erg", musculos: ["General"], series: 1, reps: "5 min", rir: "—", descanso: "—",
            tecnica: "Ritmo suave.", estudios: [] },
          { nombre: "Colgarse de la barra (dead hang)", anim: "dead_hang", musculos: ["Dorsal", "Agarre"], series: 2, reps: "30 s", rir: "—", descanso: "—",
            tecnica: "Relaja los hombros para estirar el dorsal; luego haz 5 retracciones escapulares.", estudios: [] }
        ]
      },
      {
        tipo: "postura", inicio: "16:10", fin: "16:25",
        ejercicios: [
          { nombre: "Y-raise en banco inclinado", anim: "y_raise", musculos: ["Trapecio inferior"], series: 2, reps: "12", rir: "2", descanso: "45 s",
            tecnica: "Pecho apoyado en banco a 30–45°, brazos en Y, pulgares arriba; sube sin encoger los hombros.", estudios: ["sepehri2024"] },
          { nombre: "Band pull-apart", anim: "band_pullapart", musculos: ["Deltoide posterior", "Romboides"], series: 2, reps: "15", rir: "2", descanso: "30 s",
            tecnica: "Brazos rectos; junta las escápulas.", estudios: ["sepehri2024"] },
          { nombre: "Chin tucks contra la pared", anim: "chin_tuck", musculos: ["Flexores profundos del cuello"], series: 2, reps: "10 × 5 s", rir: "—", descanso: "30 s",
            tecnica: "Nuca contra la pared, desliza la cabeza hacia atrás sin levantar el mentón.", estudios: ["sheikhhoseini2018"] }
        ]
      },
      {
        tipo: "principal", inicio: "16:25", fin: "17:35",
        ejercicios: [
          { nombre: "Dominadas (o jalón si no llegas a 6)", anim: "pullup", musculos: ["Dorsal", "Bíceps"], series: 3, reps: "6–10", rir: "1–2", descanso: "3 min",
            tecnica: "Agarre algo más ancho que los hombros; baja hasta extender los brazos del todo; tira pensando en llevar los codos a los bolsillos.", estudios: ["schoenfeld2017", "robinson2024"] },
          { nombre: "Remo unilateral con mancuerna", anim: "db_row", musculos: ["Dorsal"], series: 3, reps: "8–12", rir: "1", descanso: "2 min",
            tecnica: "Deja que la mancuerna baje y se estire el dorsal; tira en arco hacia la cadera, no hacia el pecho.", estudios: ["kassiano2023a"] },
          { nombre: "Pullover en polea con brazos rectos", anim: "straight_arm_pulldown", musculos: ["Dorsal"], series: 2, reps: "12–15", rir: "0–1", descanso: "90 s",
            tecnica: "Inclínate un poco, brazos casi rectos; lleva la barra hasta los muslos y sube hasta sentir el estiramiento.", estudios: ["schoenfeld2017"] },
          { nombre: "Remo en polea sentado, agarre neutro", anim: "seated_row", musculos: ["Dorsal medio", "Romboides"], series: 2, reps: "10–12", rir: "1", descanso: "2 min",
            tecnica: "Estírate hacia adelante sin redondear la espalda; tira y junta las escápulas.", estudios: ["sepehri2024"] },
          { nombre: "Pájaros en máquina (reverse pec deck)", anim: "rear_delt_fly", musculos: ["Deltoide posterior"], series: 3, reps: "12–20", rir: "0–1", descanso: "60–90 s",
            tecnica: "Brazos casi rectos; abre en arco sin juntar demasiado las escápulas.", estudios: ["sepehri2024"] },
          { nombre: "Curl bayesiano en polea", anim: "bayesian_curl", musculos: ["Bíceps"], series: 3, reps: "10–12", rir: "0–1", descanso: "90 s",
            tecnica: "De espaldas a la polea, brazo detrás del cuerpo; curl sin mover el codo hacia adelante.", estudios: ["kassiano2023a"] }
        ]
      },
      {
        tipo: "prioridad", inicio: "17:35", fin: "17:50",
        ejercicios: [
          { nombre: "Elevación lateral en polea tipo Y (cable Y-raise)", anim: "cable_y_raise", musculos: ["Deltoide lateral", "Trapecio inferior"], series: 3, reps: "12–15", rir: "0–1", descanso: "90 s",
            tecnica: "Poleas cruzadas abajo; sube en diagonal formando una Y. Trabaja el deltoide y ayuda a la postura escapular.", estudios: ["larsen2025", "schoenfeld2016freq"] }
        ]
      },
      {
        tipo: "enfriamiento", inicio: "17:50", fin: "18:00",
        ejercicios: [
          { nombre: "Extensión torácica sobre foam roller", anim: "thoracic_extension", musculos: ["Columna torácica"], series: 2, reps: "8", rir: "—", descanso: "—",
            tecnica: "Rodillo bajo la parte alta de la espalda, manos en la nuca; extiende sobre el rodillo sin arquear la zona lumbar.", estudios: ["sepehri2024"] }
        ]
      }
    ]
  },
  {
    id: "vie",
    dia: "Viernes",
    nombre: "Legs · Isquios y glúteo",
    enfoque: "Cadena posterior, glúteo y pelvis",
    bloques: [
      {
        tipo: "calentamiento", inicio: "16:00", fin: "16:10",
        ejercicios: [
          { nombre: "Bicicleta estática", anim: "bike", musculos: ["General"], series: 1, reps: "5 min", rir: "—", descanso: "—",
            tecnica: "Cadencia suave.", estudios: [] },
          { nombre: "Puente de glúteo con banda", anim: "glute_bridge", musculos: ["Glúteo"], series: 2, reps: "12", rir: "—", descanso: "—",
            tecnica: "Pausa de 2 s arriba con la pelvis en retroversión.", estudios: [] }
        ]
      },
      {
        tipo: "core", inicio: "16:10", fin: "16:25",
        ejercicios: [
          { nombre: "Press Pallof", anim: "pallof", musculos: ["Oblicuos", "Transverso"], series: 2, reps: "10 por lado", rir: "—", descanso: "30 s",
            tecnica: "De lado a la polea; empuja al frente y resiste la rotación 2 s.", estudios: [] },
          { nombre: "Dead bug", anim: "dead_bug", musculos: ["Transverso", "Recto abdominal"], series: 2, reps: "8 por lado", rir: "—", descanso: "30 s",
            tecnica: "Zona lumbar pegada al suelo.", estudios: [] },
          { nombre: "Estiramiento de flexores de cadera", anim: "hip_flexor_stretch", musculos: ["Psoas"], series: 2, reps: "40 s por lado", rir: "—", descanso: "—",
            tecnica: "Glúteo apretado y pelvis metida.", estudios: [] }
        ]
      },
      {
        tipo: "principal", inicio: "16:25", fin: "17:35",
        ejercicios: [
          { nombre: "Hip thrust con barra", anim: "hip_thrust", musculos: ["Glúteo"], series: 3, reps: "8–12", rir: "1–2", descanso: "2–3 min",
            tecnica: "Mentón hacia el pecho y pelvis en retroversión arriba; no hiperextiendas la zona lumbar.", estudios: ["refalo2024"] },
          { nombre: "Sentadilla búlgara", anim: "bulgarian", musculos: ["Cuádriceps", "Glúteo"], series: 3, reps: "8–10 por pierna", rir: "1–2", descanso: "2 min",
            tecnica: "Torso algo inclinado para más glúteo; baja hasta que la rodilla de atrás casi toque el suelo.", estudios: ["kassiano2023a"] },
          { nombre: "Curl femoral sentado", anim: "seated_leg_curl", musculos: ["Isquiotibiales"], series: 3, reps: "10–12", rir: "0–1", descanso: "90 s",
            tecnica: "Igual que el martes; bajada en 2 s.", estudios: ["maeo2021", "schoenfeld2016freq"] },
          { nombre: "Prensa de piernas", anim: "leg_press", musculos: ["Cuádriceps", "Glúteo"], series: 2, reps: "10–15", rir: "1", descanso: "2 min",
            tecnica: "Pies a media altura; baja profundo sin que se despegue la pelvis del respaldo.", estudios: ["refalo2024"] },
          { nombre: "Elevación de talones de pie", anim: "calf_raise", musculos: ["Gemelos"], series: 3, reps: "12–15", rir: "0–1", descanso: "60–90 s",
            tecnica: "Pausa abajo con el talón estirado.", estudios: ["kassiano2023b"] },
          { nombre: "Elevación de piernas colgado", anim: "hanging_leg_raise", musculos: ["Recto abdominal", "Flexores de cadera"], series: 3, reps: "10–15", rir: "1", descanso: "60 s",
            tecnica: "Enrolla la pelvis hacia arriba al final; no balancees el cuerpo.", estudios: [] }
        ]
      },
      {
        tipo: "prioridad", inicio: "17:35", fin: "17:50",
        ejercicios: [
          { nombre: "Elevación lateral con mancuernas", anim: "db_lateral_raise", musculos: ["Deltoide lateral"], series: 3, reps: "15–20", rir: "0–1", descanso: "90 s",
            tecnica: "Cuarto estímulo semanal del deltoide lateral: cargas moderadas y técnica estricta.", estudios: ["schoenfeld2016freq", "larsen2025", "coratella2020"] }
        ]
      },
      {
        tipo: "enfriamiento", inicio: "17:50", fin: "18:00",
        ejercicios: [
          { nombre: "Estiramiento de isquios y flexores de cadera", anim: "hamstring_stretch", musculos: ["Isquiotibiales", "Psoas"], series: 2, reps: "40 s por lado", rir: "—", descanso: "—",
            tecnica: "Respiración lenta; sin rebotes.", estudios: [] }
        ]
      }
    ]
  }
];

// Días de descanso
const DESCANSO = [
  { dia: "Sábado", nota: "Descanso activo: caminata de 30–45 min + 10 min del bloque de postura." },
  { dia: "Domingo", nota: "Descanso total. Fotos de progreso y medida de cintura cada 3–4 semanas." }
];
