import React, { useState, useRef, useEffect } from 'react';
import Button from '../common/Button';
import Slider from '../common/Slider';

/**
 * Encuesta inicial adaptada con escala Likert de Triste a Feliz,
 * encuesta de cómo se quisiera sentir el usuario y calibración por
 * Frecuencia de Consciencia de David Hawkins (0 a 1000 Hz).
 * 
 * @param {Object} props - Propiedades del componente.
 * @param {(data: Object) => void} props.onSubmit - Callback con datos de encuesta mapeados.
 * @returns {JSX.Element}
 */
const InitialSurvey = ({ onSubmit, hideFrequencies = false, initialData = null }) => {
  const [comoSiente, setComoSiente] = useState(() => initialData?.comoSiente ?? 3);
  const [comoQuiere, setComoQuiere] = useState(() => initialData?.comoQuiere ?? 5);
  const [frequency, setFrequency] = useState(() => initialData?.volume ?? 200); // 200 Hz (Coraje/Neutralidad por defecto)
  const [isTonePlaying, setIsTonePlaying] = useState(false);

  // Referencias persistentes para la Web Audio API
  const audioCtxRef = useRef(null);
  const activeOscRef = useRef(null);
  const activeGainRef = useRef(null);

  const labels = {
    sientes: ["Triste", "Algo Triste", "Neutral", "Algo Feliz", "Feliz"],
    quieres: ["Triste", "Algo Triste", "Neutral", "Algo Feliz", "Feliz"]
  };

  const nodesConfig = {
    sientes: [
      { value: 1, icon: 'sentiment_very_dissatisfied' },
      { value: 2, icon: 'sentiment_dissatisfied' },
      { value: 3, icon: 'sentiment_neutral' },
      { value: 4, icon: 'sentiment_satisfied' },
      { value: 5, icon: 'sentiment_very_satisfied' }
    ],
    quieres: [
      { value: 1, icon: 'sentiment_very_dissatisfied' },
      { value: 2, icon: 'sentiment_dissatisfied' },
      { value: 3, icon: 'sentiment_neutral' },
      { value: 4, icon: 'sentiment_satisfied' },
      { value: 5, icon: 'sentiment_very_satisfied' }
    ]
  };

  /**
   * Obtiene la descripción detallada del estado de conciencia de David Hawkins
   * dependiendo del rango de frecuencia seleccionado.
   * @param {number} freq - Frecuencia en Hz (0 a 1000).
   * @returns {{name: string, level: string, desc: string, group: string}}
   */
  const getHawkinsState = (freq) => {
    if (freq < 30) {
      return {
        name: "Inconsciente / Desconexión",
        level: "< 30 Hz",
        desc: "Estado de aletargamiento profundo, fatiga crónica y desconexión energética severa.",
        group: "Baja Frecuencia (< 200 Hz)"
      };
    } else if (freq < 50) {
      return {
        name: "Culpa / Vergüenza",
        level: "30 Hz",
        desc: "Frecuencia de remordimiento, autocrítica destructiva y baja autoestima.",
        group: "Baja Frecuencia (< 200 Hz)"
      };
    } else if (freq < 75) {
      return {
        name: "Apatía",
        level: "50 Hz",
        desc: "Desgano, desesperanza, sensación de desamparo y falta de voluntad.",
        group: "Baja Frecuencia (< 200 Hz)"
      };
    } else if (freq < 100) {
      return {
        name: "Tristeza / Duelo",
        level: "75 Hz",
        desc: "Pesar acumulado, melancolía, arrepentimiento y sensación de vacío afectivo.",
        group: "Baja Frecuencia (< 200 Hz)"
      };
    } else if (freq < 150) {
      return {
        name: "Miedo / Ansiedad",
        level: "100 Hz",
        desc: "Estado de alerta constante, temor al futuro, evasión y preocupación corporal excesiva.",
        group: "Baja Frecuencia (< 200 Hz)"
      };
    } else if (freq < 200) {
      return {
        name: "Ira / Orgullo",
        level: "150 Hz",
        desc: "Deseo insatisfecho, irritabilidad, frustración acumulada, resentimiento o terquedad.",
        group: "Baja Frecuencia (< 200 Hz)"
      };
    } else if (freq < 310) {
      return {
        name: "Coraje / Neutralidad",
        level: "200 Hz (Inflexión)",
        desc: "Punto de inflexión de la conciencia. Empoderamiento, aceptación, valentía y objetividad realista.",
        group: "Punto de Inflexión (200 Hz)"
      };
    } else if (freq < 500) {
      return {
        name: "Voluntad / Aceptación",
        level: "310 Hz+",
        desc: "Optimismo, adaptabilidad, asimilación constructiva y deseos de superación personal activa.",
        group: "Alta Frecuencia (> 200 Hz)"
      };
    } else if (freq < 540) {
      return {
        name: "Amor Incondicional",
        level: "500 Hz",
        desc: "Resonancia magnética de compasión profunda, gratitud, respeto sagrado y aprecio sincero.",
        group: "Alta Frecuencia (> 200 Hz)"
      };
    } else if (freq < 600) {
      return {
        name: "Alegría / Plenitud",
        level: "540 Hz",
        desc: "Estado de bienestar interno permanente, ligereza del ser, felicidad y alta vibración celular.",
        group: "Alta Frecuencia (> 200 Hz)"
      };
    } else {
      return {
        name: "Paz / Trascendencia",
        level: "600 Hz - 1000 Hz",
        desc: "Quietud absoluta, unidad con el entorno, serenidad pura y claridad cósmica/espiritual.",
        group: "Alta Frecuencia (> 200 Hz)"
      };
    }
  };

  const stateDetails = getHawkinsState(frequency);

  /**
   * Inicia la reproducción del tono senoidal a la frecuencia Hawkins seleccionada.
   * @param {number} freq - Frecuencia en Hz.
   * @returns {void}
   */
  const startTone = (freq) => {
    try {
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      stopToneOnly();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Mínimo de 1 Hz para evitar fallos matemáticos
      const targetFreq = Math.max(1, freq);
      osc.frequency.setValueAtTime(targetFreq, ctx.currentTime);

      // Usamos una ganancia muy suave y cómoda de calibración (0.04) para auriculares
      const targetVol = 0.04;

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();

      activeOscRef.current = osc;
      activeGainRef.current = gain;
      setIsTonePlaying(true);
    } catch (err) {
      console.error("Error al inicializar el oscilador:", err);
    }
  };

  /**
   * Detiene el tono y actualiza el estado.
   * @returns {void}
   */
  const stopTone = () => {
    stopToneOnly();
    setIsTonePlaying(false);
  };

  /**
   * Detiene el oscilador con rampa de volumen suave para evitar chasquidos.
   * @returns {void}
   */
  const stopToneOnly = () => {
    if (activeOscRef.current && activeGainRef.current && audioCtxRef.current) {
      const osc = activeOscRef.current;
      const gain = activeGainRef.current;
      const ctx = audioCtxRef.current;
      try {
        gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
        setTimeout(() => {
          try {
            osc.stop();
          } catch (e) { }
        }, 100);
      } catch (err) {
        try {
          osc.stop();
        } catch (e) { }
      }
      activeOscRef.current = null;
      activeGainRef.current = null;
    }
  };

  // Portamento: aplicar deslizamiento continuo al cambiar el slider de frecuencia Hawkins
  useEffect(() => {
    if (isTonePlaying && activeOscRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      const targetFreq = Math.max(1, frequency);
      activeOscRef.current.frequency.setValueAtTime(activeOscRef.current.frequency.value, ctx.currentTime);
      activeOscRef.current.frequency.exponentialRampToValueAtTime(targetFreq, ctx.currentTime + 0.1);
    }
  }, [frequency, isTonePlaying]);

  // Limpieza al desmontar el componente
  useEffect(() => {
    return () => {
      stopToneOnly();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => { });
      }
    };
  }, []);

  /**
   * Envía los datos de la encuesta mapeados al formato del Backend
   * para asegurar la compatibilidad sin romper la lógica del generador.
   * @param {React.FormEvent} e - Evento de submit.
   * @returns {void}
   */
  /**
   * Procesa la sumisión de los datos.
   */
  const triggerSubmit = (sienteVal, quiereVal) => {
    stopTone();

    // Mapear comoSiente (1-5, de triste a feliz) a tristeza (5-1, de alta a baja)
    const tristezaMapped = Math.max(1, 6 - sienteVal);
    
    // La brecha (gap) emocional indica el nivel de frustración/estrés
    const gap = Math.abs(quiereVal - sienteVal);
    
    // Mapeamos a las variables esperadas por el backend
    const estresMapped = Math.max(1, Math.min(5, Math.round(tristezaMapped * 0.7 + gap * 0.5)));
    const ansiedadMapped = Math.max(1, Math.min(5, Math.round(tristezaMapped * 0.6 + gap * 0.6)));

    // Determinamos la emoción terapéutica de destino
    let targetEmotion = 'calma';
    if (sienteVal <= 2) {
      targetEmotion = 'zen'; // Triste/bajo -> Terapia profunda reconstructora
    } else if (sienteVal === 3) {
      targetEmotion = 'calma'; // Neutral -> Calma y estabilidad cerebral
    } else {
      targetEmotion = 'relajacion'; // Alegre/alto -> Relajación y flow positivo
    }

    onSubmit({
      ansiedad: ansiedadMapped,
      estres: estresMapped,
      tristeza: tristezaMapped,
      volume: frequency, // Pasamos la frecuencia Hawkins (0-1000) en el parámetro "volume"
      comoSiente: sienteVal,
      comoQuiere: quiereVal,
      emotion: targetEmotion,
    });
  };

  /**
   * Envía los datos de la encuesta mapeados al formato del Backend
   * para asegurar la compatibilidad sin romper la lógica del generador.
   * @param {React.FormEvent} e - Evento de submit.
   * @returns {void}
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    triggerSubmit(comoSiente, comoQuiere);
  };

  /**
   * Maneja el cambio de la emoción deseada. Si hideFrequencies es true,
   * envía la encuesta automáticamente.
   */
  const handleComoQuiereChange = (val) => {
    setComoQuiere(val);
    if (hideFrequencies) {
      console.log("⚡ Auto-submitting survey with selection:", val);
      triggerSubmit(comoSiente, val);
    }
  };

  const cssStyle = `
    @keyframes soundwave-bounce {
      0%, 100% { transform: scaleY(0.35); }
      50% { transform: scaleY(1); }
    }
    .wave-container {
      display: flex;
      align-items: center;
      gap: 3px;
      height: 24px;
    }
    .wave-bar {
      display: inline-block;
      width: 3px;
      height: 18px;
      background-color: var(--bs-primary);
      border-radius: 2px;
      transform-origin: bottom;
      animation: soundwave-bounce 0.8s ease-in-out infinite;
    }
    .wave-bar-1 { animation-delay: 0.1s; }
    .wave-bar-2 { animation-delay: 0.3s; }
    .wave-bar-3 { animation-delay: 0.5s; }
    .wave-bar-4 { animation-delay: 0.2s; }
    .wave-bar-5 { animation-delay: 0.4s; }

    /* Estilizaciones del control de rango */
    .form-range::-webkit-slider-runnable-track {
      height: 4px;
      background-color: var(--bs-primary-border-subtle) !important;
      border-radius: 2px;
    }
    .form-range::-webkit-slider-thumb {
      background-color: var(--bs-primary) !important;
      margin-top: -6px;
      transition: transform 0.1s ease-in-out;
    }
    .form-range::-webkit-slider-thumb:active {
      transform: scale(1.2);
    }
    .form-range:focus::-webkit-slider-thumb {
      box-shadow: 0 0 0 1px #fff, 0 0 0 0.25rem var(--theme-glow-1) !important;
    }
  `;

  return (
    <div className="w-100 py-2 d-flex flex-column align-items-center justify-content-center">
      <style>{cssStyle}</style>
      <main className="w-full max-w-[600px] d-flex flex-column align-items-center p-3 animate-fade-in-up">
        {/* Encabezado */}
        <header className="text-center mb-3 w-100">
          <h2 className="h4 text-dark mb-1 fw-bold">
            Autoevaluación Emocional
          </h2>
          <p className="text-muted small mb-0">
            Responde las preguntas para que sincronicemos tu música con las frecuencias de la conciencia.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="w-100 d-flex flex-column gap-3">
          {/* Escala 1: ¿Cómo te sientes? */}
          <div className="d-flex flex-column bg-white bg-opacity-75 backdrop-blur-sm rounded-4 p-3 border border-light-subtle shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="fw-bold text-dark mb-0">¿Cómo te sientes en este momento?</label>
              <span className="small text-secondary italic fw-semibold text-primary">
                {labels.sientes[comoSiente - 1]}
              </span>
            </div>
            <Slider
              mode="likert"
              value={comoSiente}
              onChange={setComoSiente}
              nodes={nodesConfig.sientes}
              ariaLabel="Cómo te sientes en este momento"
            />
            <div className="d-flex justify-content-between mt-1 px-2 text-secondary fw-semibold" style={{ fontSize: '11px' }}>
              <span>Triste</span>
              <span>Feliz</span>
            </div>
          </div>

          {/* Escala 2: ¿Cómo te quisieras sentir? */}
          <div className="d-flex flex-column bg-white bg-opacity-75 backdrop-blur-sm rounded-4 p-3 border border-light-subtle shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="fw-bold text-dark mb-0">¿Cómo te quisieras sentir?</label>
              <span className="small text-secondary italic fw-semibold text-primary">
                {labels.quieres[comoQuiere - 1]}
              </span>
            </div>
            <Slider
              mode="likert"
              value={comoQuiere}
              onChange={handleComoQuiereChange}
              nodes={nodesConfig.quieres}
              ariaLabel="Cómo te quisieras sentir"
            />
            <div className="d-flex justify-content-between mt-1 px-2 text-secondary fw-semibold" style={{ fontSize: '11px' }}>
              <span>Triste</span>
              <span>Feliz</span>
            </div>
          </div>

          {/* Tarjeta de calibración de auriculares con Frecuencia Hawkins */}
          {!hideFrequencies && (
            <div className="d-flex flex-column bg-white bg-opacity-75 backdrop-blur-sm rounded-4 p-4 border border-light-subtle shadow-sm gap-3">
              <div className="d-flex align-items-center gap-2 border-bottom pb-2">
                <span className="material-symbols-outlined notranslate text-primary" translate="no" style={{ fontSize: '24px' }}>
                  headphones
                </span>
                <div className="text-start">
                  <h3 className="h6 fw-bold mb-0 text-dark">
                    Ponte tus auriculares y calibra la vibración
                  </h3>
                  <span className="text-muted" style={{ fontSize: '10.5px' }}>
                    Escala de Vibración de la Conciencia (Dr. David Hawkins)
                  </span>
                </div>
              </div>

              <p className="text-muted small mb-0 text-start" style={{ fontSize: '11.5px', lineHeight: '1.4' }}>
                Utiliza el control inferior para calibrar tu frecuencia de conciencia en tiempo real (de 0 a 1000 Hz). Escucharás el tono senoidal deslizarse armónicamente para acoplarse a tu calibración actual.
              </p>

              {/* Panel dinámico de estado de conciencia Hawkins */}
              <div className="d-flex align-items-center justify-content-between bg-light bg-opacity-50 p-3 rounded-3 border border-light-subtle gap-3 text-start">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-1.5 mb-0.5">
                    <span className="badge bg-primary text-white text-[10px] rounded-pill">
                      {stateDetails.group}
                    </span>
                    <span className="text-primary fw-bold" style={{ fontSize: '12px' }}>
                      {stateDetails.name} ({stateDetails.level})
                    </span>
                  </div>
                  <span className="text-muted d-block" style={{ fontSize: '11px', lineHeight: '1.35' }}>
                    {stateDetails.desc}
                  </span>
                </div>

                <div className="d-flex flex-column align-items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => isTonePlaying ? stopTone() : startTone(frequency)}
                    className={`btn rounded-circle d-flex align-items-center justify-content-center p-0 transition-transform ${isTonePlaying ? 'btn-primary text-white shadow-sm' : 'btn-light border text-muted'
                      }`}
                    style={{ width: '40px', height: '40px' }}
                  >
                    <span className="material-symbols-outlined notranslate fs-5" translate="no">
                      {isTonePlaying ? 'pause' : 'volume_up'}
                    </span>
                  </button>

                  {isTonePlaying && (
                    <div className="wave-container mt-0.5">
                      <div className="wave-bar wave-bar-1" />
                      <div className="wave-bar wave-bar-2" />
                      <div className="wave-bar wave-bar-3" />
                      <div className="wave-bar wave-bar-4" />
                      <div className="wave-bar wave-bar-5" />
                    </div>
                  )}
                </div>
              </div>

              {/* Slider de Frecuencia Hawkins */}
              <div className="mt-1">
                <div className="d-flex align-items-center justify-content-between mb-1.5">
                  <label htmlFor="frequency-calibration" className="fw-semibold text-dark small d-flex align-items-center gap-1">
                    <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: '16px' }}>graphic_eq</span>
                    Frecuencia de Calibración
                  </label>
                  <span className="badge bg-primary text-white rounded-pill fw-bold" style={{ fontSize: '11px' }}>
                    {frequency} Hz
                  </span>
                </div>
                <input
                  type="range"
                  className="form-range w-100"
                  id="frequency-calibration"
                  min="0"
                  max="1000"
                  step="5"
                  value={frequency}
                  onChange={(e) => setFrequency(Number(e.target.value))}
                  aria-label="Frecuencia de calibración Hawkins"
                />
                <div className="d-flex justify-content-between mt-1 px-1 text-secondary" style={{ fontSize: '10px' }}>
                  <span>0 Hz (Baja)</span>
                  <span>200 Hz (Inflexión)</span>
                  <span>600 Hz+ (Paz)</span>
                  <span>1000 Hz (Máxima)</span>
                </div>
              </div>
            </div>
          )}

          {/* Botón de envío */}
          {!hideFrequencies && (
            <div className="mt-2 d-flex justify-content-center w-100">
              <Button
                type="submit"
                variant="secondary"
                icon="arrow_forward"
                className="w-100 py-3 shadow-sm rounded-pill fw-semibold"
              >
                Continuar y Sintonizar
              </Button>
            </div>
          )}
        </form>
      </main>
    </div>
  );
};

export default InitialSurvey;
