import React, { useState, useEffect, useRef } from 'react';
import Button from '../common/Button';

/* ─── Mini Timer Panel ──────────────────────────────────────────────── */
const TimerPanel = ({ onTimerEnd }) => {
  const [presetDuration, setPresetDuration] = useState(15);
  const [timeLeft, setTimeLeft]             = useState(15 * 60);
  const [isRunning, setIsRunning]           = useState(false);
  const [totalSeconds, setTotalSeconds]     = useState(15 * 60);
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
            if (onTimerEnd) onTimerEnd();
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

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const percentage  = totalSeconds > 0 ? (timeLeft / totalSeconds) * 100 : 0;
  const radius      = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className="d-flex flex-column align-items-center p-3 bg-white rounded-4 shadow-sm border border-light-subtle animate-fade-in-up"
      style={{ minWidth: '200px', maxWidth: '240px' }}
    >
      {/* Circle */}
      <div className="position-relative d-flex align-items-center justify-content-center mb-3"
           style={{ width: '148px', height: '148px' }}>
        {/* Aura glow */}
        <div
          className={`position-absolute rounded-circle transition-all ${isRunning ? 'opacity-60' : 'opacity-10'}`}
          style={{
            top: '12px', left: '12px', right: '12px', bottom: '12px',
            background: 'var(--bs-primary)',
            filter: 'blur(18px)',
            transition: 'opacity 1s ease'
          }}
        />
        <svg className="w-100 h-100 position-relative" style={{ transform: 'rotate(-90deg)', zIndex: 1 }}>
          <circle cx="74" cy="74" r={radius} stroke="#eceef0" strokeWidth="5" fill="transparent" />
          <circle
            cx="74" cy="74" r={radius}
            style={{
              stroke: 'var(--bs-primary)',
              strokeDasharray: circumference,
              strokeDashoffset,
              strokeLinecap: 'round',
              transition: 'stroke-dashoffset 1s linear'
            }}
            strokeWidth="6"
            fill="transparent"
          />
        </svg>
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center" style={{ zIndex: 2 }}>
          <span className="fw-bold font-monospace text-dark" style={{ fontSize: '1.6rem' }}>
            {formatTime(timeLeft)}
          </span>
          <span className="text-uppercase text-secondary" style={{ fontSize: '8px', letterSpacing: '1px' }}>
            {isRunning ? 'en curso' : 'listo'}
          </span>
        </div>
      </div>

      {/* Presets */}
      <div className="d-flex gap-1 mb-3 flex-wrap justify-content-center">
        {[5, 15, 30, 45, 60].map((mins) => (
          <button
            key={mins}
            type="button"
            onClick={() => handlePresetSelect(mins)}
            className={`rounded-pill fw-semibold px-2 py-1 border-0 transition-all ${
              presetDuration === mins ? 'btn btn-primary shadow-sm' : 'btn btn-light text-secondary'
            }`}
            style={{ fontSize: '10px' }}
          >
            {mins}m
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="d-flex gap-2 w-100">
        <button
          onClick={handleStartPause}
          className={`btn flex-grow-1 rounded-pill d-flex align-items-center justify-content-center gap-1 fw-semibold ${
            isRunning ? 'btn-outline-primary' : 'btn-primary'
          }`}
          style={{ fontSize: '11px', padding: '6px 8px' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
            {isRunning ? 'pause' : 'play_arrow'}
          </span>
          {isRunning ? 'Pausar' : 'Iniciar'}
        </button>
        <button
          onClick={handleReset}
          className="btn btn-light rounded-circle border border-light-subtle d-flex align-items-center justify-content-center"
          style={{ width: '34px', height: '34px', padding: 0 }}
          title="Reiniciar"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>replay</span>
        </button>
      </div>

      {isRunning && (
        <p className="mt-2 text-primary d-flex align-items-center gap-1 mb-0" style={{ fontSize: '10px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>sync</span>
          Temporizador activo
        </p>
      )}
    </div>
  );
};

/* ─── Dashboard ─────────────────────────────────────────────────────── */
const Dashboard = ({
  tracks = [],
  currentIndex = 0,
  isPlaying = false,
  progress = 0,
  duration = 0,
  isLoading = false,
  onPlayPause,
  onNext,
  onPrev,
  onSelectTrack,
  onSeek,
  onNavigate,
  onFeedback,
  onTimerEnd
}) => {
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType,    setToastType]    = useState('success');
  const [showTimer,    setShowTimer]    = useState(false);

  const currentTrack = tracks[currentIndex] || null;

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFeedbackClick = (type) => {
    if (type === 'positive') {
      showToast('¡Validado! Guardando sintonía óptima.', 'success');
      onFeedback('positive');
    } else {
      showToast('Ajustando algoritmo. Cargando nuevas frecuencias...', 'warning');
      onFeedback('negative');
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3 position-relative">

      {/* Toast */}
      {toastMessage && (
        <div
          className={`position-fixed top-0 start-50 translate-middle-x mt-4 alert ${
            toastType === 'success' ? 'alert-success' : 'alert-warning'
          } shadow-sm rounded-pill px-4 py-2 z-3`}
          role="alert"
          style={{ transition: 'opacity 0.5s' }}
        >
          <div className="d-flex align-items-center gap-2">
            <span className="material-symbols-outlined filled">
              {toastType === 'success' ? 'check_circle' : 'change_circle'}
            </span>
            <span className="fw-semibold" style={{ fontSize: '13px' }}>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Timer Toggle Button (top-right corner) */}
      <button
        onClick={() => setShowTimer((prev) => !prev)}
        className={`position-absolute top-0 end-0 m-3 btn rounded-circle d-flex align-items-center justify-content-center shadow-sm border-0 transition-all ${
          showTimer ? 'btn-primary' : 'btn-light'
        }`}
        style={{ width: '42px', height: '42px', zIndex: 10 }}
        title={showTimer ? 'Ocultar temporizador' : 'Mostrar temporizador'}
      >
        <span className={`material-symbols-outlined ${showTimer ? 'filled' : ''}`} style={{ fontSize: '20px' }}>
          timer
        </span>
      </button>

      {/* Main Canvas */}
      {currentTrack ? (
        <div className="container-fluid mx-auto" style={{ maxWidth: '1150px' }}>
          <div className="row justify-content-center align-items-center g-4">

            {/* Left Column: Visualizer & Controls */}
            <div className={`col-12 d-flex flex-column align-items-center ${showTimer ? 'col-md-5' : 'col-md-6'}`}>

              {/* Art Circle */}
              <div
                className={`position-relative rounded-circle border border-2 border-white shadow-sm overflow-hidden d-flex align-items-center justify-content-center ${
                  isPlaying ? 'animate-subtle-pulse' : ''
                }`}
                style={{ width: '220px', height: '220px', background: '#eceef0' }}
              >
                <div
                  className="position-absolute w-100 h-100"
                  style={{ backgroundImage: `url('${currentTrack.cover}')`, backgroundSize: 'cover', filter: 'blur(8px)', opacity: 0.25 }}
                />
                <div className="rounded-circle overflow-hidden position-relative border shadow-inner z-1" style={{ width: '168px', height: '168px' }}>
                  <img src={currentTrack.cover} alt="" className="w-100 h-100 object-cover" />
                  <div className={`position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-25 d-flex align-items-center justify-content-center gap-1 transition-opacity ${
                    isPlaying ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <span className="w-0.5 bg-white rounded h-4 animate-pulse duration-[700ms]" />
                    <span className="w-0.5 bg-white rounded h-6 animate-pulse duration-[400ms]" />
                    <span className="w-0.5 bg-white rounded h-3 animate-pulse duration-[900ms]" />
                  </div>
                </div>
              </div>

              {/* Title & Artist */}
              <div className="text-center mt-3 mb-2 w-100">
                <h4 className="h6 fw-bold mb-1 text-truncate px-3 text-on-surface">{currentTrack.title}</h4>
                <p className="text-muted small mb-0 text-truncate">{currentTrack.artist}</p>
              </div>

              {/* Progress Slider */}
              <div className="w-100 px-3 mb-3">
                <input
                  type="range"
                  className="form-range"
                  min={0}
                  max={duration || 30}
                  value={progress}
                  onChange={(e) => onSeek(Number(e.target.value))}
                />
                <div className="d-flex justify-content-between text-muted small" style={{ fontSize: '10px' }}>
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="w-100 px-3 d-flex flex-column gap-2 mb-3">
                {[
                  { label: 'Energía',    value: currentTrack.energy  || 3,  max: 10,  pct: (currentTrack.energy  || 3) * 10,    suffix: '/10' },
                  { label: 'Valencia',   value: currentTrack.valence || 7,  max: 10,  pct: (currentTrack.valence || 7) * 10,    suffix: '/10' },
                  { label: 'BPM (Tempo)',value: currentTrack.bpm     || 60, max: 160, pct: ((currentTrack.bpm || 60) / 160) * 100, suffix: ' BPM' }
                ].map(({ label, value, pct, suffix }) => (
                  <div key={label}>
                    <div className="d-flex justify-content-between text-muted" style={{ fontSize: '11px' }}>
                      <span>{label}</span>
                      <span className="fw-semibold">{value}{suffix}</span>
                    </div>
                    <div className="progress" style={{ height: '4px' }}>
                      <div className="progress-bar bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Controls */}
              <div className="d-flex align-items-center justify-content-center gap-3">
                <button
                  onClick={onPrev}
                  className="btn btn-light rounded-circle shadow-sm border-0 p-2 d-flex align-items-center justify-content-center"
                  style={{ width: '48px', height: '48px' }}
                >
                  <span className="material-symbols-outlined fs-4">skip_previous</span>
                </button>
                <button
                  onClick={onPlayPause}
                  className="btn btn-primary rounded-circle shadow p-3 d-flex align-items-center justify-content-center"
                  style={{ width: '64px', height: '64px' }}
                >
                  <span className="material-symbols-outlined fs-3 filled">
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                <button
                  onClick={onNext}
                  className="btn btn-light rounded-circle shadow-sm border-0 p-2 d-flex align-items-center justify-content-center"
                  style={{ width: '48px', height: '48px' }}
                >
                  <span className="material-symbols-outlined fs-4">skip_next</span>
                </button>
              </div>
            </div>

            {/* Center Column: Playlist */}
            <div className={`col-12 d-flex flex-column align-items-stretch ${showTimer ? 'col-md-4' : 'col-md-6'}`}>
              <h5 className="h6 text-uppercase text-muted fw-bold mb-3 text-center text-md-start" style={{ letterSpacing: '1px' }}>
                Selección Personalizada
              </h5>

              <div className="list-group w-100 overflow-y-auto mb-4 px-1" style={{ maxHeight: '230px' }}>
                {tracks.map((track, index) => {
                  const isCurrent = index === currentIndex;
                  const tagColors = {
                    Calma:    'bg-info-subtle text-info',
                    Foco:     'bg-warning-subtle text-warning',
                    Zen:      'bg-success-subtle text-success',
                    Relajacion: 'bg-purple-subtle text-purple',
                  };

                  return (
                    <button
                      key={track.id}
                      onClick={() => onSelectTrack(index)}
                      className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between border-0 rounded-4 mb-2 p-2 shadow-sm ${
                        isCurrent ? 'bg-primary-container border-start border-3 border-primary' : 'bg-white'
                      }`}
                    >
                      <div className="d-flex align-items-center gap-2 min-w-0">
                        <div className="position-relative overflow-hidden rounded shadow-sm flex-shrink-0" style={{ width: '36px', height: '36px' }}>
                          <img src={track.cover} alt="" className="w-100 h-100 object-cover" />
                          {isCurrent && (
                            <div className="position-absolute top-0 start-0 w-100 h-100 bg-primary bg-opacity-25 d-flex align-items-center justify-content-center">
                              <span className="material-symbols-outlined text-white text-sm filled">
                                {isPlaying ? 'volume_up' : 'play_arrow'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-start min-w-0">
                          <p className={`mb-0 fw-semibold text-truncate small ${isCurrent ? 'text-primary' : 'text-dark'}`}>
                            {track.title}
                          </p>
                          <p className="mb-0 text-muted text-truncate" style={{ fontSize: '10px' }}>
                            {track.artist}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`badge rounded-pill text-uppercase ${tagColors[track.genre] || 'bg-light text-muted'}`}
                        style={{ fontSize: '8px' }}
                      >
                        {track.genre || 'Calma'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback */}
              <div className="d-flex gap-2 w-100">
                <button
                  onClick={() => handleFeedbackClick('negative')}
                  className="btn btn-outline-secondary rounded-pill flex-grow-1 d-flex align-items-center justify-content-center gap-1 fw-semibold"
                  style={{ fontSize: '12px', padding: '8px' }}
                >
                  <span className="material-symbols-outlined fs-6">thumb_down</span>
                  <span>No ayuda</span>
                </button>
                <button
                  onClick={() => handleFeedbackClick('positive')}
                  className="btn btn-primary rounded-pill flex-grow-1 d-flex align-items-center justify-content-center gap-1 fw-semibold"
                  style={{ fontSize: '12px', padding: '8px' }}
                >
                  <span className="material-symbols-outlined fs-6">thumb_up</span>
                  <span>Me ayuda</span>
                </button>
              </div>
            </div>

            {/* Right Column: Timer Panel (conditional) */}
            {showTimer && (
              <div className="col-12 col-md-3 d-flex flex-column align-items-center">
                <h5 className="h6 text-uppercase text-muted fw-bold mb-3 text-center" style={{ letterSpacing: '1px' }}>
                  Temporizador
                </h5>
                <TimerPanel onTimerEnd={onTimerEnd} />
              </div>
            )}

          </div>
        </div>
      ) : (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status" />
          <p className="text-muted">Generando tu playlist adaptada...</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
