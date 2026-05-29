import React, { useState, useRef, useEffect } from 'react';
import Button from '../common/Button';
import Slider from '../common/Slider';

const Calibration = ({ onConfirm, onBack }) => {
  const [volume, setVolume] = useState(45);
  const [isTonePlaying, setIsTonePlaying] = useState(false);

  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);

  const startTone = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      // Stop existing if any
      stopTone();

      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, audioCtxRef.current.currentTime); // 432Hz Base Theta Tuning
      
      // Calculate volume fraction
      const volFraction = volume / 100;
      gain.gain.setValueAtTime(volFraction * 0.2, audioCtxRef.current.currentTime); // limit max gain for safety

      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);

      osc.start();
      
      oscRef.current = osc;
      gainRef.current = gain;
      setIsTonePlaying(true);
    } catch (e) {
      console.error("Web Audio API not supported or blocked:", e);
    }
  };

  const stopTone = () => {
    if (oscRef.current) {
      try {
        oscRef.current.stop();
      } catch (e) {}
      oscRef.current = null;
    }
    setIsTonePlaying(false);
  };

  // Adjust volume dynamically if tone is playing
  useEffect(() => {
    if (isTonePlaying && gainRef.current && audioCtxRef.current) {
      const volFraction = volume / 100;
      gainRef.current.gain.setValueAtTime(volFraction * 0.2, audioCtxRef.current.currentTime);
    }
  }, [volume, isTonePlaying]);

  // Stop tone when component unmounts
  useEffect(() => {
    return () => {
      stopTone();
    };
  }, []);

  const handleConfirm = () => {
    stopTone();
    onConfirm(volume);
  };

  return (
    <div className="w-100 py-2 d-flex flex-column align-items-center justify-content-center">
      {/* Center Column */}
      <div className="w-100 d-flex flex-column align-items-center p-3 animate-fade-in-up" style={{ maxWidth: '600px' }}>
        
        {/* Focus Icon */}
        <div className="w-16 h-16 rounded-circle bg-light d-flex align-items-center justify-content-center mb-3 shadow-sm border border-light-subtle">
          <span className="material-symbols-outlined text-primary opacity-80" style={{ fontVariationSettings: "'FILL' 0", fontSize: '32px' }}>
            headphones
          </span>
        </div>

        {/* Headline */}
        <h2 className="h4 text-dark text-center mb-3 fw-bold">
          Ponte tus auriculares y ajusta tu entorno
        </h2>

        {/* Calibration Card (Glassmorphism) */}
        <div className="w-100 bg-white bg-opacity-75 backdrop-blur-sm rounded-4 p-4 border border-light-subtle shadow-sm d-flex flex-column gap-3 relative overflow-hidden">
          {/* Subtle decorative background element */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-primary-container bg-opacity-20 blur-[40px] rounded-full pointer-events-none" />

          {/* Controls */}
          <div className="d-flex justify-content-center gap-3 z-10">
            <Button
              variant="secondary"
              icon={isTonePlaying ? "volume_up" : "play_arrow"}
              onClick={startTone}
              className={`py-2.5 px-4 ${isTonePlaying ? "animate-pulse" : ""}`}
            >
              {isTonePlaying ? "Tono Activo" : "Probar Sonido"}
            </Button>
            
            <Button
              variant="text"
              icon="stop_circle"
              onClick={stopTone}
              className="border border-secondary border-opacity-25 rounded-pill py-2.5 px-4"
            >
              Detener
            </Button>
          </div>

          {/* Slider Area */}
          <div className="d-flex flex-column gap-2 z-10 w-100 max-w-[400px] mx-auto text-center">
            <p className="text-muted small mb-2">
              Ajusta el volumen hasta que el sonido sea cómodo y relajante para ti.
            </p>
            
            <div className="w-100 d-flex flex-column gap-2">
              <Slider
                mode="range"
                min={0}
                max={100}
                value={volume}
                onChange={setVolume}
                ariaLabel="Volume threshold"
              />
              
              {/* Likert/Scale Indicators */}
              <div className="d-flex justify-content-between text-secondary px-1">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0", fontSize: '20px' }}>
                  volume_mute
                </span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0", fontSize: '20px' }}>
                  volume_up
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-2 w-100 mt-2">
            {onBack && (
              <Button
                variant="outline"
                icon="arrow_back"
                onClick={() => {
                  stopTone();
                  onBack();
                }}
                className="w-50 py-3 rounded-pill"
              >
                Regresar
              </Button>
            )}
            <Button
              variant="primary"
              icon="arrow_forward"
              onClick={handleConfirm}
              className={onBack ? "w-50 py-3 rounded-pill shadow-sm" : "w-100 py-3 rounded-pill shadow-sm"}
            >
              Confirmar y Calibrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calibration;
