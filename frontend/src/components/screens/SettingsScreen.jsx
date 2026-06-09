import React, { useState, useEffect, useMemo } from 'react';
import Button from '../common/Button';
import CryptoJS from 'crypto-js';
import spotifyLogo from '../../assets/logos/Spotify_logo_without_text.svg';
import { apiCall } from '../../utils/fetch.js';

/* ─── Avatar generativo ─── */
const DynamicAvatar = ({ name, size = 40 }) => {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const colors = [
    'linear-gradient(135deg,#FF6B6B,#FF8E53)', 'linear-gradient(135deg,#4E54C8,#8F94FB)',
    'linear-gradient(135deg,#11998E,#38EF7D)', 'linear-gradient(135deg,#FC466B,#3F5EFB)',
    'linear-gradient(135deg,#f857a6,#ff5858)', 'linear-gradient(135deg,#1D976C,#93F9B9)',
    'linear-gradient(135deg,#8A2387,#E94057,#F27121)', 'linear-gradient(135deg,#00c6ff,#0072ff)',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return (
    <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white fw-bold"
      style={{ background: colors[Math.abs(hash) % colors.length], fontSize: size * 0.3, borderRadius: '50%' }}>
      {initials}
    </div>
  );
};

/* ─── Paleta de colores por índice de género ─── */
const GENRE_PALETTE = [
  { bar: 'linear-gradient(90deg,#4E54C8,#8F94FB)', dot: '#4E54C8' },
  { bar: 'linear-gradient(90deg,#FC466B,#f857a6)', dot: '#FC466B' },
  { bar: 'linear-gradient(90deg,#11998E,#38EF7D)', dot: '#11998E' },
  { bar: 'linear-gradient(90deg,#fd7e14,#ffc107)', dot: '#fd7e14' },
  { bar: 'linear-gradient(90deg,#8A2387,#E94057)', dot: '#8A2387' },
  { bar: 'linear-gradient(90deg,#00c6ff,#0072ff)', dot: '#0072ff' },
];

/* ─── Info del estado de Hawkins ─── */
const getHawkinsInfo = (freq) => {
  if (freq < 100) return { name: 'Apatía/Miedo', emoji: '😶', color: '#adb5bd' };
  if (freq < 200) return { name: 'Ira/Orgullo', emoji: '😠', color: '#ff6b6b' };
  if (freq < 310) return { name: 'Coraje', emoji: '💪', color: '#51cf66' };
  if (freq < 500) return { name: 'Voluntad/Paz', emoji: '🧘', color: '#0d6efd' };
  if (freq < 600) return { name: 'Amor/Alegría', emoji: '💙', color: '#fc5c7d' };
  return { name: 'Paz/Iluminación', emoji: '✨', color: '#a9e34b' };
};

const EMOTION_LABELS = ['Muy triste', 'Algo triste', 'Neutral', 'Algo feliz', 'Muy feliz'];

/* ═══════════════════════════════════════════════════════
   Componente principal: Ajustes
══════════════════════════════════════════════════════ */
const SettingsScreen = ({
  onNavigate,
  onLogout,
  targetEmotion = 'calma',
  onEmotionChange,
  themeMode = 'auto',
  onThemeModeChange,
  surveyData,
  selectedArtistsData = [],
}) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const spotifyToken = localStorage.getItem('spotifyToken');
        if (spotifyToken) {
          try {
            const data = await apiCall('spotify', '/me', 'GET');
            setUserProfile({
              name: data.display_name || 'Usuario de Spotify',
              email: data.email || '',
              photo: data.images?.[0]?.url || null,
              type: 'Spotify Premium'
            });
            setLoading(false);
            return;
          } catch (spotifyErr) {
            console.warn('⚠️ No se pudo cargar perfil de Spotify, usando local fallback:', spotifyErr.message);
          }
        }

        const localToken = localStorage.getItem('token');
        if (localToken) {
          try {
            // Siempre solicitar los datos frescos al backend porque localStorage al inicio de sesión puede estar incompleto
            const response = await apiCall('neuro', '/api/auth/me', 'GET');
            if (response && response.success && response.data) {
              const u = response.data;
              localStorage.setItem('user', JSON.stringify(u)); // Actualizar cache
              setUserProfile({
                name: `${u.name || ''} ${u.last_name || ''}`.trim() || 'Usuario',
                email: u.email || '',
                photo: u.photo || null,
                type: 'Cuenta Local'
              });
              setLoading(false);
              return;
            }
          } catch (apiErr) {
            console.error('Error al obtener perfil desde backend:', apiErr);
          }
        }

        // Fallback al cache si falla la red
        const cached = localStorage.getItem('user');
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

        setUserProfile({ name: 'Invitado', email: 'Sesión temporal sin sincronizar', photo: null, type: 'Invitado' });
      } catch (err) {
        console.error('Error general al cargar perfil:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSpotifyConnect = async () => {
    const clientId = 'f94cd594219c4d11abc5a2ab15472b9c';
    const redirectUri = 'http://127.0.0.1:5173/callback';
    const scopes = ['user-read-private', 'user-read-email', 'user-modify-playback-state', 'user-read-playback-state', 'streaming'].join(' ');

    const generateCodeVerifier = (length = 128) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
      const arr = new Uint8Array(length);
      crypto.getRandomValues(arr);
      return Array.from(arr).map(v => chars[v % chars.length]).join('');
    };

    const generateCodeChallenge = async (verifier) => {
      const hash = CryptoJS.SHA256(verifier);
      const base64 = CryptoJS.enc.Base64.stringify(hash);
      return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    };

    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem('spotifyCodeVerifier', verifier);

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: scopes,
      code_challenge_method: 'S256',
      code_challenge: challenge,
      show_dialog: 'false'
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params}`;
  };

  return (
    <div className="w-100 py-3 d-flex flex-column align-items-center justify-content-center">
      <div className="position-relative z-3 w-100 d-flex flex-column align-items-center p-2 animate-fade-in-up" style={{ maxWidth: '750px' }}>
        <header className="text-center mb-4">
          <h2 className="h4 text-dark fw-bold mb-2">Ajustes</h2>
          <p className="text-muted small">Configura tu cuenta y conexiones de música terapéutica.</p>
        </header>

        <div className="w-100 d-flex flex-column gap-3">

          {/* ══ 1. PERFIL DE USUARIO ══ */}
          <div className="bg-white bg-opacity-75 rounded-4 p-4 border border-light-subtle shadow-sm">
            {/* Identidad */}
            <div className="d-flex align-items-center gap-3 mb-4">
              <div
                className="rounded-circle bg-white d-flex align-items-center justify-content-center border border-light-subtle overflow-hidden shadow-sm flex-shrink-0"
                style={{
                  width: '56px', height: '56px',
                  backgroundImage: userProfile?.photo ? `url(${userProfile.photo})` : 'none',
                  backgroundSize: 'cover', backgroundPosition: 'center'
                }}
              >
                {!userProfile?.photo && (
                  <span className="material-symbols-outlined notranslate text-secondary opacity-70 fs-3" translate="no">person</span>
                )}
              </div>
              <div>
                <span className="badge bg-primary text-white mb-1" style={{ fontSize: '10px' }}>{userProfile?.type || 'Sesión'}</span>
                <h4 className="h6 text-dark fw-bold mb-0">{userProfile?.name || 'Cargando...'}</h4>
                <p className="text-muted mb-0" style={{ fontSize: '11px' }}>{userProfile?.email}</p>
              </div>
            </div>


          </div>

          {/* ══ 2. CONEXIÓN SPOTIFY ══ */}
          <div className="bg-white bg-opacity-75 rounded-4 p-4 border border-light-subtle shadow-sm">
            <h3 className="text-uppercase text-secondary fw-semibold mb-1" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
              Conexión de Música
            </h3>
            <p className="text-muted mb-3" style={{ fontSize: '12px' }}>
              Conecta tu cuenta de Spotify Premium para sintonizar pistas directo desde su base de datos.
            </p>
            {localStorage.getItem('spotifyToken') ? (
              <div className="w-100 py-3 rounded text-center" style={{ backgroundColor: 'rgba(29, 185, 84, 0.1)', border: '1px solid #1DB954' }}>
                <span className="d-inline-flex align-items-center gap-2 justify-content-center text-success fw-bold">
                  <img src={spotifyLogo} alt="Spotify Logo" style={{ width: '20px', height: '20px' }} />
                  <span>Spotify Conectado</span>
                  <span className="material-symbols-outlined fs-5" translate="no">check_circle</span>
                </span>
              </div>
            ) : (
              <Button onClick={handleSpotifyConnect} className="w-100 py-3"
                style={{ backgroundColor: '#1DB954', borderColor: '#1DB954', color: '#ffffff' }}>
                <span className="d-inline-flex align-items-center gap-2 justify-content-center">
                  <img src={spotifyLogo} alt="Spotify Logo" style={{ width: '20px', height: '20px' }} />
                  <span>Conectar a Spotify</span>
                </span>
              </Button>
            )}
          </div>

          {/* ══ 3. FOCO VISUAL ══ */}
          <div className="bg-white bg-opacity-75 rounded-4 p-4 border border-light-subtle shadow-sm">
            <h3 className="text-uppercase text-secondary fw-semibold mb-1" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
              Foco Visual y Tema
            </h3>
            <p className="text-muted mb-3" style={{ fontSize: '12px' }}>
              Sincroniza los colores del fondo automáticamente con la canción activa o fija una emoción.
            </p>

            <div className="btn-group w-100 mb-3" role="group">
              <button type="button"
                className={`btn btn-sm py-2 ${themeMode === 'auto' ? 'btn-primary text-white shadow-sm' : 'btn-outline-primary'}`}
                onClick={() => onThemeModeChange('auto')}>
                Automático (Música)
              </button>
              <button type="button"
                className={`btn btn-sm py-2 ${themeMode === 'manual' ? 'btn-primary text-white shadow-sm' : 'btn-outline-primary'}`}
                onClick={() => onThemeModeChange('manual')}>
                Manual (Fijar Foco)
              </button>
            </div>

            {themeMode === 'manual' && (
              <div className="d-flex justify-content-between gap-2">
                {[
                  { id: 'calma', name: 'Calma', color: '#0d6efd' },
                  { id: 'relajacion', name: 'Relajación', color: '#198754' },
                  { id: 'foco', name: 'Foco', color: '#fd7e14' },
                  { id: 'zen', name: 'Zen', color: '#6f42c1' },
                ].map(emo => {
                  const isSel = targetEmotion === emo.id;
                  return (
                    <button key={emo.id} type="button"
                      onClick={() => onEmotionChange(emo.id)}
                      className={`btn btn-sm flex-grow-1 text-white border-0 py-2 ${isSel ? 'shadow fw-bold' : 'opacity-75'}`}
                      style={{ backgroundColor: emo.color, fontSize: '11px', borderRadius: '8px' }}>
                      {emo.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ══ 4. SESIÓN ══ */}
          <div className="bg-white bg-opacity-75 rounded-4 p-4 border border-light-subtle shadow-sm">
            <h3 className="text-uppercase text-secondary fw-semibold mb-1" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
              Sesión
            </h3>
            <p className="text-muted mb-3" style={{ fontSize: '12px' }}>Cierra tu sesión actual para salir del sistema.</p>
            <Button variant="outline" icon="logout" onClick={onLogout}
              className="w-100 py-3 text-danger border-danger border-opacity-25">
              Cerrar Sesión
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
