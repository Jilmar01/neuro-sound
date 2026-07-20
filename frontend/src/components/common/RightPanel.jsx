import React, { useState, useEffect } from 'react';

/**
 * Indica si la portada es generica o no existe.
 */
const isDefaultCover = (url) => {
  return !url || url.includes('lh3.googleusercontent.com') || url.includes('defaultcover.png');
};

/**
 * Devuelve el icono segun el genero musical.
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

const RightPanel = ({
  isOpen,
  onClose,
  tracks = [],
  currentIndex = 0,
  currentTrack,
  isPlaying,
  onSelectTrack,
  onFeedbackClickGlobal
}) => {
  const [coversMap, setCoversMap] = useState({});

  console.log("RightPanel Rendered. isOpen:", isOpen, "tracks count:", tracks.length);

  // Buscador de portadas en segundo plano igual que en Dashboard
  useEffect(() => {
    if (!isOpen) return;
    tracks.forEach(track => {
      if (isDefaultCover(track.cover) && coversMap[track.id] === undefined) {
        setCoversMap(prev => ({ ...prev, [track.id]: 'pending' }));
        const query = encodeURIComponent(`${track.artist} ${track.title}`);
        fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`)
          .then(res => res.json())
          .then(data => {
            if (data.results && data.results.length > 0) {
              const highResUrl = data.results[0].artworkUrl100.replace('100x100bb', '500x500bb');
              setCoversMap(prev => ({ ...prev, [track.id]: highResUrl }));
            } else {
              setCoversMap(prev => ({ ...prev, [track.id]: 'not_found' }));
            }
          })
          .catch(() => setCoversMap(prev => ({ ...prev, [track.id]: 'not_found' })));
      }
    });
  }, [tracks, isOpen]);

  const getDisplayCover = (track) => {
    if (!track) return '';
    const fetchedCover = coversMap[track.id];
    if (fetchedCover && fetchedCover !== 'pending' && fetchedCover !== 'not_found') {
      return fetchedCover;
    }
    return track.cover || '';
  };

  return (
    <>
      <style>{`
        /* Animaciones y Posicionamiento de offcanvas personalizado (TEMA BLANCO) */
        .right-panel-sheet {
          position: fixed !important;
          background: rgba(255, 255, 255, 0.75) !important;
          backdrop-filter: blur(25px) !important;
          -webkit-backdrop-filter: blur(25px) !important;
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
          z-index: 1060 !important;
          transition: transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
          display: flex !important;
          flex-direction: column !important;
          color: #212529 !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08) !important;
        }

        /* DISEÑO ESCRITORIO (Lado Derecho) */
        @media (min-width: 768px) {
          .right-panel-sheet {
            top: 0 !important;
            right: 0 !important;
            width: 370px !important;
            height: 100vh !important;
            border-top: none !important;
            border-bottom: none !important;
            border-right: none !important;
            transform: translateX(100%) !important;
          }
          .right-panel-sheet.show {
            transform: translateX(0) !important;
          }
        }

        /* DISEÑO MÓVIL (Bottom Sheet estilo Spotify) */
        @media (max-width: 767.98px) {
          .right-panel-sheet {
            bottom: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 82vh !important;
            border-left: none !important;
            border-right: none !important;
            border-bottom: none !important;
            border-radius: 28px 28px 0 0 !important;
            transform: translateY(100%) !important;
          }
          .right-panel-sheet.show {
            transform: translateY(0) !important;
          }
        }

        /* Indicador táctil superior para deslizar/cerrar en móviles */
        .sheet-drag-handle {
          width: 44px;
          height: 5px;
          background: rgba(0, 0, 0, 0.12);
          border-radius: 9999px;
          margin: 12px auto 6px auto;
          cursor: pointer;
        }

        /* Estilo de Tarjetas tipo Spotify pero Blanco */
        .spotify-style-card {
          background: rgba(255, 255, 255, 0.55) !important;
          border: 1px solid rgba(0, 0, 0, 0.05) !important;
          border-radius: 16px !important;
          padding: 16px !important;
          transition: background 0.2s ease !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02) !important;
        }
        .spotify-style-card:hover {
          background: rgba(255, 255, 255, 0.75) !important;
        }

        /* Barra de progreso de métricas en modo claro */
        .metric-progress-track {
          background: rgba(0, 0, 0, 0.06) !important;
          height: 6px !important;
        }
        .metric-progress-fill {
          background: var(--bs-primary) !important;
          box-shadow: 0 0 8px rgba(var(--bs-primary-rgb), 0.25) !important;
        }
        
        /* Efecto hover sobre lista de cola */
        .queue-item-btn {
          background: transparent !important;
          color: #212529 !important;
          border: none !important;
          transition: background 0.2s ease, transform 0.1s ease !important;
        }
        .queue-item-btn:hover {
          background: rgba(0, 0, 0, 0.03) !important;
          transform: translateY(-1px);
        }
        .queue-item-btn:active {
          transform: translateY(1px);
        }

        /* Scrollbar del listado */
        .dark-panel-scroll::-webkit-scrollbar {
          width: 4px !important;
        }
        .dark-panel-scroll::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1) !important;
          border-radius: 9999px !important;
        }
      `}</style>

      <div 
        className={`right-panel-sheet ${isOpen ? 'show' : ''}`}
        style={{ visibility: isOpen ? 'visible' : 'hidden' }}
      >
        {/* Manejador de arrastre para móviles */}
        <div className="sheet-drag-handle d-md-none" onClick={onClose} />

        {/* Cabecera del Panel */}
        <div className="d-flex align-items-center justify-content-between px-3 pt-2 pb-3 border-bottom border-black border-opacity-10">
          <h5 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark" style={{ fontSize: '16px' }}>
            <span className="material-symbols-outlined notranslate text-primary" translate="no">queue_music</span>
            Reproducción Actual
          </h5>
          <button 
            type="button" 
            className="btn p-1 border-0 bg-transparent d-flex align-items-center justify-content-center text-dark text-opacity-75 hover-text-dark"
            onClick={onClose}
            style={{ width: '32px', height: '32px' }}
          >
            <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {/* Cuerpo del Panel */}
        <div className="d-flex flex-column gap-3 p-3 overflow-auto dark-panel-scroll flex-grow-1">
          
          {/* TARJETA 1: Métricas de Frecuencia (Estilo Spotify Claro) */}
          {currentTrack && (
            <div className="spotify-style-card">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="material-symbols-outlined notranslate text-primary" translate="no" style={{ fontSize: '18px' }}>
                  graphic_eq
                </span>
                <span className="text-uppercase fw-bold font-monospace text-muted" style={{ fontSize: '10px', letterSpacing: '1px' }}>
                  Métricas de Frecuencia
                </span>
              </div>

              <div className="d-flex flex-column gap-3">
                {/* Energia */}
                <div>
                  <div className="d-flex justify-content-between text-muted mb-1" style={{ fontSize: '11px' }}>
                    <span>Energía</span>
                    <span className="fw-semibold text-dark">{currentTrack.energy}</span>
                  </div>
                  <div className="progress metric-progress-track rounded-pill" style={{ height: '6px' }}>
                    <div className="progress-bar metric-progress-fill rounded-pill" style={{ width: `${currentTrack.energy * 100}%` }}></div>
                  </div>
                </div>

                {/* Valencia */}
                <div>
                  <div className="d-flex justify-content-between text-muted mb-1" style={{ fontSize: '11px' }}>
                    <span>Valencia</span>
                    <span className="fw-semibold text-dark">{currentTrack.valence}</span>
                  </div>
                  <div className="progress metric-progress-track rounded-pill" style={{ height: '6px' }}>
                    <div className="progress-bar metric-progress-fill rounded-pill" style={{ width: `${currentTrack.valence * 100}%` }}></div>
                  </div>
                </div>

                {/* Tempo */}
                <div>
                  <div className="d-flex justify-content-between text-muted mb-1" style={{ fontSize: '11px' }}>
                    <span>Tempo (BPM)</span>
                    <span className="fw-semibold text-dark">{currentTrack.tempo}</span>
                  </div>
                  <div className="progress metric-progress-track rounded-pill" style={{ height: '6px' }}>
                    <div className="progress-bar metric-progress-fill rounded-pill" style={{ width: `${(currentTrack.tempo / 160) * 100}%` }}></div>
                  </div>
                </div>

                {/* Feedback Thumbs (Me gusta / No me gusta) */}
                <div className="d-flex align-items-center justify-content-center gap-3 border-top pt-3 mt-1">
                  <button
                    onClick={() => onFeedbackClickGlobal('negative')}
                    className={`btn btn-outline-danger d-flex align-items-center gap-2 rounded-pill px-3 py-2 fw-semibold`}
                    style={{ fontSize: '12px', opacity: currentTrack.feedback === null ? 1 : 0.6 }}
                  >
                    <span className={`material-symbols-outlined notranslate ${currentTrack.feedback === null ? 'filled' : ''}`} translate="no" style={{ fontSize: '18px' }}>
                      thumb_down
                    </span>
                    No ayuda
                  </button>
                  
                  <button
                    onClick={() => onFeedbackClickGlobal('positive')}
                    className={`btn btn-outline-success d-flex align-items-center gap-2 rounded-pill px-3 py-2 fw-semibold`}
                    style={{ fontSize: '12px', opacity: currentTrack.feedback === true ? 1 : 0.6 }}
                  >
                    <span className={`material-symbols-outlined notranslate ${currentTrack.feedback === true ? 'filled' : ''}`} translate="no" style={{ fontSize: '18px' }}>
                      thumb_up
                    </span>
                    Me ayuda
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TARJETA 2: Selección Personalizada / Lista Completa */}
          <div className="spotify-style-card d-flex flex-column gap-2 flex-grow-1 min-h-[250px]">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="material-symbols-outlined notranslate text-primary" translate="no" style={{ fontSize: '18px' }}>
                playlist_play
              </span>
              <span className="text-uppercase fw-bold font-monospace text-muted" style={{ fontSize: '10px', letterSpacing: '1px' }}>
                Selección Personalizada ({tracks.length})
              </span>
            </div>

            <div className="d-flex flex-column gap-1 overflow-auto dark-panel-scroll pe-1">
              {tracks.length > 0 ? tracks.map((track, idx) => {
                const trackCover = getDisplayCover(track);
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={track.id + idx}
                    onClick={() => {
                      onSelectTrack(idx);
                      if (window.innerWidth < 768) {
                        onClose();
                      }
                    }}
                    className={`queue-item-btn d-flex align-items-center gap-3 rounded-3 p-2 text-start w-100 ${isCurrent ? 'active-track' : ''}`}
                    style={{
                      borderLeft: isCurrent ? '3px solid var(--bs-primary)' : 'none',
                      background: isCurrent ? 'rgba(var(--bs-primary-rgb), 0.08)' : 'transparent',
                      paddingLeft: isCurrent ? '13px' : '16px'
                    }}
                  >
                    <div
                      className="position-relative overflow-hidden rounded shadow-sm flex-shrink-0 d-flex align-items-center justify-content-center"
                      style={{
                        width: '40px',
                        height: '40px',
                        background: isDefaultCover(trackCover) ? 'rgba(var(--bs-primary-rgb), 0.1)' : '#eceef0'
                      }}
                    >
                      {!isDefaultCover(trackCover) ? (
                        <img src={trackCover} alt="" className="w-100 h-100 object-cover" />
                      ) : (
                        <span
                          className={`material-symbols-outlined notranslate select-none ${isCurrent ? 'text-primary' : 'text-secondary'}`} translate="no"
                          style={{ fontSize: '20px' }}
                        >
                          {getGenreIcon(track.genre)}
                        </span>
                      )}
                      {isCurrent && (
                        <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-10 d-flex align-items-center justify-content-center">
                          <span className="material-symbols-outlined notranslate text-primary text-sm filled" translate="no" style={{ fontSize: '14px' }}>
                            {isPlaying ? 'volume_up' : 'play_arrow'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-start min-w-0 flex-grow-1">
                      <p className={`mb-0 fw-semibold text-truncate ${isCurrent ? 'text-primary' : 'text-dark'}`} style={{ fontSize: '12.5px' }}>
                        {track.title}
                      </p>
                      <p className="mb-0 text-muted text-truncate" style={{ fontSize: '10.5px', marginTop: '1px' }}>
                        {track.artist}
                      </p>
                    </div>

                    {isCurrent && (
                      <span className="badge bg-primary text-white rounded-pill ms-auto" style={{ fontSize: '8px', fontWeight: 600 }}>
                        Sonando
                      </span>
                    )}
                  </button>
                );
              }) : (
                <div className="text-center py-5 text-muted small">
                  No hay canciones en la lista.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
      
      {/* Backdrop de fondo */}
      {isOpen && (
        <div 
          className="offcanvas-backdrop fade show" 
          onClick={onClose}
          style={{ zIndex: 1055, background: 'rgba(0, 0, 0, 0.25)', backdropFilter: 'blur(1.5px)', WebkitBackdropFilter: 'blur(1.5px)' }}
        ></div>
      )}
    </>
  );
};

export default RightPanel;
