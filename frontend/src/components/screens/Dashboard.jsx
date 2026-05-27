import React, { useState } from 'react';
import Button from '../common/Button';

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
  onFeedback
}) => {
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  const currentTrack = tracks[currentIndex] || null;

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
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
    <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3 relative">
      
      {/* Toast Notification (Bootstrap style alert) */}
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

      {/* Main Canvas */}
      {currentTrack ? (
        <div className="container-fluid max-w-[1050px] mx-auto">
          <div className="row justify-content-center align-items-center g-4">
            
            {/* Left Column: Music Visualizer & Main Controls */}
            <div className="col-12 col-md-6 d-flex flex-column align-items-center">
              
              {/* Art Circle Visualizer */}
              <div 
                className={`position-relative rounded-circle border border-2 border-white shadow-sm overflow-hidden d-flex align-items-center justify-content-center ${
                  isPlaying ? 'animate-subtle-pulse' : ''
                }`}
                style={{ width: '200px', height: '200px', background: '#eceef0' }}
              >
                <div 
                  className="position-absolute w-100 h-100 bg-cover bg-center filter blur-sm opacity-25"
                  style={{ backgroundImage: `url('${currentTrack.cover}')`, backgroundSize: 'cover' }}
                />
                
                {/* Core cover image */}
                <div 
                  className="rounded-circle overflow-hidden position-relative border shadow-inner z-1" 
                  style={{ width: '150px', height: '150px' }}
                >
                  <img src={currentTrack.cover} alt="" className="w-100 h-100 object-cover" />
                  
                  {/* Playing animated bars */}
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
                <h4 className="h6 fw-bold mb-1 truncate px-3 text-on-surface">{currentTrack.title}</h4>
                <p className="text-muted small mb-0 truncate">{currentTrack.artist}</p>
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

              {/* Vector Stats (Bootstrap progress bars) */}
              <div className="w-100 px-3 d-flex flex-column gap-2 mb-3">
                {/* Energy */}
                <div>
                  <div className="d-flex justify-content-between text-muted" style={{ fontSize: '11px' }}>
                    <span>Energía</span>
                    <span className="fw-semibold">{currentTrack.energy || 3}/10</span>
                  </div>
                  <div className="progress" style={{ height: '4px' }}>
                    <div className="progress-bar bg-primary" style={{ width: `${(currentTrack.energy || 3) * 10}%` }}></div>
                  </div>
                </div>

                {/* Valence */}
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

              {/* Controls */}
              <div className="d-flex align-items-center justify-content-center gap-3">
                <button 
                  onClick={onPrev}
                  className="btn btn-light rounded-circle shadow-sm border-0 p-2 d-flex align-items-center justify-content-center"
                  style={{ width: '40px', height: '40px' }}
                >
                  <span className="material-symbols-outlined fs-5">skip_previous</span>
                </button>
                
                <button 
                  onClick={onPlayPause}
                  className="btn btn-primary rounded-circle shadow p-3 d-flex align-items-center justify-content-center"
                  style={{ width: '56px', height: '56px' }}
                >
                  <span className="material-symbols-outlined fs-4 filled">
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                
                <button 
                  onClick={onNext}
                  className="btn btn-light rounded-circle shadow-sm border-0 p-2 d-flex align-items-center justify-content-center"
                  style={{ width: '40px', height: '40px' }}
                >
                  <span className="material-symbols-outlined fs-5">skip_next</span>
                </button>
              </div>
            </div>

            {/* Right Column: Playlist Recommendations */}
            <div className="col-12 col-md-6 d-flex flex-column align-items-stretch">
              
              {/* Header */}
              <h5 className="h6 text-uppercase text-muted fw-bold mb-3 text-center text-md-start tracking-wider">
                Selección Personalizada
              </h5>

              {/* List group (Clean Bootstrap border-0 list items) */}
              <div className="list-group w-100 overflow-y-auto mb-4 px-1" style={{ maxHeight: '230px' }}>
                {tracks.map((track, index) => {
                  const isCurrent = index === currentIndex;
                  const tagColors = {
                    Calma: 'bg-info-subtle text-info',
                    Foco: 'bg-warning-subtle text-warning',
                    Zen: 'bg-success-subtle text-success'
                  };

                  return (
                    <button 
                      key={track.id}
                      onClick={() => onSelectTrack(index)}
                      className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between border-0 rounded-4 mb-2 p-2 shadow-sm ${
                        isCurrent 
                          ? 'bg-primary-container border-start border-3 border-primary' 
                          : 'bg-white'
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

                      <span className={`badge rounded-pill text-uppercase ${tagColors[track.genre || 'Calma'] || 'bg-light text-muted'}`} style={{ fontSize: '8px' }}>
                        {track.genre || 'Calma'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback Buttons */}
              <div className="d-flex gap-2 w-100">
                <button 
                  onClick={() => handleFeedbackClick('negative')}
                  className="btn btn-outline-secondary rounded-pill py-2.5 flex-grow-1 d-flex align-items-center justify-content-center gap-1.5 small fw-semibold"
                  style={{ fontSize: '12px' }}
                >
                  <span className="material-symbols-outlined fs-6">thumb_down</span>
                  <span>No ayuda</span>
                </button>
                
                <button 
                  onClick={() => handleFeedbackClick('positive')}
                  className="btn btn-primary-container rounded-pill py-2.5 flex-grow-1 d-flex align-items-center justify-content-center gap-1.5 small fw-semibold"
                  style={{ fontSize: '12px' }}
                >
                  <span className="material-symbols-outlined fs-6">thumb_up</span>
                  <span>Me ayuda</span>
                </button>
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
