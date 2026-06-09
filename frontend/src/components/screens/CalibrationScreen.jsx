import React, { useState, useRef, useEffect } from 'react';
import Button from '../common/Button';

const CalibrationScreen = ({ initialData = null, onSubmit }) => {
  const [frequency, setFrequency] = useState(() => initialData?.volume ?? 200);
  const [isTonePlaying, setIsTonePlaying] = useState(false);

  const audioCtxRef = useRef(null);
  const activeOscRef = useRef(null);
  const activeGainRef = useRef(null);

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
      const targetFreq = Math.max(1, freq);
      osc.frequency.setValueAtTime(targetFreq, ctx.currentTime);

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

  const stopTone = () => {
    stopToneOnly();
    setIsTonePlaying(false);
  };

  const stopToneOnly = () => {
    if (activeOscRef.current && activeGainRef.current && audioCtxRef.current) {
      const osc = activeOscRef.current;
      const gain = activeGainRef.current;
      const ctx = audioCtxRef.current;
      try {
        gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
        setTimeout(() => {
          try { osc.stop(); } catch (e) { }
        }, 100);
      } catch (err) {
        try { osc.stop(); } catch (e) { }
      }
      activeOscRef.current = null;
      activeGainRef.current = null;
    }
  };

  useEffect(() => {
    if (isTonePlaying && activeOscRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      const targetFreq = Math.max(1, frequency);
      activeOscRef.current.frequency.setValueAtTime(activeOscRef.current.frequency.value, ctx.currentTime);
      activeOscRef.current.frequency.exponentialRampToValueAtTime(targetFreq, ctx.currentTime + 0.1);
    }
  }, [frequency, isTonePlaying]);

  useEffect(() => {
    return () => {
      stopToneOnly();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => { });
      }
    };
  }, []);

  const handleContinue = () => {
    stopTone();
    onSubmit({ volume: frequency });
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
        <div className="d-flex flex-column bg-white bg-opacity-75 backdrop-blur-sm rounded-4 p-4 border border-light-subtle shadow-sm gap-3 w-100">
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
                className={`btn rounded-circle d-flex align-items-center justify-content-center p-0 transition-transform ${isTonePlaying ? 'btn-primary text-white shadow-sm' : 'btn-light border text-muted'}`}
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

          <div className="mt-2 d-flex justify-content-center w-100">
            <Button
              type="button"
              variant="secondary"
              icon="arrow_forward"
              className="w-100 py-3 shadow-sm rounded-pill fw-semibold"
              onClick={handleContinue}
            >
              Continuar
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CalibrationScreen;
