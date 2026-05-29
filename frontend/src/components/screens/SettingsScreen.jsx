import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import spotifyLogo from '../../assets/logos/Spotify_logo_without_text.svg';

const SettingsScreen = ({ 
  onNavigate, 
  onLogout, 
  targetEmotion = 'calma', 
  onEmotionChange, 
  themeMode = 'auto', 
  onThemeModeChange 
}) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('spotifyToken');
        if (token) {
          const response = await fetch('https://api.spotify.com/v1/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setUserProfile({
              name: data.display_name || 'Usuario de Spotify',
              email: data.email || '',
              photo: data.images?.[0]?.url || null,
              type: 'Spotify Premium'
            });
            setLoading(false);
            return;
          }
        }
        
        const cached = localStorage.getItem('userData');
        if (cached) {
          const u = JSON.parse(cached);
          setUserProfile({
            name: `${u.name || ''} ${u.last_name || ''}`.trim() || 'Usuario',
            email: u.email || '',
            photo: u.photo || null,
            type: 'Cuenta Local'
          });
          setLoading(false);
          return;
        }

        setUserProfile({
          name: 'Invitado',
          email: 'Sesión temporal sin sincronizar',
          photo: null,
          type: 'Invitado'
        });
      } catch (err) {
        console.error("Error al cargar perfil:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

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
      <div className="position-relative z-3 w-100 d-flex flex-column align-items-center p-2 animate-fade-in-up" style={{ maxWidth: '750px' }}>
        <header className="text-center mb-4">
          <h2 className="h4 text-dark fw-bold mb-2">
            Ajustes
          </h2>
          <p className="text-muted small">
            Configura tu cuenta y conexiones de música terapéutica.
          </p>
        </header>

        <div className="w-100 bg-white bg-opacity-75 backdrop-blur-sm rounded-4 p-4 border border-light-subtle shadow-sm d-flex flex-column gap-4">
          {/* Perfil del Usuario */}
          <div className="d-flex align-items-center gap-3 p-3 bg-light bg-opacity-50 rounded-3 border border-light-subtle">
            <div 
              className="rounded-circle bg-white d-flex align-items-center justify-content-center border border-light-subtle overflow-hidden shadow-sm"
              style={{ 
                width: '64px', 
                height: '64px', 
                backgroundPosition: 'center', 
                backgroundSize: 'cover',
                backgroundImage: userProfile?.photo ? `url(${userProfile.photo})` : 'none' 
              }}
            >
              {!userProfile?.photo && (
                <span className="material-symbols-outlined text-secondary opacity-70 fs-2">
                  person
                </span>
              )}
            </div>
            <div className="d-flex flex-column text-start">
              <span className="badge bg-primary text-white align-self-start mb-1" style={{ fontSize: '10px' }}>
                {userProfile?.type || 'Sesión'}
              </span>
              <h4 className="h6 text-dark fw-bold mb-0">
                {userProfile?.name || 'Cargando perfil...'}
              </h4>
              <p className="text-muted mb-0" style={{ fontSize: '11px' }}>
                {userProfile?.email || 'Sin correo electrónico'}
              </p>
            </div>
          </div>

          <hr className="border-secondary border-opacity-25 my-0" />

          <div className="d-flex flex-column gap-2">
            <h3 className="text-sm font-semibold text-uppercase text-secondary tracking-wider" style={{ fontSize: '12px' }}>
              Conexión de Música
            </h3>
            <p className="text-xs text-muted mb-2">
              Conecta tu cuenta de Spotify Premium para sintonizar pistas directo desde la base de datos de Spotify.
            </p>
            <Button
              onClick={handleSpotifyConnect}
              className="w-100 py-3"
              style={{ backgroundColor: '#1DB954', borderColor: '#1DB954', color: '#ffffff' }}
            >
              <span className="d-inline-flex align-items-center gap-2 justify-content-center">
                <img 
                  src={spotifyLogo} 
                  alt="Spotify Logo" 
                  style={{ width: '20px', height: '20px' }} 
                />
                <span>Conectar a Spotify</span>
              </span>
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

          <div className="d-flex flex-column gap-2">
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
              className="w-100 py-3 text-danger border-danger border-opacity-25 hover:bg-danger-subtle hover:text-danger"
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
