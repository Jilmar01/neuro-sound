import React, { useState, useEffect, useRef } from 'react';

// Tabla de frecuencias por nota.
const NOTE_FREQS = {
  "C3": 130.81, "C#3": 138.59, "D3": 146.83, "D#3": 155.56, "E3": 164.81, "F3": 174.61, "F#3": 185.00, "G3": 196.00, "G#3": 207.65, "A3": 220.00, "A#3": 233.08, "B3": 246.94,
  "C4": 261.63, "C#4": 277.18, "D4": 293.66, "D#4": 311.13, "E4": 329.63, "F4": 349.23, "F#4": 369.99, "G4": 392.00, "G#4": 415.30, "A4": 440.00, "A#4": 466.16, "B4": 493.88,
  "C5": 523.25, "C#5": 554.37, "D5": 587.33, "D#5": 622.25, "E5": 659.25, "F5": 698.46, "F#5": 739.99, "G5": 783.99, "G#5": 830.61, "A5": 880.00, "A#5": 932.33, "B5": 987.77,
  "silence": 0
};

const PRESETS = {
  satie: `// Recreación de Gymnopédie No. 1 (Erik Satie)
// Ideal para concentración o lectura profunda.
const bpm = 75;
const t = 60 / bpm; // duración de un tiempo

const melodia = [
  ["F#3", 3*t], ["B3", 3*t], ["C#4", 3*t], ["D4", 6*t],
  ["C#4", 3*t], ["B3", 3*t], ["F#3", 6*t],
  ["silence", 2*t],
  ["F#3", 3*t], ["B3", 3*t], ["C#4", 3*t], ["D4", 6*t],
  ["C#4", 3*t], ["B3", 3*t], ["C#4", 6*t], ["B3", 6*t]
];

// Ejecutar reproducción
play(melodia);`,
  debussy: `// Recreación de Clair de Lune (Claude Debussy)
// Melodía clásica flotante y relajante.
const bpm = 80;
const t = 60 / bpm;

const melodia = [
  ["F#4", t], ["F4", t], ["D#4", 2*t], ["C#4", t],
  ["A#3", 3*t], ["G#3", t], ["F#3", 3*t],
  ["silence", t],
  ["F#4", t], ["F4", t], ["D#4", 2*t], ["C#4", t],
  ["A#3", 3*t], ["G#3", t], ["F#3", 3*t],
  ["F#4", t], ["F4", t], ["D#4", 2*t], ["C#4", t],
  ["C#4", 4*t]
];

play(melodia);`,
  beatit: `// Recreación del riff de Beat It (Michael Jackson)
// Ritmo alegre y energizante para tareas cotidianas.
const t = 0.35; // tiempo fijo por nota

const melodia = [
  ["silence", t],
  ["D3", t], ["G3", t], ["A#3", 2*t],
  ["D4", t], ["C4", 2*t],
  ["silence", t],
  ["G3", t], ["A#3", 2*t],
  ["D4", t], ["C4", 2*t],
  ["silence", t],
  ["D3", t], ["G3", t], ["A#3", 2*t],
  ["D4", t], ["C4", 2*t],
  ["silence", t],
  ["D3", t], ["F3", t], ["G3", 2*t]
];

play(melodia);`,
  pinkfloyd: `// Recreación del saxo flotante de Us and Them (Pink Floyd)
// Sonido expansivo y espacial.
const t = 0.55;

const melodia = [
  ["D4", 2*t], ["F#4", t], ["A4", 2*t], ["B4", 3*t],
  ["A4", t], ["F#4", t], ["E4", 2*t], ["D4", 4*t],
  ["silence", 2*t],
  ["C#4", 2*t], ["E4", t], ["G#4", 2*t], ["A4", 3*t],
  ["G#4", t], ["E4", t], ["D#4", 2*t], ["C#4", 4*t]
];

play(melodia);`
};

// Perfiles de sonido preconfigurados.
const SOUND_PROFILES = {
  hum: { name: "Tarareo Cálido", type: "triangle", filterFreq: 450, q: 1.2, detuneLfo: true },
  delta: { name: "Onda Delta Profunda", type: "sine", filterFreq: 180, q: 0.8, detuneLfo: false },
  zen: { name: "Campanas FM (Zen)", type: "sine", filterFreq: 1200, q: 1.5, detuneLfo: true, chime: true }
};

/**
 * Pantalla para programar melodias y sintetizarlas con Web Audio.
 * @param {Object} props - Propiedades del componente.
 * @param {(screen: string) => void} props.onNavigate - Navegacion entre pantallas.
 * @param {() => void} [props.onPlayToggle] - Pausa/reanuda la playlist principal.
 * @returns {JSX.Element}
 */
export default function MusicCodeScreen({ onNavigate, onPlayToggle }) {
  const [code, setCode] = useState(PRESETS.satie);
  const [selectedPreset, setSelectedPreset] = useState("satie");
  const [soundProfile, setSoundProfile] = useState("hum");
  const [status, setStatus] = useState({ type: "idle", message: "Escribe código y compila tu melodía." });
  const [isPlaying, setIsPlaying] = useState(false);
  const [synthVolume, setSynthVolume] = useState(60);

  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const playTimeoutRef = useRef(null);
  const analyserRef = useRef(null);
  const visualizerActive = useRef(false);

  // Referencias a osciladores/nodos activos para detenerlos.
  const activeNodesRef = useRef([]);

  /**
   * Actualiza el editor cuando cambia el preset.
   * @param {string} presetKey - Clave del preset.
   * @returns {void}
   */
  const handlePresetChange = (presetKey) => {
    setSelectedPreset(presetKey);
    setCode(PRESETS[presetKey]);
    stopSynthesis();
  };

  /**
   * Inicia el visualizador de ondas.
   * @returns {void}
   */
  const startVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    visualizerActive.current = true;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!visualizerActive.current) return;
      requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      // Limpia el canvas con fondo semitransparente para estelas
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 3;
      ctx.strokeStyle = 'var(--bs-primary, #6f42c1)';
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  };

  /**
   * Detiene la sintesis y libera recursos de audio.
   * @returns {void}
   */
  const stopSynthesis = () => {
    setIsPlaying(false);
    if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);

    // Detiene todos los nodos programados
    activeNodesRef.current.forEach(node => {
      try {
        node.stop();
      } catch (e) { }
    });
    activeNodesRef.current = [];

    // Cierra el AudioContext
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    visualizerActive.current = false;
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setStatus({ type: "idle", message: "Melodía detenida." });
  };

  /**
   * Compila el codigo y reproduce la melodia.
   * @returns {void}
   */
  const compileAndPlay = () => {
    // 1. Detiene cualquier sintesis en curso
    stopSynthesis();

    // 2. Pausa la playlist principal
    if (onPlayToggle) onPlayToggle();

    setStatus({ type: "compiling", message: "Compilando melodía..." });

    // 3. Configura AudioContext y nodos
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    audioContextRef.current = ctx;

    // Configura el Analyser para el visualizador
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 254;
    analyserRef.current = analyser;

    // Configura ganancia de salida
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(synthVolume / 150, ctx.currentTime); // escala de volumen

    // Configura filtro lowpass (clave para efecto hum)
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    const profile = SOUND_PROFILES[soundProfile];
    filter.frequency.setValueAtTime(profile.filterFreq, ctx.currentTime);
    filter.Q.setValueAtTime(profile.q, ctx.currentTime);

    // Conecta nodos
    filter.connect(analyser);
    analyser.connect(masterGain);
    masterGain.connect(ctx.destination);

    // 4. Ejecuta el sandbox de compilacion
    let notesSequence = [];
    const playFn = (melodia) => {
      if (Array.isArray(melodia)) {
        notesSequence = melodia;
      }
    };

    try {
      // Evalua el script del usuario de forma controlada
      const runner = new Function("play", code);
      runner(playFn);

      if (notesSequence.length === 0) {
        throw new Error("No se llamó a la función play(melodia) o la melodía está vacía.");
      }

      // Valida notas
      notesSequence.forEach((step, idx) => {
        if (!Array.isArray(step) || step.length < 2) {
          throw new Error(`Nota inválida en el índice ${idx}. Formato requerido: ["NOTA", duración]`);
        }
      });

      setStatus({
        type: "playing",
        message: `Compilado con éxito. Reproduciendo ${notesSequence.length} notas...`
      });
      setIsPlaying(true);
      startVisualizer();

      // 5. Programa la reproduccion de notas
      let scheduleTime = ctx.currentTime + 0.1;

      notesSequence.forEach(([noteName, duration]) => {
        const freq = NOTE_FREQS[noteName];
        if (freq === undefined) {
          console.warn(`Nota desconocida "${noteName}", sonará como silencio.`);
        }

        const noteDuration = parseFloat(duration) || 0.5;

        if (freq && freq > 0) {
          // Oscilador principal
          const osc = ctx.createOscillator();
          osc.type = profile.type;

          // Portamento leve entre notas
          osc.frequency.setValueAtTime(freq, scheduleTime);

          // LFO de detune para vibrato tipo hum
          if (profile.detuneLfo) {
            const lfo = ctx.createOscillator();
            lfo.frequency.setValueAtTime(5.5, scheduleTime); // vibrato 5.5 Hz

            const lfoGain = ctx.createGain();
            lfoGain.gain.setValueAtTime(profile.chime ? 8 : 3.5, scheduleTime); // rango de detune

            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);

            lfo.start(scheduleTime);
            lfo.stop(scheduleTime + noteDuration);
            activeNodesRef.current.push(lfo);
          }

          // Oscilador secundario para perfil chime/FM Zen
          if (profile.chime) {
            const harmonicOsc = ctx.createOscillator();
            harmonicOsc.type = "sine";
            harmonicOsc.frequency.setValueAtTime(freq * 2.02, scheduleTime); // armonico con leve detune

            const harmonicGain = ctx.createGain();
            harmonicGain.gain.setValueAtTime(0.0, scheduleTime);
            harmonicGain.gain.linearRampToValueAtTime(0.08, scheduleTime + 0.05);
            harmonicGain.gain.exponentialRampToValueAtTime(0.0001, scheduleTime + noteDuration);

            harmonicOsc.connect(harmonicGain);
            harmonicGain.connect(filter);

            harmonicOsc.start(scheduleTime);
            harmonicOsc.stop(scheduleTime + noteDuration);
            activeNodesRef.current.push(harmonicOsc);
          }

          // Envolvente de volumen
          const oscGain = ctx.createGain();
          oscGain.gain.setValueAtTime(0.0, scheduleTime);

          // Attack (fade-in suave)
          oscGain.gain.linearRampToValueAtTime(profile.chime ? 0.35 : 0.25, scheduleTime + 0.08);
          // Decay/Release (fade-out de nota)
          oscGain.gain.exponentialRampToValueAtTime(0.0001, scheduleTime + noteDuration - 0.02);

          osc.connect(oscGain);
          oscGain.connect(filter);

          osc.start(scheduleTime);
          osc.stop(scheduleTime + noteDuration);
          activeNodesRef.current.push(osc);
        }

        scheduleTime += noteDuration;
      });

      // Detiene visualizador y estado al terminar la melodia
      const totalTimeMs = (scheduleTime - ctx.currentTime) * 1000;
      playTimeoutRef.current = setTimeout(() => {
        stopSynthesis();
        setStatus({ type: "idle", message: "Melodía finalizada con éxito." });
      }, totalTimeMs);

    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: err.message });
      setIsPlaying(false);
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    }
  };

  // Ajusta volumen dinamicamente del AudioContext en curso
  useEffect(() => {
    if (audioContextRef.current && isPlaying) {
      // Normalmente se pisaria el gain node, pero se recrea en cada compilacion.
    }
  }, [synthVolume, isPlaying]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 w-100 max-w-4xl" style={{ minHeight: '520px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="font-headline-md text-headline-md fw-bold mb-1 text-on-surface">
            🎼 Programación Musical
          </h2>
          <p className="text-muted mb-0 font-body-sm">
            Escribe código JavaScript para sintetizar melodías instrumentales para tus tareas.
          </p>
        </div>
        <button
          onClick={() => {
            stopSynthesis();
            onNavigate('dashboard');
          }}
          className="btn btn-outline-secondary rounded-pill d-flex align-items-center gap-1 py-2 px-3"
        >
          <span className="material-symbols-outlined notranslate fs-5" translate="no">arrow_back</span>
          Volver
        </button>
      </div>

      <div className="row g-4">
        {/* Columna: editor y presets */}
        <div className="col-12 col-lg-7">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-semibold text-secondary font-label-md">Editor de Código</span>
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted font-body-xs">Presets:</span>
              <select
                value={selectedPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="form-select form-select-sm rounded-pill border-light-subtle bg-light text-secondary"
                style={{ width: '160px', fontSize: '12px' }}
              >
                <option value="satie">Gymnopédie No. 1</option>
                <option value="debussy">Clair de Lune</option>
                <option value="beatit">Beat It</option>
                <option value="pinkfloyd">Us and Them</option>
              </select>
            </div>
          </div>

          <div className="position-relative rounded-3 overflow-hidden border border-light-subtle mb-3">
            {/* Barra superior del editor */}
            <div className="d-flex align-items-center justify-content-between px-3 py-2 bg-dark text-light-emphasis" style={{ fontSize: '11px', borderBottom: '1px solid #2d3748' }}>
              <span>melodia_synth.js</span>
              <span className="badge bg-secondary font-body-xs opacity-75">JavaScript</span>
            </div>

            {/* Campo de codigo (textarea) */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-100 font-monospace p-3 text-light bg-dark"
              style={{
                height: '240px',
                border: 'none',
                resize: 'none',
                outline: 'none',
                fontSize: '13px',
                lineHeight: '1.6',
                color: '#e2e8f0',
                tabSize: 2
              }}
              spellCheck="false"
            />
          </div>

          {/* Controles de compilacion */}
          <div className="d-flex flex-wrap gap-2.5 justify-content-between align-items-center">
            <div className="d-flex gap-2">
              {!isPlaying ? (
                <button
                  onClick={compileAndPlay}
                  className="btn btn-primary rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm font-label-md"
                >
                  <span className="material-symbols-outlined notranslate fs-5" translate="no">play_arrow</span>
                  Compilar y Tocar
                </button>
              ) : (
                <button
                  onClick={stopSynthesis}
                  className="btn btn-danger rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm font-label-md"
                >
                  <span className="material-symbols-outlined notranslate fs-5" translate="no">stop</span>
                  Detener
                </button>
              )}
            </div>

            {/* Control de volumen */}
            <div className="d-flex align-items-center gap-2" style={{ width: '180px' }}>
              <span className="material-symbols-outlined notranslate text-secondary fs-5" translate="no">volume_up</span>
              <input
                type="range"
                min="0"
                max="100"
                value={synthVolume}
                onChange={(e) => setSynthVolume(parseInt(e.target.value))}
                className="form-range"
              />
              <span className="text-secondary font-monospace" style={{ fontSize: '12px', minWidth: '30px' }}>
                {synthVolume}%
              </span>
            </div>
          </div>
        </div>

        {/* Columna: visualizador y perfiles */}
        <div className="col-12 col-lg-5 d-flex flex-column justify-content-between">
          <div>
            <span className="fw-semibold text-secondary font-label-md d-block mb-2">Instrumento de Síntesis</span>

            {/* Selector de perfiles de sonido */}
            <div className="d-flex flex-column gap-2 mb-4">
              {Object.entries(SOUND_PROFILES).map(([key, value]) => {
                const isActive = soundProfile === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSoundProfile(key);
                      if (isPlaying) {
                        // Reinicia para aplicar cambios de perfil
                        setTimeout(compileAndPlay, 50);
                      }
                    }}
                    className={`btn text-start p-2.5 rounded-3 d-flex align-items-center gap-3 transition-all border ${isActive
                        ? 'border-primary bg-primary-container text-primary font-body-sm fw-semibold'
                        : 'border-light-subtle bg-white text-secondary font-body-sm'
                      }`}
                  >
                    <span className="material-symbols-outlined notranslate fs-4" translate="no">
                      {key === 'hum' ? 'record_voice_over' : key === 'delta' ? 'waves' : 'notifications'}
                    </span>
                    <div>
                      <div className="fw-bold" style={{ fontSize: '13px' }}>{value.name}</div>
                      <div className="text-muted font-body-xs" style={{ fontSize: '11px' }}>
                        {key === 'hum' ? "Ideal para tarareos relajantes con vibrato" :
                          key === 'delta' ? "Oscilador puro de baja frecuencia binaural" :
                            "Sonidos campaniformes para meditación activa"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Caja del visualizador */}
            <span className="fw-semibold text-secondary font-label-md d-block mb-2">Visualizador de Ondas</span>
            <div className="border border-light-subtle rounded-3 bg-light p-1 mb-3 position-relative overflow-hidden" style={{ height: '115px' }}>
              <canvas
                ref={canvasRef}
                width="340"
                height="105"
                className="w-100 h-100 rounded"
              />
              {!isPlaying && (
                <div className="position-absolute top-50 start-50 translate-middle text-muted font-body-xs opacity-75">
                  Esperando señal...
                </div>
              )}
            </div>
          </div>

          {/* Salida de la consola de compilacion */}
          <div className="p-3 rounded-3 font-monospace bg-dark text-light border border-secondary" style={{ fontSize: '12px', minHeight: '75px' }}>
            <div className="text-muted mb-1 font-body-xs">// Consola de Compilación:</div>
            <div className={
              status.type === 'error' ? 'text-danger fw-semibold' :
                status.type === 'playing' ? 'text-success fw-semibold' :
                  status.type === 'compiling' ? 'text-warning fw-semibold' : 'text-light-emphasis'
            }>
              {status.type === 'idle' ? '> ' :
                status.type === 'compiling' ? '🔨 ' :
                  status.type === 'playing' ? '🎶 ' :
                    status.type === 'error' ? '❌ ' : '> '}
              {status.message}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
