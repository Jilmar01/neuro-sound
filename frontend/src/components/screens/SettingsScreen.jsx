import React from 'react';
import Button from '../common/Button';

const SettingsScreen = ({ 
  onNavigate, 
  onLogout, 
  targetEmotion = 'calma', 
  onEmotionChange, 
  themeMode = 'auto', 
  onThemeModeChange 
}) => {
  const handleSpotifyConnect = () => {
    // Redirect to Spotify OAuth or simulate connection
    const clientId = 'f5e7f1f0a25642a8a1d7f57561f7db91'; // Replace or read from config
    const redirectUri = window.location.origin + '/';
    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-modify-playback-state',
      'user-read-playback-state'
    ].join(' ');

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
    window.location.href = authUrl;
  };



  return (
    <div className="w-100 py-3 d-flex flex-column align-items-center justify-content-center">
      {/* Main Content Card */}
      <div className="relative z-10 w-full max-w-[600px] flex flex-col items-center p-4 animate-fade-in-up">
        <header className="text-center mb-6">
          <h2 className="font-display-lg-mobile text-display-lg-mobile text-on-surface font-semibold mb-2">
            Ajustes
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Configura tu cuenta y conexiones de música terapéutica.
          </p>
        </header>

        <div className="w-full bg-white bg-opacity-75 backdrop-blur-sm rounded-4 p-5 border border-light-subtle shadow-sm d-flex flex-column gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold font-label-sm text-outline uppercase tracking-wider">
              Conexión de Música
            </h3>
            <p className="text-xs text-on-surface-variant mb-2">
              Conecta tu cuenta de Spotify Premium para sintonizar pistas directo desde la base de datos de Spotify.
            </p>
            <Button
              variant="secondary"
              icon="swap_horizontal_circle"
              onClick={handleSpotifyConnect}
              className="w-full py-4"
            >
              Conectar a Spotify
            </Button>
          </div>

          <hr className="border-secondary border-opacity-25" />

          {/* Theme Selector Widget */}
          <div className="d-flex flex-column gap-2">
            <h3 className="text-sm font-semibold text-uppercase text-secondary tracking-wider" style={{ fontSize: '12px' }}>
              Foco Visual y Tema
            </h3>
            <p className="text-xs text-muted mb-2">
              Sincroniza los colores del fondo automáticamente con la canción activa o fija una emoción.
            </p>
            
            <div className="btn-group w-100 mb-3" role="group">
              <button
                type="button"
                className={`btn btn-sm py-2 ${themeMode === 'auto' ? 'btn-primary text-white shadow-sm' : 'btn-outline-primary'}`}
                onClick={() => onThemeModeChange('auto')}
              >
                Automático (Música)
              </button>
              <button
                type="button"
                className={`btn btn-sm py-2 ${themeMode === 'manual' ? 'btn-primary text-white shadow-sm' : 'btn-outline-primary'}`}
                onClick={() => onThemeModeChange('manual')}
              >
                Manual (Fijar Foco)
              </button>
            </div>

            {themeMode === 'manual' && (
              <div className="d-flex justify-content-between gap-2">
                {[
                  { id: 'calma', name: 'Calma', color: '#0d6efd' },
                  { id: 'relajacion', name: 'Relajación', color: '#198754' },
                  { id: 'foco', name: 'Foco', color: '#fd7e14' },
                  { id: 'zen', name: 'Zen', color: '#6f42c1' }
                ].map((emo) => {
                  const isSel = targetEmotion === emo.id;
                  return (
                    <button
                      key={emo.id}
                      type="button"
                      onClick={() => onEmotionChange(emo.id)}
                      className={`btn btn-sm flex-grow-1 text-white border-0 py-2.5 ${isSel ? 'shadow font-bold scale-105' : 'opacity-75'}`}
                      style={{ backgroundColor: emo.color, fontSize: '11px', borderRadius: '8px' }}
                    >
                      {emo.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <hr className="border-secondary border-opacity-25" />

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-uppercase text-secondary tracking-wider" style={{ fontSize: '12px' }}>
              Sesión
            </h3>
            <p className="text-xs text-muted mb-2">
              Cierra tu sesión actual para salir del sistema.
            </p>
            <Button
              variant="outline"
              icon="logout"
              onClick={onLogout}
              className="w-full py-3.5 text-danger border-danger border-opacity-25 hover:bg-danger-subtle hover:text-danger"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
