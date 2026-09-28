# Rutina Estética

Interfaz oscura y roja para organizar la rutina de 5 días (16:00–18:00): Upper / Lower + Push / Pull / Legs. Prioriza deltoide lateral, dorsal, pecho superior y postura, y cada decisión está respaldada con estudios científicos.

## Cómo abrirla
- **En línea:** https://javier407.github.io/Rutina/
- **En el computador:** doble clic en `index.html`.
- **Como app en el celular:** abre la dirección en Chrome (Android) y toca *Instalar app*, o en Safari (iPhone) usa *Compartir → Agregar a inicio*. Funciona sin internet en el gym.

## Modo "Iniciar día"
1. En **Ejercicios** elige el día (cada botón muestra su fecha real) y toca **▶ Iniciar día**.
2. Ves el ejercicio con su animación, la serie actual, el objetivo y tu último registro. Anota kg y reps.
3. **Serie hecha** → cuenta regresiva en pantalla grande con el descanso del ejercicio (±15 s o saltar).
4. Al terminar las series pasa al siguiente ejercicio, con el descanso del que terminaste.
5. **Finalizar día** muestra el resumen: minutos, series, volumen y récords.

La voz anuncia cada ejercicio, avisa "quedan diez segundos" y pita 3-2-1. Se apaga con 🔊. La pantalla no se apaga durante la sesión.

### Motivación 🔥
Al terminar una serie, al cambiar de ejercicio y al finalizar el día suena un grito de motivación. En **Progreso → Motivación**:
- Sube tus propios clips de audio (mp3/m4a/wav, menos de 3 MB) y elige cuándo suenan. Se guardan solo en tu dispositivo, nunca en GitHub.
- Si no hay clip para ese momento, suena una frase de gimnasio con bocina de estadio.
- Modos: clips + frases, solo clips, solo frases o apagado.

## Estructura
```
rutina-estetica/
├── index.html         # Estructura de las 3 vistas
├── css/styles.css     # Tema oscuro + rojo, animaciones
└── js/
    ├── data.js        # ← EDITA AQUÍ: estudios, días, bloques y ejercicios
    ├── store.js       # Fechas, registro de cargas, sesiones y medidas
    ├── voice.js       # Voz en español y sonidos
    ├── motivation.js  # Gritos de motivación (clips propios + frases)
    ├── figures.js     # Motor y poses de las 49 animaciones de ejercicios
    ├── session.js     # Modo guiado "Iniciar día"
    ├── progress.js    # Pestaña Progreso (sesiones, cargas, medidas, fotos, copia)
    └── app.js         # Interfaz principal
├── sw.js              # Funciona sin conexión
├── manifest.webmanifest + icons/   # App instalable
```

## Vistas
- **Semana**: contadores animados, barras de series por músculo (con la línea de 10 series), radar de balance por región, dona de tiempo por bloque, y calendario con la línea de "ahora" durante la sesión.
- **Ejercicios**: cada tarjeta tiene una animación de referencia (misma silueta para todos, con el músculo trabajado en rojo), series que puedes marcar, temporizador de descanso con alarma, y los estudios de respaldo. El anillo del día muestra tu progreso de series.
- **Progreso**: sesiones y racha semanal, gráfica de cargas y 1RM estimado por ejercicio, cintura y peso, fotos de frente/perfil/espalda con comparación antes/después, y copia de seguridad (exportar/importar).
- **Evidencia**: 20 estudios filtrables por tema, con gráfica por tipo de estudio.

## Editar la rutina
En `js/data.js`, cada ejercicio es un objeto:
```js
{ nombre, anim, musculos: [...], series, reps, rir, descanso, tecnica, estudios: ["idEstudio"] }
```
- `anim` es la animación (ver claves en `js/figures.js`, por ejemplo `db_lateral_raise`, `pullup`, `rdl`).
- El primer músculo de `musculos` cuenta para las gráficas.
- Todos los datos (registros, medidas, fotos) se guardan en el navegador de cada dispositivo. Usa *Exportar copia* para pasarlos de uno a otro.

## Progresión (doble progresión)
1. Trabaja dentro del rango de repeticiones con el RIR indicado.
2. Cuando completes el tope del rango en todas las series, sube el peso lo mínimo posible.
3. Vuelve al inicio del rango y repite.
