import React, { useState, useEffect, useRef } from 'react';
import Button from '../common/Button';

/**
 * Indica si la portada es generica o no existe.
 * @param {string} url - URL de la portada.
 * @returns {boolean}
 */
const isDefaultCover = (url) => {
  return !url || url.includes('lh3.googleusercontent.com') || url.includes('defaultcover.png');
};

/**
 * Devuelve el icono segun el genero musical.
 * @param {string} genre - Genero del track.
 * @returns {string} nombre del icono Material.
 */
const getGenreIcon = (genre) => {
  if (!genre) return 'audiotrack';
  const g = genre.toLowerCase();
  if (g.includes('electr')) return 'bolt';
  if (g.includes('amb')) return 'cloud';
  if (g.includes('class') || g.includes('clás') || g.includes('clas')) return 'music_note';
  if (g.includes('chill')) return 'spa';
  if (g.includes('calma')) return 'self_improvement';
  if (g.includes('foco')) return 'psychology';
  if (g.includes('zen')) return 'nature';
  return 'waves';
};

/**
 * Pantalla principal con reproductor, visualizador y playlist.
 * @param {Object} props - Propiedades del componente.
 * @param {Array} props.tracks - Lista de tracks.
 * @param {number} props.currentIndex - Indice actual.
 * @param {boolean} props.isPlaying - Estado de reproduccion.
 * @param {number} props.progress - Progreso actual en segundos.
 * @param {number} props.duration - Duracion actual en segundos.
 * @param {boolean} props.isLoading - Indica si se esta cargando audio.
 * @param {number} props.volume - Volumen actual (0-100).
 * @param {(value: number) => void} props.onVolumeChange - Cambia volumen.
 * @param {() => void} props.onPlayPause - Alterna reproduccion.
 * @param {() => void} props.onNext - Salta a siguiente.
 * @param {() => void} props.onPrev - Salta a anterior.
 * @param {(index: number) => void} props.onSelectTrack - Selecciona track.
 * @param {(value: number) => void} props.onSeek - Cambia el tiempo.
 * @param {(screen: string) => void} props.onNavigate - Navegacion.
 * @param {(type: "positive"|"negative") => void} props.onFeedback - Feedback.
 * @param {number} props.timeLeft - Tiempo restante en segundos.
 * @param {boolean} props.isTimerRunning - Estado del timer.
 * @param {number} props.timerDuration - Duracion del timer en minutos.
 * @param {() => void} props.onStartPauseTimer - Inicia/pausa timer.
 * @param {() => void} props.onResetTimer - Reinicia timer.
 * @param {(mins: number) => void} props.onSelectTimerPreset - Preset timer.
 * @param {AnalyserNode|null} props.analyserNode - Nodo analizador Web Audio.
 * @returns {JSX.Element}
 */
const Dashboard = ({
  tracks = [],
  currentIndex = 0,
  isPlaying = false,
  progress = 0,
  duration = 0,
  isLoading = false,
  volume = 50,
  onVolumeChange,
  onPlayPause,
  onNext,
  onPrev,
  onSelectTrack,
  onSeek,
  onNavigate,
  onFeedback,
  timeLeft = 15 * 60,
  isTimerRunning = false,
  timerDuration = 15,
  onStartPauseTimer,
  onResetTimer,
  onSelectTimerPreset,
  analyserNode = null,
  onShowEmotionalSummary,
  surveyData
}) => {
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [showTimerPanel, setShowTimerPanel] = useState(false);

  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const currentTrack = tracks[currentIndex] || null;

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let bufferLength = 0;
    let dataArray = null;
    if (analyserNode) {
      bufferLength = analyserNode.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
    }

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      if (analyserNode && isPlaying) {
        analyserNode.getByteFrequencyData(dataArray);
      } else if (dataArray) {
        // Decae suavemente las frecuencias cuando esta en pausa
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = dataArray[i] * 0.92;
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseRadius = 78; // Borde del circulo de portada de 145px

      // Resuelve los valores RGB del tema activo desde CSS
      const primaryRgb = window.getComputedStyle(document.documentElement).getPropertyValue('--bs-primary-rgb').trim() || '13, 110, 253';

      // Calcula escala dinamica segun energia de frecuencia
      let avgFreq = 0;
      if (analyserNode && dataArray) {
        avgFreq = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
      }
      const pulseScale = 1 + (avgFreq / 256) * 0.15;
      const time = Date.now() * 0.0025; // Variable de tiempo para efecto de respiracion

      // 1. Dibuja gradiente radial de brillo
      ctx.beginPath();
      const glowGrad = ctx.createRadialGradient(
        centerX, centerY, baseRadius * 0.7,
        centerX, centerY, baseRadius * pulseScale * 1.4
      );
      glowGrad.addColorStop(0, `rgba(${primaryRgb}, 0.22)`);
      glowGrad.addColorStop(0.5, `rgba(${primaryRgb}, 0.08)`);
      glowGrad.addColorStop(1, `rgba(${primaryRgb}, 0)`);
      ctx.fillStyle = glowGrad;
      ctx.arc(centerX, centerY, baseRadius * pulseScale * 1.4, 0, 2 * Math.PI);
      ctx.fill();

      // 2. Dibuja 60 barras de frecuencia
      const numBars = 60;
      ctx.lineWidth = 3.0;

      for (let i = 0; i < numBars; i++) {
        let val = 0;
        if (dataArray && bufferLength > 0) {
          const bin = Math.floor((i / numBars) * (bufferLength * 0.65));
          val = dataArray[bin];
        }

        // Altura de barra (max 38px) con respiracion sutil al estar en pausa
        const barHeight = (val / 255.0) * 38 + (Math.sin(time + i * 0.2) * 1.2 + 1.2);

        const angle = (i / numBars) * 2 * Math.PI;

        const startX = centerX + Math.cos(angle) * baseRadius;
        const startY = centerY + Math.sin(angle) * baseRadius;

        const endX = centerX + Math.cos(angle) * (baseRadius + barHeight);
        const endY = centerY + Math.sin(angle) * (baseRadius + barHeight);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);

        ctx.strokeStyle = `rgba(${primaryRgb}, ${0.35 + (val / 255.0) * 0.65})`;
        ctx.stroke();
      }

      // 3. Blobs centrales (solo si la portada es default)
      if (currentTrack && isDefaultCover(currentTrack.cover)) {
        // Dibuja blob de doble capa en el centro
        // --- Capa 1 (externa, mas transparente, cambia mas rapido) ---
        ctx.beginPath();
        const numPoints = 80;
        const baseBlobRadius1 = 68;

        for (let i = 0; i <= numPoints; i++) {
          const angle = (i / numPoints) * 2 * Math.PI;

          let val = 0;
          if (dataArray && bufferLength > 0) {
            const freqBin = Math.floor((i % (numPoints / 2)) / (numPoints / 2) * (bufferLength * 0.4));
            val = dataArray[freqBin] || 0;
          }

          const morph = ((val / 255.0) * 12) + Math.sin(time * 1.5 + i * 0.15) * 5 + Math.cos(time * 0.8 + i * 0.3) * 2.5;
          const r = baseBlobRadius1 + morph;

          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        const blobGrad1 = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, baseBlobRadius1 + 15
        );
        blobGrad1.addColorStop(0, `rgba(${primaryRgb}, 0.15)`);
        blobGrad1.addColorStop(0.7, `rgba(${primaryRgb}, 0.08)`);
        blobGrad1.addColorStop(1, `rgba(${primaryRgb}, 0)`);
        ctx.fillStyle = blobGrad1;
        ctx.fill();

        // --- Capa 2 (interna, mas solida) ---
        ctx.beginPath();
        const baseBlobRadius2 = 56;
        for (let i = 0; i <= numPoints; i++) {
          const angle = (i / numPoints) * 2 * Math.PI;

          let val = 0;
          if (dataArray && bufferLength > 0) {
            const freqBin = Math.floor((i % 4) / 4 * (bufferLength * 0.1));
            val = dataArray[freqBin] || 0;
          }

          const morph = ((val / 255.0) * 8) + Math.sin(time * 0.9 + i * 0.25) * 4;
          const r = baseBlobRadius2 + morph;

          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();

        const blobGrad2 = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, baseBlobRadius2 + 10
        );
        blobGrad2.addColorStop(0, `rgba(${primaryRgb}, 0.85)`);
        blobGrad2.addColorStop(0.6, `rgba(${primaryRgb}, 0.55)`);
        blobGrad2.addColorStop(1, `rgba(${primaryRgb}, 0.15)`);
        ctx.fillStyle = blobGrad2;
        ctx.fill();

        // Borde blanco con brillo sutil alrededor del blob
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.stroke();
      }

      // 4. Dibuja el contorno circular de la portada
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius - 1, 0, 2 * Math.PI);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = `rgba(${primaryRgb}, 0.2)`;
      ctx.stroke();
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyserNode, isPlaying, currentTrack]);

  /**
   * Muestra un toast temporal.
   * @param {string} msg - Mensaje a mostrar.
   * @param {"success"|"warning"} [type] - Tipo de alerta.
   * @returns {void}
   */
  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  /**
   * Maneja el feedback del usuario y notifica al padre.
   * @param {"positive"|"negative"} type - Tipo de feedback.
   * @returns {void}
   */
  const handleFeedbackClick = (type) => {
    if (type === 'positive') {
      showToast('¡Validado! Guardando sintonía óptima.', 'success');
      onFeedback('positive');
    } else {
      showToast('Ajustando algoritmo. Cargando nuevas frecuencias...', 'warning');
      onFeedback('negative');
    }
  };

  /**
   * Formatea segundos a mm:ss.
   * @param {number} secs - Segundos.
   * @returns {string}
   */
  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3 relative">

      {/* Botones flotantes: Estado Emocional y Temporizador */}
      <div className="position-absolute top-0 end-0 m-3 z-3 d-flex gap-2">
        {surveyData && (
          <button
            onClick={onShowEmotionalSummary}
            className="btn btn-light rounded-circle shadow d-flex align-items-center justify-content-center p-0"
            style={{ width: '46px', height: '46px', border: '1px solid rgba(0,0,0,0.08)' }}
            title="Resumen del Estado Emocional"
          >
            <span className="material-symbols-outlined notranslate text-primary filled" translate="no" style={{ fontSize: '22px' }}>
              psychology
            </span>
          </button>
        )}

        <button
          onClick={() => setShowTimerPanel(!showTimerPanel)}
          className={`btn ${isTimerRunning ? 'btn-primary animate-subtle-pulse' : 'btn-light'
            } rounded-circle shadow d-flex align-items-center justify-content-center p-0`}
          style={{ width: '46px', height: '46px', border: '1px solid rgba(0,0,0,0.08)' }}
          title="Temporizador de Sesión"
        >
          <span className={`material-symbols-outlined notranslate ${isTimerRunning ? 'filled text-white' : 'text-muted'}`} translate="no">
            schedule
          </span>
        </button>

        {showTimerPanel && (
          <div
            className="position-absolute end-0 mt-2 bg-white bg-opacity-95 backdrop-blur-md rounded-4 p-3 shadow-lg border border-light-subtle animate-fade-in-up"
            style={{ width: '280px', zIndex: 1000 }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="fw-bold text-dark small">Temporizador de Sesión</span>
              <button
                onClick={() => setShowTimerPanel(false)}
                className="btn btn-sm btn-link p-0 text-muted border-0"
              >
                <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: '18px' }}>close</span>
              </button>
            </div>

            {/* Display digital de cuenta regresiva */}
            <div className="text-center py-2 mb-2 bg-light rounded-3">
              <span className="fw-bold font-monospace text-dark d-block" style={{ fontSize: '24px' }}>
                {formatTime(timeLeft)}
              </span>
              <span className="text-uppercase text-muted" style={{ fontSize: '8px', letterSpacing: '0.5px' }}>
                {isTimerRunning ? 'Sesión en curso' : 'Pausado'}
              </span>
            </div>

            {/* Preajustes */}
            <div className="d-flex justify-content-between gap-1 mb-3">
              {[5, 15, 30, 45, 60].map((mins) => {
                const isSelected = timerDuration === mins;
                return (
                  <button
                    key={mins}
                    onClick={() => onSelectTimerPreset(mins)}
                    className={`btn btn-sm py-1 px-0 flex-grow-1 rounded-pill fw-semibold ${isSelected ? 'btn-primary text-white' : 'btn-light text-muted'
                      }`}
                    style={{ fontSize: '10px', border: 'none' }}
                  >
                    {mins}m
                  </button>
                );
              })}
            </div>

            {/* Botones de accion */}
            <div className="d-flex gap-2">
              <button
                onClick={onStartPauseTimer}
                className="btn btn-sm btn-primary flex-grow-1 py-1.5 rounded-pill fw-semibold d-flex align-items-center justify-content-center gap-1"
                style={{ fontSize: '11px' }}
              >
                <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: '14px' }}>
                  {isTimerRunning ? 'pause' : 'play_arrow'}
                </span>
                {isTimerRunning ? 'Pausar' : 'Iniciar'}
              </button>
              <button
                onClick={onResetTimer}
                className="btn btn-sm btn-outline-secondary flex-grow-1 py-1.5 rounded-pill fw-semibold d-flex align-items-center justify-content-center gap-1"
                style={{ fontSize: '11px' }}
              >
                <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: '14px' }}>replay</span>
                Reiniciar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notificacion toast (estilo Bootstrap) */}
      {toastMessage && (
        <div
          className={`position-fixed top-0 start-50 translate-middle-x mt-4 alert ${toastType === 'success' ? 'alert-success' : 'alert-warning'
            } shadow-sm rounded-pill px-4 py-2 z-3`}
          role="alert"
          style={{ transition: 'opacity 0.5s' }}
        >
          <div className="d-flex align-items-center gap-2">
            <span className="material-symbols-outlined notranslate filled" translate="no">
              {toastType === 'success' ? 'check_circle' : 'change_circle'}
            </span>
            <span className="fw-semibold" style={{ fontSize: '13px' }}>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Canvas principal */}
      {currentTrack ? (
        <div className="container-fluid max-w-[1050px] mx-auto">
          <div className="row justify-content-center align-items-center g-4">

            {/* Columna izquierda: visualizador y controles */}
            <div className="col-12 col-md-6 d-flex flex-column align-items-center">

              {/* Visualizador circular de arte */}
              <div
                className={`position-relative rounded-circle border border-2 border-white shadow-sm overflow-hidden d-flex align-items-center justify-content-center ${isPlaying && !isLoading ? 'animate-subtle-pulse' : ''
                  }`}
                style={{ width: '240px', height: '240px', background: isDefaultCover(currentTrack.cover) ? 'transparent' : '#eceef0' }}
              >
                {isLoading && (
                  <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex flex-column align-items-center justify-content-center z-3 p-2 text-center text-white">
                    <div className="spinner-border spinner-border-sm text-light mb-2" role="status" />
                    <span className="fw-semibold text-uppercase tracking-wider" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>
                      Modulando Frecuencias...
                    </span>
                  </div>
                )}
                {!isDefaultCover(currentTrack.cover) && (
                  <div
                    className="position-absolute w-100 h-100 bg-cover bg-center filter blur-sm opacity-25"
                    style={{ backgroundImage: `url('${currentTrack.cover}')`, backgroundSize: 'cover' }}
                  />
                )}

                {/* Visualizador en tiempo real con Web Audio */}
                <canvas
                  ref={canvasRef}
                  width="240"
                  height="240"
                  className="position-absolute top-0 start-0 w-100 h-100 z-1"
                />

                {/* Portada central dentro del anillo del visualizador */}
                <div
                  className="rounded-circle overflow-hidden position-relative z-2 d-flex align-items-center justify-content-center"
                  style={{
                    width: '145px',
                    height: '145px',
                    background: isDefaultCover(currentTrack.cover) ? 'transparent' : '#eceef0',
                    border: isDefaultCover(currentTrack.cover) ? 'none' : '1px solid rgba(255,255,255,0.25)',
                    boxShadow: isDefaultCover(currentTrack.cover) ? 'none' : 'inset 0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {!isDefaultCover(currentTrack.cover) ? (
                    <img src={currentTrack.cover} alt="" className="w-100 h-100 object-cover" />
                  ) : (
                    <span
                      className="material-symbols-outlined notranslate text-white select-none animate-subtle-pulse z-3" translate="no"
                      style={{
                        fontSize: '38px',
                        color: '#ffffff',
                        textShadow: '0 0 15px rgba(255,255,255,0.8), 0 0 30px var(--bs-primary)',
                        opacity: isPlaying ? 0.95 : 0.65,
                        transition: 'opacity 0.3s ease, text-shadow 0.3s ease'
                      }}
                    >
                      {getGenreIcon(currentTrack.genre)}
                    </span>
                  )}

                  {/* Spinner sutil cuando el audio esta en buffer */}
                  {isLoading && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-40 d-flex align-items-center justify-content-center">
                      <div className="spinner-border spinner-border-sm text-light" role="status" />
                    </div>
                  )}
                </div>
              </div>

              {/* Titulo y artista */}
              <div className="text-center mt-3 mb-2 w-100">
                <h4 className="h6 fw-bold mb-1 truncate px-3 text-on-surface">{currentTrack.title}</h4>
                <p className="text-muted small mb-1 truncate">{currentTrack.artist}</p>
              </div>

              {/* Botones de feedback colocados cerca de la canción que suena */}
              <div className="d-flex gap-2 mb-3 justify-content-center w-100 px-3 animate-fade-in-up" style={{ maxWidth: '280px' }}>
                <button
                  onClick={() => handleFeedbackClick('negative')}
                  className="btn btn-outline-secondary rounded-pill py-1.5 px-3 d-flex align-items-center justify-content-center gap-1.5 small fw-semibold flex-grow-1"
                  style={{ fontSize: '11px' }}
                >
                  <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: '15px' }}>thumb_down</span>
                  <span>No ayuda</span>
                </button>

                <button
                  onClick={() => handleFeedbackClick('positive')}
                  className="btn btn-primary-container rounded-pill py-1.5 px-3 d-flex align-items-center justify-content-center gap-1.5 small fw-semibold flex-grow-1"
                  style={{ fontSize: '11px' }}
                >
                  <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: '15px' }}>thumb_up</span>
                  <span>Me ayuda</span>
                </button>
              </div>

              {/* Slider de progreso */}
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

              {/* Estadisticas (barras de progreso) */}
              <div className="w-100 px-3 d-flex flex-column gap-2 mb-3">
                {/* Energia */}
                <div>
                  <div className="d-flex justify-content-between text-muted" style={{ fontSize: '11px' }}>
                    <span>Energía</span>
                    <span className="fw-semibold">{currentTrack.energy || 3}/10</span>
                  </div>
                  <div className="progress" style={{ height: '4px' }}>
                    <div className="progress-bar bg-primary" style={{ width: `${(currentTrack.energy || 3) * 10}%` }}></div>
                  </div>
                </div>

                {/* Valencia */}
                <div>
                  <div className="d-flex justify-content-between text-muted" style={{ fontSize: '11px' }}>
                    <span>Valencia</span>
                    <span className="fw-semibold">{currentTrack.valence || 7}/10</span>
                  </div>
                  <div className="progress" style={{ height: '4px' }}>
                    <div className="progress-bar bg-primary" style={{ width: `${(currentTrack.valence || 7) * 10}%` }}></div>
                  </div>
                </div>

                {/* Tempo */}
                <div>
                  <div className="d-flex justify-content-between text-muted" style={{ fontSize: '11px' }}>
                    <span>BPM (Tempo)</span>
                    <span className="fw-semibold">{currentTrack.bpm || 60} BPM</span>
                  </div>
                  <div className="progress" style={{ height: '4px' }}>
                    <div className="progress-bar bg-primary" style={{ width: `${((currentTrack.bpm || 60) / 160) * 100}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Controles */}
              <div className="d-flex align-items-center justify-content-center gap-3">
                <button
                  onClick={onPrev}
                  className="btn btn-light rounded-circle shadow-sm border-0 p-2 d-flex align-items-center justify-content-center"
                  style={{ width: '48px', height: '48px' }}
                >
                  <span className="material-symbols-outlined notranslate fs-4" translate="no">skip_previous</span>
                </button>

                <button
                  onClick={onPlayPause}
                  className="btn btn-primary rounded-circle shadow p-3 d-flex align-items-center justify-content-center"
                  style={{ width: '64px', height: '64px' }}
                >
                  <span className="material-symbols-outlined notranslate fs-3 filled" translate="no">
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>

                <button
                  onClick={onNext}
                  className="btn btn-light rounded-circle shadow-sm border-0 p-2 d-flex align-items-center justify-content-center"
                  style={{ width: '48px', height: '48px' }}
                >
                  <span className="material-symbols-outlined notranslate fs-4" translate="no">skip_next</span>
                </button>
              </div>

              {/* Modulador de volumen */}
              <div className="w-100 px-3 mt-4 mb-2 d-flex align-items-center gap-2 text-muted justify-content-center" style={{ maxWidth: '320px' }}>
                <span className="material-symbols-outlined notranslate select-none" translate="no" style={{ fontSize: '18px' }}>
                  {volume === 0 ? 'volume_off' : volume < 35 ? 'volume_down' : 'volume_up'}
                </span>
                <input
                  type="range"
                  className="form-range flex-grow-1"
                  min={0}
                  max={100}
                  value={volume}
                  onChange={(e) => onVolumeChange(Number(e.target.value))}
                  style={{ height: '4px' }}
                />
                <span className="fw-semibold" style={{ fontSize: '10px', width: '28px', textAlign: 'right' }}>
                  {volume}%
                </span>
              </div>
            </div>

            {/* Columna derecha: recomendaciones */}
            <div className="col-12 col-md-6 d-flex flex-column align-items-stretch">

              {/* Encabezado */}
              <h5 className="h6 text-uppercase text-muted fw-bold mb-3 text-center text-md-start tracking-wider">
                Selección Personalizada
              </h5>

              {/* Lista (Bootstrap sin bordes) */}
              <div className="list-group w-100 overflow-y-auto mb-2 px-1" style={{ maxHeight: '290px' }}>
                {tracks.map((track, index) => {
                  const isCurrent = index === currentIndex;

                  // Normaliza nombres de genero (corrige encoding)
                  let displayGenre = track.genre || 'Calma';
                  const genreLower = displayGenre.toLowerCase();
                  if (genreLower.includes('electr')) {
                    displayGenre = 'Electrónica';
                  } else if (genreLower.includes('class') || genreLower.includes('clás') || genreLower.includes('clas')) {
                    displayGenre = 'Clásica';
                  } else if (genreLower.includes('amb')) {
                    displayGenre = 'Ambient';
                  } else if (genreLower.includes('chill')) {
                    displayGenre = 'Chillout';
                  }

                  // Mapa de color segun energia emocional del genero
                  const tagColors = {
                    Ambient: 'bg-info-subtle text-info border border-info-subtle', // Calma/atmosferico (azul)
                    'Clásica': 'bg-success-subtle text-success border border-success-subtle', // Zen/restaurativo (verde)
                    Chillout: 'bg-warning-subtle text-warning border border-warning-subtle', // Calido/relajante (amarillo)
                    'Electrónica': 'bg-danger-subtle text-danger border border-danger-subtle', // Energia/foco (rojo)
                    Calma: 'bg-info-subtle text-info border border-info-subtle',
                    Foco: 'bg-warning-subtle text-warning border border-warning-subtle',
                    Zen: 'bg-success-subtle text-success border border-success-subtle'
                  };

                  return (
                    <button
                      key={track.id}
                      onClick={() => onSelectTrack(index)}
                      className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between border-0 rounded-4 mb-2 p-2 shadow-sm ${isCurrent
                          ? 'bg-primary-container border-start border-3 border-primary'
                          : 'bg-white'
                        }`}
                    >
                      <div className="d-flex align-items-center gap-2 min-w-0">
                        <div
                          className="position-relative overflow-hidden rounded shadow-sm flex-shrink-0 d-flex align-items-center justify-content-center"
                          style={{
                            width: '36px',
                            height: '36px',
                            background: isDefaultCover(track.cover)
                              ? (isCurrent ? 'var(--bs-primary)' : 'rgba(var(--bs-primary-rgb), 0.15)')
                              : '#eceef0'
                          }}
                        >
                          {!isDefaultCover(track.cover) ? (
                            <img src={track.cover} alt="" className="w-100 h-100 object-cover" />
                          ) : (
                            <span
                              className="material-symbols-outlined notranslate select-none" translate="no"
                              style={{
                                fontSize: '18px',
                                color: isCurrent ? '#ffffff' : 'var(--bs-primary)'
                              }}
                            >
                              {getGenreIcon(track.genre)}
                            </span>
                          )}
                          {isCurrent && !isDefaultCover(track.cover) && (
                            <div className="position-absolute top-0 start-0 w-100 h-100 bg-primary bg-opacity-25 d-flex align-items-center justify-content-center">
                              <span className="material-symbols-outlined notranslate text-white text-sm filled" translate="no">
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

                      <span className={`badge rounded-pill text-uppercase ${tagColors[displayGenre] || 'bg-light text-muted'}`} style={{ fontSize: '8px', letterSpacing: '0.5px' }}>
                        {displayGenre}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

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
