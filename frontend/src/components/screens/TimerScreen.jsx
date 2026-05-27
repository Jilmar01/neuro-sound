import React, { useState, useEffect, useRef } from 'react';
import Button from '../common/Button';

const TimerScreen = ({ onTimerEnd, onNavigate }) => {
  const [presetDuration, setPresetDuration] = useState(15); // Default 15 mins
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(15 * 60);

  const timerRef = useRef(null);

  const handlePresetSelect = (mins) => {
    setPresetDuration(mins);
    setTimeLeft(mins * 60);
    setTotalSeconds(mins * 60);
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleStartPause = () => {
    if (isRunning) {
      setIsRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      setIsRunning(true);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            onTimerEnd(); // pause music and notify
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(presetDuration * 60);
    setTotalSeconds(presetDuration * 60);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const percentage = totalSeconds > 0 ? (timeLeft / totalSeconds) * 100 : 0;
  const radius = 75;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="w-100 py-2 d-flex flex-column align-items-center justify-content-center">
      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[600px] flex flex-col items-center justify-center p-3 animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-3">
          <h2 className="h4 text-dark mb-1 fw-bold">
            Temporizador de Sesión
          </h2>
          <p className="text-muted small mb-0">
            Sincroniza tus frecuencias de bienestar con tu horario de trabajo o descanso.
          </p>
        </div>

        {/* Timer Canvas (Glassmorphism card) */}
        <div className="w-full bg-white bg-opacity-75 backdrop-blur-sm rounded-4 p-4 border border-light-subtle shadow-sm d-flex flex-column align-items-center">
          
          {/* Timer Circle */}
          <div className="relative w-48 h-48 flex items-center justify-center mb-4">
            {/* Breathing light aura */}
            <div className={`absolute inset-4 rounded-full bg-primary-container bg-opacity-30 blur-2xl transition-all duration-[4000ms] ease-in-out ${
              isRunning ? 'scale-110 opacity-80 animate-pulse' : 'scale-95 opacity-20'
            }`} />

            <svg className="w-full h-full transform -rotate-90 z-10">
              <circle
                cx="96"
                cy="96"
                r={radius}
                className="stroke-light"
                strokeWidth="5"
                fill="transparent"
              />
              <circle
                cx="96"
                cy="96"
                r={radius}
                style={{
                  stroke: 'var(--bs-primary)',
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                  strokeLinecap: 'round'
                }}
                className="transition-all duration-1000 ease-linear"
                strokeWidth="6"
                fill="transparent"
              />
            </svg>

            {/* Counter Overlay */}
            <div className="absolute inset-0 d-flex flex-column align-items-center justify-content-center z-20">
              <span className="text-4xl font-semibold font-mono text-dark tracking-wider">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[10px] text-uppercase tracking-widest mt-1 text-secondary">
                tiempo restante
              </span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="w-100 d-flex justify-content-between gap-2 mb-3 z-10">
            {[5, 15, 30, 45, 60].map((mins) => {
              const isSelected = presetDuration === mins;
              return (
                <button
                  key={mins}
                  type="button"
                  onClick={() => handlePresetSelect(mins)}
                  className={`flex-grow-1 py-2 px-1 rounded-pill text-xs font-semibold transition-all ${
                    isSelected 
                      ? 'btn btn-primary shadow-sm' 
                      : 'btn btn-light text-secondary'
                  }`}
                >
                  {mins}m
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="w-100 d-flex gap-3 z-10">
            <Button
              variant={isRunning ? "outline" : "secondary"}
              onClick={handleStartPause}
              className="flex-grow-1 py-3"
              icon={isRunning ? "pause" : "play_arrow"}
            >
              {isRunning ? "Pausar" : "Iniciar"}
            </Button>

            <Button
              variant="text"
              onClick={handleReset}
              className="flex-grow-1 py-3 border border-secondary border-opacity-25 rounded-pill"
              icon="replay"
            >
              Reiniciar
            </Button>
          </div>
        </div>

        {isRunning && (
          <p className="mt-4 text-sm text-primary opacity-80 d-flex align-items-center gap-2">
            <span className="material-symbols-outlined text-base animate-spin">sync</span>
            Reproducción automatizada activa
          </p>
        )}
      </div>
    </div>
  );
};

export default TimerScreen;
