import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import Onboarding from './components/screens/Onboarding';
import InitialSurvey from './components/screens/InitialSurvey';
import ArtistSurvey from './components/screens/ArtistSurvey';
import CalibrationScreen from './components/screens/CalibrationScreen';
import ProfileSummaryScreen from './components/screens/ProfileSummaryScreen';
import Dashboard from './components/screens/Dashboard';
import FinalSurvey from './components/screens/FinalSurvey';
import SettingsScreen from './components/screens/SettingsScreen';
import Sidebar from './components/common/Sidebar';
import MouseGradient from './components/common/MouseGradient';
import { generateHybridPlaylist, processTrackOnDemand, mapSurveyToBackendPayload, registerOrUpdateSurvey } from './engine/NECv2.js';
import { apiCall } from './utils/fetch.js';
import SpotifyPlayerWrapper from './utils/spotifyPlayer.js';
import Slider from './components/common/Slider';

// Redirigir de forma transparente las claves de sesión de localStorage a sessionStorage
const keysToSession = ['token', 'spotifyToken', 'spotifyRefreshToken', 'user', 'userData', 'userCached'];

const originalGetItem = Storage.prototype.getItem;
const originalSetItem = Storage.prototype.setItem;
const originalRemoveItem = Storage.prototype.removeItem;

Storage.prototype.getItem = function (key) {
  if (this === window.localStorage && keysToSession.includes(key)) {
    return sessionStorage.getItem(key);
  }
  return originalGetItem.call(this, key);
};

Storage.prototype.setItem = function (key, value) {
  if (this === window.localStorage && keysToSession.includes(key)) {
    return sessionStorage.setItem(key, value);
  }
  return originalSetItem.call(this, key, value);
};

Storage.prototype.removeItem = function (key) {
  if (this === window.localStorage && keysToSession.includes(key)) {
    return sessionStorage.removeItem(key);
  }
  return originalRemoveItem.call(this, key);
};

// Limpieza de caché, almacenamiento local/sesión y cookies residuales al iniciar la aplicación
// Solo si NO hay una sesión activa en sessionStorage (evita desloguear al usuario en F5)
const hasActiveSession = sessionStorage.getItem('token') || sessionStorage.getItem('spotifyToken');

if (!hasActiveSession) {
  try {
    console.log("🧹 Iniciando la aplicación. Limpiando almacenamiento y cachés residuales...");
    localStorage.clear();
    sessionStorage.clear();
  } catch (e) {
    console.error("Error al limpiar storage en inicio:", e);
  }

  try {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name.trim() + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
      document.cookie = name.trim() + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
  } catch (e) {
    console.error("Error al limpiar cookies en inicio:", e);
  }

  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      caches.keys().then((names) => {
        for (let name of names) {
          caches.delete(name);
        }
      });
    } catch (e) {
      console.error("Error al limpiar caché en inicio:", e);
    }
  }
} else {
  console.log("🔄 Sesión activa detectada en sessionStorage. Preservando estado en F5.");
}

// Mapa de temas visuales por emocion/estado.
const emotionThemes = {
  gris: {
    primary: '#6c757d',
    primaryRgb: '108, 117, 125',
    bgSubtle: '#eef2f3',
    borderSubtle: '#d5dbdb',
    glow1: 'rgba(108, 117, 125, 0.2)',
    glow2: 'rgba(108, 117, 125, 0.08)'
  },
  calma: {
    primary: '#0d6efd',
    primaryRgb: '13, 110, 253',
    bgSubtle: '#e7f2fd',
    borderSubtle: '#b0d4fd',
    glow1: 'rgba(13, 110, 253, 0.25)',
    glow2: 'rgba(13, 110, 253, 0.1)'
  },
  relajacion: {
    primary: '#198754',
    primaryRgb: '25, 135, 84',
    bgSubtle: '#e8f5e9',
    borderSubtle: '#a3cfbb',
    glow1: 'rgba(25, 135, 84, 0.25)',
    glow2: 'rgba(25, 135, 84, 0.1)'
  },
  foco: {
    primary: '#fd7e14',
    primaryRgb: '253, 126, 20',
    bgSubtle: '#fff3cd',
    borderSubtle: '#ffe69c',
    glow1: 'rgba(253, 126, 20, 0.25)',
    glow2: 'rgba(253, 126, 20, 0.1)'
  },
  zen: {
    primary: '#6f42c1',
    primaryRgb: '111, 66, 193',
    bgSubtle: '#f3e5f5',
    borderSubtle: '#e1bee7',
    glow1: 'rgba(111, 66, 193, 0.25)',
    glow2: 'rgba(111, 66, 193, 0.1)'
  },
  electronica: {
    primary: '#dc3545', // Rojo carmesi (coincide con badge rojo)
    primaryRgb: '220, 53, 69',
    bgSubtle: '#fdf2f2', // Blanco tenue con tinte rojo
    borderSubtle: '#f8d7da',
    glow1: 'rgba(220, 53, 69, 0.25)',
    glow2: 'rgba(220, 53, 69, 0.1)'
  },
  ambient: {
    primary: '#0891b2', // Cian-600 (coincide con badge azul)
    primaryRgb: '8, 145, 178',
    bgSubtle: '#ecfeff', // Cian-50 (cian hielo muy suave)
    borderSubtle: '#c5f6fa', // Cian-200
    glow1: 'rgba(8, 145, 178, 0.25)',
    glow2: 'rgba(8, 145, 178, 0.1)'
  },
  classical: {
    primary: '#198754', // Verde zen (coincide con badge verde)
    primaryRgb: '25, 135, 84',
    bgSubtle: '#e8f5e9', // Blanco con tinte verde calido
    borderSubtle: '#a3cfbb',
    glow1: 'rgba(25, 135, 84, 0.25)',
    glow2: 'rgba(25, 135, 84, 0.1)'
  },
  chillout: {
    primary: '#ca8a04', // Amarillo ocaso/ocre (coincide con badge amarillo)
    primaryRgb: '202, 138, 4',
    bgSubtle: '#fefce8', // Amarillo-50 (fondo dorado suave)
    borderSubtle: '#fef08a', // Amarillo-200
    glow1: 'rgba(202, 138, 4, 0.25)',
    glow2: 'rgba(202, 138, 4, 0.1)'
  }
};

/**
 * Devuelve la clave de tema segun el genero del track.
 * @param {Object} track - Track con metadata de genero.
 * @returns {string} clave de tema (p. ej. "calma", "foco").
 */
const getTrackThemeKey = (track) => {
  if (!track || !track.genre) return 'calma';
  const genreLower = track.genre.toLowerCase();

  if (genreLower.includes('electr')) return 'electronica'; // Electronica (rosa vibrante)
  if (genreLower.includes('amb')) return 'ambient';         // Ambient (turquesa frio)
  if (genreLower.includes('class') || genreLower.includes('clás') || genreLower.includes('clas')) return 'classical'; // Clasica (ambar calido)
  if (genreLower.includes('chill')) return 'chillout';      // Chillout (arena dorada)

  if (genreLower.includes('calma')) return 'calma';
  if (genreLower.includes('foco') || genreLower.includes('concentracion') || genreLower.includes('trabajo')) return 'foco';
  if (genreLower.includes('zen') || genreLower.includes('atmosfera') || genreLower.includes('meditacion')) return 'zen';
  return 'relajacion';
};

// Playlist local de respaldo cuando la API no responde.
const fallbackPlaylist = [
  {
    id: 'sim-1',
    title: 'Frecuencias de Calma Profunda',
    artist: 'Ondas Theta 432Hz',
    cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjwpnpx7xR1WpHvUx8LUi2gZ6v3_Kwo235vwHux1GFHRpvFfQgjc2hroz00aWkf76aKfexB3-HFEXyhN2-Wy1ni3zOuFba7NYyKc2EMXafI-CRCKi0R-O4VOi-UV4RujbFto4TrVuUyWXycomJutNpNaFzSZiru9KDz_NHGhQPrrN7hXcoQHo_3jDu_TgYMvWJIM4Er55XPC16u_-gYPPUmlV4pzhcDWP0AD35dcMjy623l5HayeAwHKjVInj3G_fcubP6AACMrUo',
    preview_url: '/fallback-1.mp3',
    energy: 3,
    valence: 8,
    bpm: 60,
    genre: 'Calma'
  },
  {
    id: 'sim-2',
    title: 'Serenidad Estelar',
    artist: 'Ondas Delta',
    cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjwpnpx7xR1WpHvUx8LUi2gZ6v3_Kwo235vwHux1GFHRpvFfQgjc2hroz00aWkf76aKfexB3-HFEXyhN2-Wy1ni3zOuFba7NYyKc2EMXafI-CRCKi0R-O4VOi-UV4RujbFto4TrVuUyWXycomJutNpNaFzSZiru9KDz_NHGhQPrrN7hXcoQHo_3jDu_TgYMvWJIM4Er55XPC16u_-gYPPUmlV4pzhcDWP0AD35dcMjy623l5HayeAwHKjVInj3G_fcubP6AACMrUo',
    preview_url: '/fallback-2.mp3',
    energy: 2,
    valence: 7,
    bpm: 55,
    genre: 'Calma'
  },
  {
    id: 'sim-3',
    title: 'Flujo de Trabajo',
    artist: 'Ruido Rosa',
    cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjwpnpx7xR1WpHvUx8LUi2gZ6v3_Kwo235vwHux1GFHRpvFfQgjc2hroz00aWkf76aKfexB3-HFEXyhN2-Wy1ni3zOuFba7NYyKc2EMXafI-CRCKi0R-O4VOi-UV4RujbFto4TrVuUyWXycomJutNpNaFzSZiru9KDz_NHGhQPrrN7hXcoQHo_3jDu_TgYMvWJIM4Er55XPC16u_-gYPPUmlV4pzhcDWP0AD35dcMjy623l5HayeAwHKjVInj3G_fcubP6AACMrUo',
    preview_url: '/fallback-3.mp3',
    energy: 4,
    valence: 9,
    bpm: 70,
    genre: 'Foco'
  },
  {
    id: 'sim-4',
    title: 'Respiro Consciente',
    artist: 'Atmósfera Zen',
    cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjwpnpx7xR1WpHvUx8LUi2gZ6v3_Kwo235vwHux1GFHRpvFfQgjc2hroz00aWkf76aKfexB3-HFEXyhN2-Wy1ni3zOuFba7NYyKc2EMXafI-CRCKi0R-O4VOi-UV4RujbFto4TrVuUyWXycomJutNpNaFzSZiru9KDz_NHGhQPrrN7hXcoQHo_3jDu_TgYMvWJIM4Er55XPC16u_-gYPPUmlV4pzhcDWP0AD35dcMjy623l5HayeAwHKjVInj3G_fcubP6AACMrUo',
    preview_url: '/fallback-4.mp3',
    energy: 3,
    valence: 6,
    bpm: 65,
    genre: 'Zen'
  }
];

/**
 * Componente raiz de la app; orquesta navegacion, audio y encuestas.
 * @returns {JSX.Element}
 */
function MainApp() {
  /**
   * Lee la encuesta almacenada en localStorage.
   * @returns {Object|null} datos de encuesta o null si no existe/parsea.
   */
  const readStoredSurvey = () => {
    try {
      const stored = localStorage.getItem('surveyData');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Failed to read surveyData from localStorage:', e);
      return null;
    }
  };

  // Navegacion y sesion con React Router
  const location = useLocation();
  const navigate = useNavigate();

  const screenMap = {
    '/': 'onboarding',
    '/login': 'onboarding',
    '/register': 'register',
    '/callback': 'processing-spotify',
    '/survey': 'initial-evaluation',
    '/calibrate': 'calibration',
    '/artists': 'artist-evaluation',
    '/dashboard': 'dashboard',
    '/settings': 'settings',
    '/profile': 'profile',
    '/profile-summary': 'profile-summary',
    '/final-evaluation': 'final-evaluation'
  };

  const reverseScreenMap = {
    'onboarding': '/login',
    'register': '/register',
    'processing-spotify': '/callback',
    'initial-evaluation': '/survey',
    'calibration': '/calibrate',
    'artist-evaluation': '/artists',
    'dashboard': '/dashboard',
    'settings': '/settings',
    'profile': '/profile',
    'profile-summary': '/profile-summary',
    'final-evaluation': '/final-evaluation'
  };

  const screen = screenMap[location.pathname] || 'onboarding';

  const setScreen = (s) => {
    const path = reverseScreenMap[s] || '/login';
    navigate(path);
  };

  // Redirección inteligente de rutas
  useEffect(() => {
    const onboardingPaths = ['/', '/login', '/register', '/survey', '/artists'];

    if (onboardingPaths.includes(location.pathname)) {
      const token = localStorage.getItem('token');
      const spotifyToken = localStorage.getItem('spotifyToken');

      if (token || spotifyToken) {
        const userCached = localStorage.getItem('user');
        if (userCached) {
          try {
            const userObj = JSON.parse(userCached);

            // Si form es true, el usuario ya completó la configuración inicial (frecuencia, artistas).
            // PERO queremos que cada vez que inicie la app ('/' o '/login'), haga la encuesta emocional ('/survey').
            if (userObj.form === true) {
              if (location.pathname === '/' || location.pathname === '/login') {
                navigate('/survey', { replace: true });
                return;
              }
              // Si intenta ir a '/artists' manualmente, lo bloqueamos y lo mandamos al dashboard
              if (location.pathname === '/artists') {
                navigate('/dashboard', { replace: true });
                return;
              }
              // Si está en '/survey', lo dejamos continuar (hará la encuesta emocional)
            }

            const hasPastSurveys = userObj.surveys && userObj.surveys.length > 0;
            const lastSurvey = hasPastSurveys ? userObj.surveys[userObj.surveys.length - 1] : null;
            const hasArtists = lastSurvey && lastSurvey.artist_interest && lastSurvey.artist_interest.length > 0;

            // Lógica de progreso del onboarding (para nuevos usuarios que aún no tienen form===true)
            if (userObj.form !== true) {
              if (hasPastSurveys && hasArtists) {
                // Caso raro donde no tiene form true pero ya hizo todo
                navigate('/dashboard', { replace: true });
                return;
              } else if (hasPastSurveys && location.pathname === '/survey') {
                // Ya tiene encuesta inicial, lo mandamos a seleccionar artistas
                navigate('/artists', { replace: true });
                return;
              }
            }
          } catch (e) {
            console.error(e);
          }
        }

        // Si estamos en la raiz o login, decidir a donde va en base a localStorage genérico si falla lo anterior
        if (location.pathname === '/' || location.pathname === '/login') {
          const survey = localStorage.getItem('surveyData');
          if (survey) {
            navigate('/dashboard', { replace: true });
            return;
          }
          navigate('/survey', { replace: true });
        }
      } else {
        // No hay token, forzar login si está intentando ir a otra ruta
        if (location.pathname !== '/login' && location.pathname !== '/register') {
          navigate('/login', { replace: true });
        }
      }
    }
  }, [location.pathname, navigate]);

  // Protección de rutas
  useEffect(() => {
    const token = localStorage.getItem('token');
    const spotifyToken = localStorage.getItem('spotifyToken');
    const isAuth = token || spotifyToken;

    const protectedRoutes = ['/dashboard', '/settings', '/profile', '/profile-summary', '/final-evaluation'];
    if (protectedRoutes.includes(location.pathname) && !isAuth) {
      navigate('/login', { replace: true });
    }
  }, [location.pathname, navigate]);

  const [targetEmotion, setTargetEmotion] = useState('gris');
  const [themeMode, setThemeMode] = useState('auto');
  const [userType, setUserType] = useState(() => {
    if (localStorage.getItem('spotifyToken')) return 'spotify';
    if (localStorage.getItem('token')) return 'traditional';
    return null;
  });
  const [surveyData, setSurveyData] = useState(readStoredSurvey);
  const [showEmotionalSummary, setShowEmotionalSummary] = useState(false);
  const [selectedArtistsData, setSelectedArtistsData] = useState(() => {
    try {
      const stored = localStorage.getItem('selectedArtistsData');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [volume, setVolume] = useState(45);
  const [initialStress, setInitialStress] = useState(8);

  // Estado persistente de audio
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef(null);
  const isFadingOut = useRef(false);
  const fadeIntervalRef = useRef(null);

  const [analyserNode, setAnalyserNode] = useState(null);
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const gainNodeRef = useRef(null);

  // Estado e instancias del SDK de Spotify
  const spotifyPlayerRef = useRef(null);
  const spotifyTrackEndHandlerRef = useRef(null);
  const [spotifyDeviceId, setSpotifyDeviceId] = useState(null);
  const [spotifyPlayerState, setSpotifyPlayerState] = useState(null);

  useEffect(() => {
    if (surveyData) {
      localStorage.setItem('surveyData', JSON.stringify(surveyData));
    } else {
      localStorage.removeItem('surveyData');
    }
  }, [surveyData]);

  useEffect(() => {
    // Only restore volume if it is a legacy volume level (<= 100) and does not come from the new survey format (which contains comoSiente)
    if (surveyData && surveyData.volume !== undefined && surveyData.volume <= 100 && !surveyData.hasOwnProperty('comoSiente')) {
      setVolume(surveyData.volume);
    }
  }, [surveyData]);

  // Sincronizar el perfil del usuario desde el backend cuando cambie la sesión o se monte
  useEffect(() => {
    const loadProfileAndSync = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          console.log("🔄 Sincronizando datos del usuario desde el servidor...");
          const response = await apiCall('neuro', '/api/auth/me', 'GET');
          if (response && response.success && response.data) {
            const userObj = response.data;
            localStorage.setItem('user', JSON.stringify(userObj));
          }
        } catch (e) {
          console.error("❌ Error al sincronizar el perfil:", e);
          if (e.status === 404) {
            console.warn("⚠️ Usuario no encontrado en el servidor. Limpiando sesión local...");
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }

        // Obtener la última encuesta desde la BD (solo para restaurar artistas)
        try {
          const surveyRes = await apiCall('neuro', '/api/survey/get-register', 'GET');
          if (surveyRes?.success && surveyRes.data) {
            const dbSurvey = surveyRes.data;

            // Poblar selectedArtistsData si la encuesta tiene artistas
            if (dbSurvey.artist_interest && dbSurvey.artist_interest.length > 0) {
              let artistsData = [];
              try {
                const storedFull = localStorage.getItem('selectedArtistsData');
                if (storedFull) {
                  const parsed = JSON.parse(storedFull);
                  if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.name) {
                    artistsData = parsed;
                  }
                }
              } catch (_) {}
              if (artistsData.length === 0) {
                const dbGenres = dbSurvey.genres || [];
                artistsData = dbSurvey.artist_interest.map((name, idx) => ({
                  id: name,
                  name,
                  img: null,
                  genres: dbGenres.length > 0 ? [dbGenres[idx % dbGenres.length]] : []
                }));
              }
              localStorage.setItem('selectedArtistsData', JSON.stringify(artistsData));
              setSelectedArtistsData(artistsData);
              const fakeIds = artistsData.map(a => a.id);
              localStorage.setItem('selectedArtists', JSON.stringify(fakeIds));
            }
          }
        } catch (e) {
          console.warn("⚠️ No se pudo obtener la encuesta desde la BD:", e.message);
        }
      }
    };
    loadProfileAndSync();
  }, [userType]);

  // Carga automática de playlist si se recarga la página directo en el Dashboard
  useEffect(() => {
    if (screen === 'dashboard' && playlist.length === 0 && !isLoading) {
      console.log("🔄 Carga automática de playlist al recargar en Dashboard...");
      loadPlaylist(surveyData || readStoredSurvey());
    }
  }, [screen, playlist.length, isLoading, surveyData]);

  /**
   * Inicializa el grafo de Web Audio y conecta el audio HTML5.
   * @returns {void}
   */
  const initAudioContext = () => {
    if (audioContextRef.current) {
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      return;
    }

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      setAnalyserNode(analyser);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(volume / 100, ctx.currentTime);
      gainNodeRef.current = gainNode;

      // Conecta audio HTML5 al grafo de Web Audio
      if (audioRef.current) {
        const source = ctx.createMediaElementSource(audioRef.current);
        sourceNodeRef.current = source;
        source.connect(analyser);
        analyser.connect(gainNode);
        gainNode.connect(ctx.destination);
        console.log("🔊 Web Audio graph connected successfully with Analyser and GainNode.");
      }
    } catch (e) {
      console.error("❌ Failed to initialize Web Audio graph:", e);
    }
  };

  // Sincroniza el volumen de audio
  useEffect(() => {
    if (audioRef.current && !isFadingOut.current) {
      audioRef.current.volume = volume / 100;
    }
    if (gainNodeRef.current && audioContextRef.current && !isFadingOut.current) {
      gainNodeRef.current.gain.setValueAtTime(volume / 100, audioContextRef.current.currentTime);
    }
    if (spotifyPlayerRef.current) {
      spotifyPlayerRef.current.setVolume?.(volume / 100)?.catch(err => {
        console.warn("Error setting Spotify SDK volume:", err);
      });
    }
  }, [volume]);

  // Inicialización y sincronización del Spotify Web Playback SDK
  useEffect(() => {
    const token = localStorage.getItem('spotifyToken');
    if (userType !== 'spotify' || !token) {
      if (spotifyPlayerRef.current) {
        console.log("🔌 Desconectando Spotify Web Playback SDK...");
        try {
          spotifyPlayerRef.current.disconnect();
        } catch (e) {
          console.error(e);
        }
        spotifyPlayerRef.current = null;
        setSpotifyDeviceId(null);
        setSpotifyPlayerState(null);
      }
      return;
    }

    spotifyPlayerRef.current = SpotifyPlayerWrapper.init({
      onReady: setSpotifyDeviceId,
      onNotReady: () => setSpotifyDeviceId(null),
      onPlayerStateChange: setSpotifyPlayerState,
      onPlayingChange: setIsPlaying,
      onProgressChange: setProgress,
      onDurationChange: setDuration,
      onTrackIndexChange: setCurrentIndex,
      onTrackEnd: () => spotifyTrackEndHandlerRef.current?.(),
      onAccountError: () => {
        console.warn("⚠️ La cuenta de Spotify no tiene Premium. La reproducción puede fallar.");
      }
    });

    SpotifyPlayerWrapper.setVolume?.(volume / 100)?.catch(err => {
      console.warn("Error setting Spotify SDK volume:", err);
    });

    return () => {
      // Dejamos el reproductor activo durante la sesion
    };
  }, [userType, volume]);

  // Estado global del temporizador de sesion
const [timeLeft, setTimeLeft] = useState(15 * 60);
const [isTimerRunning, setIsTimerRunning] = useState(false);
const [timerDuration, setTimerDuration] = useState(15);
const timerRef = useRef(null);

// Efecto de cuenta regresiva del temporizador
useEffect(() => {
  if (isTimerRunning) {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsTimerRunning(false);

          // Sesion completada: pausar audio y mostrar alerta
          setIsPlaying(false);
          if (audioRef.current) audioRef.current.pause();
          if (userType === 'spotify') SpotifyPlayerWrapper.pause?.();

          alert("¡Sesión finalizada! Tu tiempo de sintonización ha terminado.");
          setScreen('final-evaluation');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  } else {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }
  return () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };
}, [isTimerRunning, userType]);

// Usar una variable global fuera del componente en lugar de useRef para sobrevivir al Strict Mode de React 18
// Verifica el callback OAuth de Spotify (PKCE) al montar
useEffect(() => {
  const searchParams = new URLSearchParams(location.search);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Mover esta verificación ANTES del ref para que HMR o recargas forzadas no se queden atascadas
  if (!code && location.pathname === '/callback') {
    navigate('/login', { replace: true });
    return;
  }

  if (window.isSpotifyProcessing) return;

  if (error) {
    window.isSpotifyProcessing = true;
    console.error('❌ Spotify rechazó la autenticación:', error);
    navigate('/login', { replace: true });
    return;
  }

  if (!code) return; // No hay código → primera carga normal

  const verifier = localStorage.getItem('spotifyCodeVerifier');
  if (!verifier) {
    console.warn('⚠️ No se encontró code_verifier. La sesión pudo haber expirado, procesado previamente, o es una URL caducada.');
    navigate('/login', { replace: true });
    return;
  }

  window.isSpotifyProcessing = true;

  // Limpiar la URL para que no se vuelva a procesar el código si recarga
  navigate('/callback', { replace: true });
  localStorage.removeItem('spotifyCodeVerifier');

  const exchangeAndSync = async () => {
    try {
      console.log('🔄 Intercambiando código PKCE por access_token de Spotify...');

      // 1. Intercambio de código → token (PKCE, sin client_secret)
      const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: 'f94cd594219c4d11abc5a2ab15472b9c',
          grant_type: 'authorization_code',
          code,
          redirect_uri: 'http://127.0.0.1:5173/callback',
          code_verifier: verifier
        })
      });

      if (!tokenRes.ok) {
        const errBody = await tokenRes.json().catch(() => ({}));
        throw new Error(errBody.error_description || `Token exchange failed: ${tokenRes.status}`);
      }

      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;
      const refreshToken = tokenData.refresh_token;

      localStorage.setItem('spotifyToken', accessToken);
      if (refreshToken) localStorage.setItem('spotifyRefreshToken', refreshToken);
      console.log('✅ Token de Spotify obtenido y guardado.');

      // 2. Sincronizar con el backend local
      const localToken = localStorage.getItem('token');
      if (localToken) {
        // Ya hay sesión local → solo vinculamos Spotify
        setUserType('spotify');
        console.log('✅ Spotify vinculado a la sesión local activa.');
        navigate('/', { replace: true });
        return;
      }

      // No hay sesión local: obtener perfil de Spotify y crear cuenta
      const meRes = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!meRes.ok) {
        throw new Error('Spotify rechazó la solicitud del perfil (Error 403). Verifica que tu cuenta de Spotify esté añadida al panel de desarrolladores o que hayas aceptado los permisos.');
      }

      const spotifyUser = await meRes.json();
      const spotifyEmail = spotifyUser.email || `spotify_${spotifyUser.id}@neurosound.com`;
      const names = (spotifyUser.display_name || 'Spotify User').split(' ');
      const name = names[0] || 'Spotify';
      const lastName = names.slice(1).join(' ') || 'User';
      const password = `spotify_secret_2026_${spotifyUser.id}`;

      // 1. Intentar iniciar sesión primero
      let loginRes;
      try {
        loginRes = await apiCall('neuro', '/api/auth/login', 'POST', {
          email: spotifyEmail, password
        });
      } catch (e) {
        // Si falla el login, intentamos registrar al usuario
        try {
          await apiCall('neuro', '/api/user/register', 'POST', {
            name, last_name: lastName, email: spotifyEmail, password
          });
          console.log('✅ Usuario de Spotify registrado en base de datos local.');
          // Reintentar login tras registrar
          loginRes = await apiCall('neuro', '/api/auth/login', 'POST', {
            email: spotifyEmail, password
          });
        } catch (regErr) {
          // Si el registro falla por duplicado (409) o error del servidor, lo manejamos
          if (regErr.status === 409 || regErr.message.includes('409') || regErr.message.includes('registrado') || regErr.message.includes('registrar')) {
            throw new Error('Este correo ya está registrado de forma tradicional. Por favor, inicia sesión con tu correo y contraseña.');
          } else {
            throw new Error(`Error al crear la cuenta: ${regErr.message}`);
          }
        }
      }

      if (loginRes && loginRes.success) {
        localStorage.setItem('token', loginRes.data.token);
        if (loginRes.data.user) {
          localStorage.setItem('user', JSON.stringify(loginRes.data.user));
          const surveys = loginRes.data.user.surveys;
          if (surveys && surveys.length > 0) {
            const lastSurvey = surveys[surveys.length - 1];
            setSurveyData(lastSurvey);
            localStorage.setItem('surveyData', JSON.stringify(lastSurvey));
          }
        }
        console.log('✅ Sesión local iniciada para el usuario de Spotify.');
      } else {
        throw new Error('No se pudo obtener el token de acceso local.');
      }

      // Solo continuamos si todo fue exitoso
      setUserType('spotify');
      navigate('/survey', { replace: true });

    } catch (e) {
      console.error('❌ Error en el flujo PKCE de Spotify:', e);
      // Si hay error, regresamos al login pasando el error
      navigate('/login', { replace: true, state: { error: e.message } });
    } finally {
      setTimeout(() => { window.isSpotifyProcessing = false; }, 2000);
    }
  };

  exchangeAndSync();
}, []);

// Inicializa el objeto Audio persistente
// Inicializa el objeto Audio persistente una sola vez
useEffect(() => {
  const audio = new Audio();
  audio.crossOrigin = "anonymous";
  audioRef.current = audio;
  return () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };
}, []);

// Actualiza listeners cuando cambian playlist/currentIndex/volume
useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;

  const onTimeUpdate = () => {
    setProgress(audio.currentTime);

    // Logica de fade-out: ultimos 6 segundos de la pista
    const baseVol = volume / 100;
    if (audio.duration && audio.duration - audio.currentTime <= 6 && !audio.paused && !isFadingOut.current && baseVol > 0) {
      isFadingOut.current = true;
      console.log(`🔊 Starting fade-out for "${playlist[currentIndex]?.title || 'song'}"...`);

      const steps = 20;
      const intervalTime = 250; // 5000ms / 20 pasos = 250ms por paso
      let currentStep = 0;

      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

      fadeIntervalRef.current = setInterval(() => {
        if (!audioRef.current) {
          clearInterval(fadeIntervalRef.current);
          return;
        }

        currentStep++;
        const ratio = Math.max(0, 1 - (currentStep / steps));
        audio.volume = baseVol * ratio;
        if (gainNodeRef.current && audioContextRef.current) {
          gainNodeRef.current.gain.setValueAtTime(baseVol * ratio, audioContextRef.current.currentTime);
        }

        if (currentStep >= steps) {
          clearInterval(fadeIntervalRef.current);
          console.log("🔊 Fade out complete. Loading next track.");
          audio.pause();
          isFadingOut.current = false;
          handleNext();
        }
      }, intervalTime);
    }
  };

  const onLoadedMetadata = () => {
    setDuration(audio.duration || 30);
    setIsLoading(false);
  };

  const onEnded = () => {
    if (isFadingOut.current) return; // Ya manejado por el fin del fade-out
    handleNext();
  };

  audio.addEventListener('timeupdate', onTimeUpdate);
  audio.addEventListener('loadedmetadata', onLoadedMetadata);
  audio.addEventListener('ended', onEnded);

  return () => {
    audio.removeEventListener('timeupdate', onTimeUpdate);
    audio.removeEventListener('loadedmetadata', onLoadedMetadata);
    audio.removeEventListener('ended', onEnded);
  };
}, [currentIndex, playlist, volume]);

// Procesamiento bajo demanda cuando cambia el indice actual
useEffect(() => {
  if (userType === 'spotify') return;
  if (playlist.length === 0) return;
  const currentTrack = playlist[currentIndex];
  if (!currentTrack || currentTrack.id.startsWith("sim-")) return;

  const isAlreadyProcessed = currentTrack.preview_url && currentTrack.preview_url.includes("processed_");

  if (!isAlreadyProcessed) {
    let isSubscribed = true;

    const processTrack = async () => {
      try {
        setIsLoading(true);
        const surveyObj = surveyData || { estres: 3, ansiedad: 3, tristeza: 1 };
        console.log(`⚡ Modulando fármaco digital para "${currentTrack.title}"...`);

        const processedUrl = await processTrackOnDemand(currentTrack.id, surveyObj);

        if (processedUrl && isSubscribed) {
          setPlaylist(prevPlaylist => {
            const updated = [...prevPlaylist];
            if (updated[currentIndex] && updated[currentIndex].id === currentTrack.id) {
              updated[currentIndex] = {
                ...updated[currentIndex],
                preview_url: `http://${window.location.hostname}:5002${processedUrl}`
              };
            }
            return updated;
          });
        }
      } catch (error) {
        // 422 / notAvailable: el audio no esta en YouTube - saltar automaticamente
        if (error?.notAvailable && isSubscribed) {
          console.warn(`⏭️ Track "${currentTrack.title}" no disponible en YouTube. Saltando a la siguiente pista...`);
          // Remueve la pista no disponible y avanza
          setPlaylist(prevPlaylist => prevPlaylist.filter((_, i) => i !== currentIndex));
          setCurrentIndex(prev => Math.min(prev, Math.max(0, playlist.length - 2)));
        } else {
          console.error("❌ Error running on-demand processor:", error);
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };

    processTrack();

    return () => {
      isSubscribed = false;
    };
  }
}, [currentIndex, playlist, surveyData, userType]);

// Sincroniza la reproduccion de audio
useEffect(() => {
  if (!audioRef.current || playlist.length === 0) return;
  const currentTrack = playlist[currentIndex];
  if (!currentTrack) return;

  // Si el usuario es de Spotify y la pista tiene URI, la reproducción se delega a Spotify
  if (userType === 'spotify') {
    audioRef.current.pause();
    return;
  }

  const src = currentTrack.preview_url || currentTrack.src;

  // Sin URL aun: el procesador bajo demanda sigue descargando.
  // Pausa el audio y muestra spinner; processTrack actualizara preview_url al finalizar.
  if (!src) {
    audioRef.current.pause();
    setIsLoading(true);
    return;
  }

  if (audioRef.current.src !== src) {
    setIsLoading(true);
    audioRef.current.src = src;
    audioRef.current.load();

    // Inicia en volumen 0 para hacer fade-in
    audioRef.current.volume = 0;
  } else {
    setIsLoading(false);
  }

  if (isPlaying) {
    initAudioContext();
    audioRef.current.play().then(() => {
      // Hace fade-in del track desde 0 al volumen objetivo
      const baseVol = volume / 100;
      if (baseVol > 0 && audioRef.current && audioRef.current.volume === 0) {
        const steps = 15;
        const intervalTime = 100; // 1500ms de fade-in total
        let currentStep = 0;

        const fadeInInterval = setInterval(() => {
          if (audioRef.current) {
            currentStep++;
            const ratio = Math.min(1, currentStep / steps);
            audioRef.current.volume = baseVol * ratio;
            if (gainNodeRef.current && audioContextRef.current) {
              gainNodeRef.current.gain.setValueAtTime(baseVol * ratio, audioContextRef.current.currentTime);
            }

            if (currentStep >= steps) {
              clearInterval(fadeInInterval);
            }
          } else {
            clearInterval(fadeInInterval);
          }
        }, intervalTime);
      }
    }).catch((err) => {
      console.warn("Autoplay blocked:", err);
      setIsPlaying(false);
    });
  } else {
    audioRef.current.pause();
  }
}, [currentIndex, playlist, isPlaying, volume, userType]);

// Sincroniza la reproducción de Spotify
useEffect(() => {
  if (userType !== 'legacy-spotify' || playlist.length === 0) return;
  const currentTrack = playlist[currentIndex];
  if (!currentTrack || !currentTrack.uri) return;

  // Pausar audio local HTML5 si estuviera sonando
  if (audioRef.current && !audioRef.current.paused) {
    audioRef.current.pause();
  }

  if (!spotifyDeviceId) {
    console.warn("⚠️ Spotify Device ID no listo para reproducir.");
    return;
  }

  const playSpotifyTrack = async () => {
    try {
      setIsLoading(true);
      // Obtener el estado actual del reproductor
      const state = await spotifyPlayerRef.current?.getCurrentState();
      const currentUriInPlayer = state?.track_window?.current_track?.uri;
      const isPausedInPlayer = state?.paused ?? true;

      if (isPlaying) {
        if (currentUriInPlayer !== currentTrack.uri) {
          console.log(`▶️ Reproduciendo track en Spotify: ${currentTrack.title} (${currentTrack.uri})`);
          await apiCall('spotify', `/me/player/play?device_id=${spotifyDeviceId}`, 'PUT', {
            uris: [currentTrack.uri]
          });
        } else if (isPausedInPlayer) {
          console.log("▶️ Resumiendo track en Spotify");
          await spotifyPlayerRef.current?.resume();
        }
      } else {
        if (!isPausedInPlayer) {
          console.log("⏸️ Pausando track en Spotify");
          await spotifyPlayerRef.current?.pause();
        }
      }
    } catch (err) {
      console.error("❌ Error controlando reproducción en Spotify:", err);
    } finally {
      setIsLoading(false);
    }
  };

  playSpotifyTrack();
}, [currentIndex, playlist, isPlaying, spotifyDeviceId, userType]);

// Intervalo de progreso y fin de canción para Spotify
useEffect(() => {
  let interval = null;
  if (userType === 'legacy-spotify' && isPlaying && spotifyDeviceId && duration > 0) {
    interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= duration - 1) {
          clearInterval(interval);
          console.log("⏹️ Canción finalizada en Spotify. Pasando al siguiente track.");
          handleNext(false);
          return duration;
        }
        return prev + 1;
      });
    }, 1000);
  }
  return () => {
    if (interval) clearInterval(interval);
  };
}, [userType, isPlaying, spotifyDeviceId, duration, currentIndex]);

// Handlers de audio
/**
 * Alterna reproduccion/pausa del audio.
 * @returns {void}
 */
const handlePlayPause = async () => {
  if (userType === 'spotify') {
    const currentTrack = playlist[currentIndex];
    if (!isPlaying && currentTrack?.uri && progress === 0) {
      const ok = await SpotifyPlayerWrapper.playTrackAtIndex(currentIndex);
      if (ok) setIsPlaying(true);
      return;
    }

    SpotifyPlayerWrapper.togglePlay();
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
    return;
  }

  setIsPlaying(!isPlaying);
};

/**
 * Salta a la siguiente pista y reinicia estado de carga.
 * @returns {void}
 */
/**
 * Salta a la siguiente pista y reinicia estado de carga.
 * @param {boolean} [isManual=false] - Indica si el cambio de track fue realizado manualmente por el usuario.
 * @returns {Promise<void>}
 */
const handleNext = async (isManual = false) => {
  if (playlist.length === 0) return;
  const currentTrack = playlist[currentIndex];

  if (isManual && currentTrack) {
    if (progress < 60) {
      await handleFeedback('negative', currentTrack, false);
    } else {
      await handleFeedback('positive', currentTrack);
    }
  } else if (!isManual && currentTrack) {
    await handleFeedback('positive', currentTrack);
  }

  if (currentIndex === playlist.length - 1) {
    console.log("🏁 Fin de la playlist. Cargando siguiente tanda...");
    setIsPlaying(false);
    setIsLoading(true);
    const newPlaylist = await loadPlaylist(surveyData || {});
    if (userType === 'spotify' && newPlaylist?.length > 0) {
      await SpotifyPlayerWrapper.playTrackAtIndex(0);
    }
    setIsPlaying(true);
    return;
  }

  if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
  isFadingOut.current = false;
  if (audioRef.current) audioRef.current.volume = volume / 100;
  if (gainNodeRef.current && audioContextRef.current) {
    gainNodeRef.current.gain.setValueAtTime(volume / 100, audioContextRef.current.currentTime);
  }

  setIsLoading(true);
  const nextIndex = currentIndex + 1;
  setCurrentIndex(nextIndex);

  // 👉 Enrutamiento al SDK de Spotify
  if (userType === 'spotify') {
    try {
      await SpotifyPlayerWrapper.playTrackAtIndex(nextIndex);
    } catch (e) { console.error("Error en Spotify Player:", e); }
  }

  setIsPlaying(true);
};

spotifyTrackEndHandlerRef.current = () => handleNext(false);

/**
 * Retrocede a la pista anterior y reinicia estado de carga.
 * @param {boolean} [isManual=false] - Indica si fue manual.
 * @returns {Promise<void>}
 */
const handlePrev = async (isManual = false) => {
  if (playlist.length === 0) return;
  const currentTrack = playlist[currentIndex];

  if (isManual && currentTrack) {
    if (progress < 60) {
      await handleFeedback('negative', currentTrack, false);
    } else {
      await handleFeedback('positive', currentTrack);
    }
  }

  if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
  isFadingOut.current = false;
  if (audioRef.current) audioRef.current.volume = volume / 100;
  if (gainNodeRef.current && audioContextRef.current) {
    gainNodeRef.current.gain.setValueAtTime(volume / 100, audioContextRef.current.currentTime);
  }

  setIsLoading(true);
  const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
  setCurrentIndex(prevIndex);

  // 👉 Enrutamiento al SDK de Spotify
  if (userType === 'spotify') {
    try {
      await SpotifyPlayerWrapper.playTrackAtIndex(prevIndex);
    } catch (e) { console.error("Error en Spotify Player:", e); }
  }

  setIsPlaying(true);
};

/**
 * Selecciona una pista por indice y la reproduce.
 * @param {number} index - Indice de la pista en la lista.
 * @param {boolean} [isManual=false] - Indica si fue manual.
 * @returns {Promise<void>}
 */
const handleSelectTrack = async (index, isManual = false) => {
  if (index === currentIndex) {
    setIsPlaying(!isPlaying);
    return;
  }
  const currentTrack = playlist[currentIndex];

  if (isManual && currentTrack) {
    if (progress < 60) {
      await handleFeedback('negative', currentTrack, false);
    } else {
      await handleFeedback('positive', currentTrack);
    }
  }

  if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
  isFadingOut.current = false;
  if (audioRef.current) audioRef.current.volume = volume / 100;
  if (gainNodeRef.current && audioContextRef.current) {
    gainNodeRef.current.gain.setValueAtTime(volume / 100, audioContextRef.current.currentTime);
  }

  setIsLoading(true);
  setCurrentIndex(index);

  // 👉 Enrutamiento al SDK de Spotify (con fallback a audio local)
  if (userType === 'spotify') {
    const selectedTrack = playlist[index];
    const playedOnSpotify = await SpotifyPlayerWrapper.playTrackAtIndex(index);

    if (!playedOnSpotify && selectedTrack?.preview_url && audioRef.current) {
      if (audioRef.current.src !== selectedTrack.preview_url) {
        audioRef.current.src = selectedTrack.preview_url;
      }
      try {
        await audioRef.current.play();
      } catch (e) {
        console.error("Error reproduciendo preview local:", e);
        setIsPlaying(false);
      }
    }
  }

  setIsPlaying(true);
};
/**
 * Actualiza el tiempo de reproduccion.
 * @param {number} val - Tiempo destino en segundos.
 * @returns {void}
 */
const handleSeek = (val) => {
  const currentTrack = playlist[currentIndex];
  if (userType === 'spotify' && currentTrack && currentTrack.uri && spotifyPlayerRef.current) {
    spotifyPlayerRef.current.seek(val).then(() => {
      setProgress(val);
    }).catch(err => {
      console.warn("Spotify seek error:", err);
    });
  } else if (audioRef.current) {
    audioRef.current.currentTime = val;
    setProgress(val);
  }
};

// Login y onboarding
/**
 * Registra el tipo de usuario y avanza al primer survey.
 * @param {string} type - "spotify" o "guest".
 * @returns {void}
 */
const handleLogin = (type, userObj = null) => {
  setUserType(type);
  const user = userObj || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);

  // Restaurar surveyData desde el usuario ANTES de cualquier navegación
  if (user) {
    const hasSurvey = user.surveys && user.surveys.length > 0;
    let surveyWithArtists = null;
    if (hasSurvey) {
      for (let i = user.surveys.length - 1; i >= 0; i--) {
        if (user.surveys[i].artist_interest && user.surveys[i].artist_interest.length > 0) {
          surveyWithArtists = user.surveys[i];
          break;
        }
      }
    }
    const hasArtists = !!surveyWithArtists;

    if (hasSurvey) {
      const lastSurvey = user.surveys[user.surveys.length - 1];
      setSurveyData(lastSurvey);
      localStorage.setItem('surveyData', JSON.stringify(lastSurvey));
    }

    // Si el usuario ya completó el proceso inicial (form: true), llevarlo a la encuesta emocional diaria
    if (user.form === true) {
      navigate('/survey');
      return;
    }

    if (hasArtists) {
      // Usuario ya configurado: solo preguntamos el estado emocional de hoy
      setScreen('initial-evaluation');
    } else if (hasSurvey) {
      // Tiene encuesta pero nunca eligió artistas → elegir artistas
      setScreen('artist-evaluation');
    } else {
      // Primera vez: flujo completo
      setScreen('initial-evaluation');
    }
  } else {
    setScreen('initial-evaluation');
  }
};

/**
 * Obtiene la encuesta mezclada con los artistas y géneros previos del usuario,
 * buscando tanto en la base de datos como en localStorage.
 */
const getExistingSurveyId = () => {
  try { const s = localStorage.getItem('surveyData'); return s ? JSON.parse(s)._id : undefined; } catch (_) {}
};

const getMergedSurveyData = async (rawSurveyData) => {
  let finalArtists = [];
  let finalGenres = [];

  try {
    const token = localStorage.getItem('token');
    if (token) {
      console.log("📥 Buscando artistas previos en el historial de la base de datos...");
      const response = await apiCall('neuro', '/api/auth/me', 'GET');
      if (response && response.success && response.data) {
        const userObj = response.data;
        localStorage.setItem('user', JSON.stringify(userObj));

        if (userObj.surveys && userObj.surveys.length > 0) {
          // Buscar hacia atrás en el historial
          for (let i = userObj.surveys.length - 1; i >= 0; i--) {
            if (userObj.surveys[i].artist_interest && userObj.surveys[i].artist_interest.length > 0) {
              finalArtists = userObj.surveys[i].artist_interest;
              finalGenres = userObj.surveys[i].genres || [];
              break;
            }
          }
        }
      }
    }
  } catch (e) {
    console.error("❌ Error al obtener perfil y encuestas previas:", e);
  }

  // Fallback a localStorage si la DB no arrojó artistas
  if (finalArtists.length === 0) {
    try {
      const stored = localStorage.getItem('selectedArtistsData');
      if (stored) {
        const parsed = JSON.parse(stored);
        finalArtists = parsed.map(a => a.name).filter(Boolean);
        parsed.forEach(a => {
          const artistGenres = Array.isArray(a.genres) ? a.genres : (a.genre ? [a.genre] : []);
          artistGenres.forEach(g => {
            if (g && !finalGenres.includes(g)) finalGenres.push(g);
          });
        });
      }
    } catch (e) {
      console.error("❌ Error al leer selectedArtistsData de localStorage:", e);
    }
  }

  // Último fallback: leer del surveyData actual en localStorage (antes de sobrescribir)
  if (finalArtists.length === 0) {
    try {
      const currSurvey = localStorage.getItem('surveyData');
      if (currSurvey) {
        const parsed = JSON.parse(currSurvey);
        if (parsed.artist_interest && parsed.artist_interest.length > 0) {
          finalArtists = parsed.artist_interest;
          finalGenres = parsed.genres || [];
        }
      }
    } catch (e) {
      console.error("❌ Error al leer surveyData actual de localStorage:", e);
    }
  }

  // Si no se encontraron artistas, no enviar estos campos al backend
  // para que preserve los valores existentes en la BD
  if (finalArtists.length === 0) {
    const { artist_interest, genres, ...rest } = rawSurveyData;
    return {
      ...rest,
      _id: rawSurveyData._id || getExistingSurveyId(),
      artist_interest: undefined,
      genres: undefined
    };
  }

  if (finalGenres.length === 0) {
    finalGenres = ["Lofi", "Ambient"];
  }

  return {
    ...rawSurveyData,
    _id: rawSurveyData._id || getExistingSurveyId(),
    artist_interest: finalArtists,
    genres: finalGenres
  };
};

/**
 * Guarda la encuesta inicial y define emocion/volumen base.
 * @param {Object} data - Datos de encuesta.
 * @returns {void}
 */
const handleSurveySubmit = async (data) => {
  setIsLoading(true);

  // Obtener los datos mezclados con los artistas de encuestas previas
  const completeSurvey = await getMergedSurveyData(data);

  try {
    const token = localStorage.getItem('token');
    if (token) {
      console.log("💾 Registrando encuesta diaria en el backend...");
      const backendPayload = mapSurveyToBackendPayload(completeSurvey);
      const res = await registerOrUpdateSurvey(backendPayload);
      if (res?.surveyId) {
        completeSurvey._id = res.surveyId;
        console.log("✅ Encuesta con ID:", res.surveyId);
      }
    }
  } catch (e) {
    console.error("❌ Error al registrar encuesta diaria:", e);
  }

  setSurveyData(completeSurvey);
  localStorage.setItem('surveyData', JSON.stringify(completeSurvey));
  setInitialStress(completeSurvey.estres * 2);

  // Emocion por defecto segun nivel de estres
  let defaultEmotion = 'calma';
  if (completeSurvey.ansiedad >= completeSurvey.estres && completeSurvey.ansiedad >= completeSurvey.tristeza) {
    defaultEmotion = 'calma';
  } else if (completeSurvey.tristeza > completeSurvey.ansiedad && completeSurvey.tristeza > completeSurvey.estres) {
    defaultEmotion = 'zen';
  } else {
    defaultEmotion = 'relajacion';
  }
  setTargetEmotion(defaultEmotion);
  setThemeMode('auto');

  const hasArtists = completeSurvey.artist_interest && completeSurvey.artist_interest.length > 0;

  navigate('/calibrate');
};

/**
 * Actualiza el estado emocional del usuario directamente desde el modal.
 */
const handleUpdateSurveyInline = async (sienteVal, quiereVal) => {
  setIsLoading(true);
  const currentFrequency = surveyData?.volume ?? 200;

  const tristezaMapped = Math.max(1, 6 - sienteVal);
  const gap = Math.abs(quiereVal - sienteVal);
  const estresMapped = Math.max(1, Math.min(5, Math.round(tristezaMapped * 0.7 + gap * 0.5)));
  const ansiedadMapped = Math.max(1, Math.min(5, Math.round(tristezaMapped * 0.6 + gap * 0.6)));

  let targetEmo = 'calma';
  if (sienteVal <= 2) {
    targetEmo = 'zen';
  } else if (sienteVal === 3) {
    targetEmo = 'calma';
  } else {
    targetEmo = 'relajacion';
  }

  const updatedData = {
    _id: surveyData?._id || null, // Mantener el ID anterior si existe
    ansiedad: ansiedadMapped,
    estres: estresMapped,
    tristeza: tristezaMapped,
    volume: currentFrequency,
    comoSiente: sienteVal,
    comoQuiere: quiereVal,
    emotion: targetEmo
  };

  // Obtener encuesta completa mezclada con artistas previos
  const completeSurvey = await getMergedSurveyData(updatedData);

  try {
    const token = localStorage.getItem('token');
    if (token) {
      console.log("💾 Guardando actualización de encuesta en el backend...");
      const backendPayload = mapSurveyToBackendPayload(completeSurvey);
      const res = await registerOrUpdateSurvey(backendPayload);
      if (res?.surveyId) {
        completeSurvey._id = res.surveyId;
      }
      console.log("✅ Encuesta registrada/actualizada con ID:", completeSurvey._id);
    }
  } catch (e) {
    console.error("❌ Error al guardar encuesta inline:", e);
  }

  setSurveyData(completeSurvey);
  localStorage.setItem('surveyData', JSON.stringify(completeSurvey));
  setInitialStress(estresMapped * 2);
  setTargetEmotion(targetEmo);
  setThemeMode('auto');

  // Cargar playlist (se pasa null porque ya la registramos/actualizamos)
  await loadPlaylist(null);
};

// Genera y carga la playlist
/**
 * Genera y carga la playlist segun la encuesta.
 * @param {Object} survey - Datos usados para la recomendacion.
 * @returns {Promise<void>}
 */
const loadPlaylist = async (survey) => {
  try {
    setIsLoading(true);
    const token = userType === 'spotify' ? localStorage.getItem('spotifyToken') : null;
    const nextPlaylist = await generateHybridPlaylist(token, survey);
    if (nextPlaylist && nextPlaylist.length > 0) {
      setPlaylist(nextPlaylist);
    } else {
      console.warn("⚠️ API de NeuroSound no responde. Activando playlist de respaldo local.");
      setPlaylist(fallbackPlaylist);
    }
    if (userType === 'spotify') {
      SpotifyPlayerWrapper.updatePlaylist(nextPlaylist);
    }
    setCurrentIndex(0);
    setProgress(0);
    return nextPlaylist;
  } catch (e) {
    console.error("Error loading playlist, using fallback:", e);
    setPlaylist(fallbackPlaylist);
    if (userType === 'spotify') {
      SpotifyPlayerWrapper.updatePlaylist(fallbackPlaylist);
    }
    setCurrentIndex(0);
    setProgress(0);
    return fallbackPlaylist;
  } finally {
    setIsLoading(false);
  }
};

/**
 * Confirma artistas seleccionados: guarda datos y muestra resumen de perfil.
 * @param {string[]} selectedArtists - Lista de ids de artistas.
 * @param {Object[]} artistsData     - Objetos completos de artistas seleccionados.
 * @returns {void}
 */
const handleArtistSurveyConfirm = async (selectedArtists, artistsData = [], nextScreen = 'profile-summary') => {
  localStorage.setItem('selectedArtists', JSON.stringify(selectedArtists));
  localStorage.setItem('selectedArtistsData', JSON.stringify(artistsData));
  setSelectedArtistsData(artistsData);

  // Guardar en la base de datos si el usuario está autenticado
  try {
    const token = localStorage.getItem('token');
    if (token) {
      console.log("💾 Guardando artistas seleccionados en el backend...");

      const completeSurvey = {
        ...surveyData,
        artist_interest: artistsData.map(a => a.name).filter(Boolean),
        genres: []
      };
      artistsData.forEach(a => {
        const artistGenres = Array.isArray(a.genres) ? a.genres : (a.genre ? [a.genre] : []);
        artistGenres.forEach(g => {
          if (g && !completeSurvey.genres.includes(g)) completeSurvey.genres.push(g);
        });
      });
      if (completeSurvey.genres.length === 0) completeSurvey.genres = ["Lofi", "Ambient"];

      const backendPayload = mapSurveyToBackendPayload(completeSurvey);
      console.log("Datos de la encuesta que se enviarán:", backendPayload);

      const response = await registerOrUpdateSurvey(backendPayload);
      console.log("✅ Encuesta y artistas iniciales guardados exitosamente en la base de datos.");

      if (response?.surveyId) {
        completeSurvey._id = response.surveyId;
      }

      setSurveyData(completeSurvey);
      localStorage.setItem('surveyData', JSON.stringify(completeSurvey));

      // Actualizar el objeto de usuario local
      const cachedUserObj = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {};
      cachedUserObj.selectedArtists = selectedArtists;
      localStorage.setItem('user', JSON.stringify(cachedUserObj));

      // Novedad: Guardar los artistas en el perfil de usuario del backend para que no se pierdan al recargar
      await apiCall('neuro', '/api/user/update', 'PUT', { selectedArtists });
      console.log("✅ Artistas actualizados en el perfil de usuario del servidor.");
    }
  } catch (e) {
    console.error("❌ Error al guardar los artistas en el backend:", e);
  }

  setScreen(nextScreen);
};

/**
 * Confirma la calibración de frecuencia: guarda el volumen Hawkins y navega.
 * @param {{ volume: number }} data - Datos de calibración.
 * @returns {Promise<void>}
 */
const handleCalibrationConfirm = async ({ volume }) => {
  const updatedSurvey = { ...(surveyData || {}), volume };
  setSurveyData(updatedSurvey);
  localStorage.setItem('surveyData', JSON.stringify(updatedSurvey));

  try {
    const token = localStorage.getItem('token');
    if (token) {
      const backendPayload = mapSurveyToBackendPayload(updatedSurvey);
      await registerOrUpdateSurvey(backendPayload);
    }
  } catch (e) {
    console.error("Error al guardar calibración en la encuesta:", e);
  }

  const hasArtists = updatedSurvey.artist_interest && updatedSurvey.artist_interest.length > 0;
  if (hasArtists) {
    console.log("🎵 Usuario con artistas. Navegando al Dashboard...");
    navigate('/dashboard');
    await loadPlaylist(null);
  } else {
    console.log("🎨 Sin artistas. Navegando a selección de artistas...");
    navigate('/artists');
  }
};

// Acciones de feedback
/**
 * Procesa feedback del usuario para refrescar recomendaciones.
 * @param {"negative"|"positive"} type - Tipo de feedback.
 * @returns {Promise<void>}
 */
const handleFeedback = async (type, trackToFeedback = null, shouldRegenerate = true) => {
  const track = trackToFeedback || playlist[currentIndex];
  if (!track) return;

  const feedbackVal = type === 'positive' ? true : (type === 'negative' ? false : null);

  // Sincronizar feedback con el backend
  if (track.recommendationId) {
    try {
      console.log(`Sending feedback to backend: recommendationId=${track.recommendationId}, trackId=${track.id}, feedback=${feedbackVal}`);
      await apiCall('neuro', `/api/recommend/feedback/${track.recommendationId}`, 'POST', {
        trackId: track.id,
        feedback: feedbackVal
      });
      // Actualizar la playlist local para reflejar el estado del feedback
      setPlaylist(prev => prev.map(t => t.id === track.id ? { ...t, feedback: feedbackVal } : t));
    } catch (e) {
      console.error("❌ Error al enviar feedback al backend:", e);
    }
  }

  // Feedback local: el backend en producción no expone /api/user/feedback
  if (type === 'negative') {
    try {
      const stored = localStorage.getItem('dislikedTracks');
      const disliked = stored ? JSON.parse(stored) : [];
      if (!disliked.includes(track.id)) {
        disliked.push(track.id);
        localStorage.setItem('dislikedTracks', JSON.stringify(disliked));
      }
    } catch (e) {
      console.error("Error storing disliked track:", e);
    }

    // AQUÍ ESTÁ EL CAMBIO: Solo recargamos si shouldRegenerate es true
    if (shouldRegenerate) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      setIsLoading(true);

      console.log("Refrescando la playlist excluyendo la canción rechazada...");
      await loadPlaylist(surveyData || {});
      setIsPlaying(true);
    } else {
      console.log("Feedback negativo registrado de forma silenciosa. Cambiando de pista...");
    }

  } else {
    console.log("Al usuario le ayuda la pista recomendada:", track.title);
    try {
      const stored = localStorage.getItem('playedTracks');
      const played = stored ? JSON.parse(stored) : [];
      if (!played.includes(track.id)) {
        played.push(track.id);
        localStorage.setItem('playedTracks', JSON.stringify(played));
      }
    } catch (e) {
      console.error("Error al almacenar playedTrack en localStorage:", e);
    }
  }
};

// Callback cuando termina el temporizador
/**
 * Callback cuando termina el temporizador global.
 * @returns {void}
 */
const handleTimerEnd = () => {
  if (userType === 'spotify') {
    SpotifyPlayerWrapper.pause?.();
  }
  setIsPlaying(false);
  alert("¡Sesión finalizada! Tu tiempo de sintonización ha terminado.");
  setScreen('final-evaluation');
};

/**
 * Procesa la accion final de la encuesta de cierre.
 * @param {"new"|"finish"} action - Accion elegida por el usuario.
 * @returns {void}
 */
const handleFinalAction = (action) => {
  if (audioRef.current) {
    audioRef.current.pause();
  }
  if (userType === 'spotify') {
    SpotifyPlayerWrapper.pause?.();
  }
  setIsPlaying(false);
  setProgress(0);

  if (action === 'new') {
    setScreen('initial-evaluation');
  } else {
    setScreen('onboarding');
    setUserType(null);
    setSurveyData(null);
    setPlaylist([]);
    setCurrentIndex(0);

    // Limpiar TODO el localStorage relacionado a la sesión
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('spotifyToken');
    localStorage.removeItem('spotifyRefreshToken');
    localStorage.removeItem('selectedArtists');
    localStorage.removeItem('selectedArtistsData');
  }
};

/**
 * Decide que pantalla renderizar segun el estado actual.
 * @returns {JSX.Element}
 */
const renderScreen = () => {
  switch (screen) {
    case 'onboarding':
      return <Onboarding onLogin={handleLogin} />;
    case 'processing-spotify':
      return (
        <div className="w-100 vh-100 d-flex flex-column align-items-center justify-content-center bg-dark text-white">
          <div className="spinner-border text-success mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
          <h4 className="fw-bold animate-pulse">Conectando con Spotify...</h4>
          <p className="text-muted">Procesando tu sesión segura</p>
        </div>
      );
    case 'initial-evaluation':
      const userObjForSurvey = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {};
      const hasSavedSurvey = (userObjForSurvey.surveys && userObjForSurvey.surveys.length > 0) || !!surveyData;
      return (
        <InitialSurvey
          onSubmit={handleSurveySubmit}
          hideFrequencies={hasSavedSurvey}
          initialData={surveyData}
        />
      );
    case 'calibration':
      return (
        <CalibrationScreen
          initialData={surveyData}
          onSubmit={handleCalibrationConfirm}
        />
      );
    case 'artist-evaluation':
      const userObjTemp = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {};
      const hasSurveyTemp = userObjTemp.surveys && userObjTemp.surveys.length > 0;
      const targetNext = hasSurveyTemp ? 'profile' : 'profile-summary';
      return (
        <ArtistSurvey
          onConfirm={(selectedIds, artistsData) => handleArtistSurveyConfirm(selectedIds, artistsData, targetNext)}
          preselectedArtists={selectedArtistsData}
        />
      );
    case 'dashboard':
      return (
        <Dashboard
          tracks={playlist}
          currentIndex={currentIndex}
          isPlaying={isPlaying}
          progress={progress}
          duration={duration}
          isLoading={isLoading}
          volume={volume}
          onVolumeChange={setVolume}
          onPlayPause={handlePlayPause}
          onNext={() => handleNext(true)}
          onPrev={() => handlePrev(true)}
          onSelectTrack={(idx) => handleSelectTrack(idx, true)}
          onSeek={handleSeek}
          onNavigate={setScreen}
          onFeedback={handleFeedback}
          timeLeft={timeLeft}
          isTimerRunning={isTimerRunning}
          timerDuration={timerDuration}
          onStartPauseTimer={() => setIsTimerRunning(!isTimerRunning)}
          onResetTimer={() => { setIsTimerRunning(false); setTimeLeft(timerDuration * 60); }}
          onSelectTimerPreset={(mins) => { setTimerDuration(mins); setTimeLeft(mins * 60); setIsTimerRunning(false); }}
          analyserNode={analyserNode}
          onShowEmotionalSummary={() => setShowEmotionalSummary(true)}
          surveyData={surveyData}
        />
      );
    case 'profile-summary':
      return (
        <ProfileSummaryScreen
          surveyData={surveyData}
          selectedArtistsData={selectedArtistsData}
          fromOnboarding={true}
          onArtistsSaved={async (ids, data) => {
            setSelectedArtistsData(data);
            localStorage.setItem('selectedArtistsData', JSON.stringify(data));
            try {
              const token = localStorage.getItem('token');
              if (token) {
                console.log("💾 Guardando artistas en el backend...");
                const completeSurvey = {
                  ...surveyData,
                  artist_interest: data.map(a => a.name).filter(Boolean),
                  genres: []
                };
                data.forEach(a => {
                  const artistGenres = Array.isArray(a.genres) ? a.genres : (a.genre ? [a.genre] : []);
                  artistGenres.forEach(g => {
                    if (g && !completeSurvey.genres.includes(g)) completeSurvey.genres.push(g);
                  });
                });
                if (completeSurvey.genres.length === 0) completeSurvey.genres = ["Lofi", "Ambient"];

                const backendPayload = mapSurveyToBackendPayload(completeSurvey);
                const res = await registerOrUpdateSurvey(backendPayload);
                if (res?.surveyId) {
                  completeSurvey._id = res.surveyId;
                }

                setSurveyData(completeSurvey);
                localStorage.setItem('surveyData', JSON.stringify(completeSurvey));

                const cachedUserObj = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {};
                cachedUserObj.selectedArtists = ids;
                localStorage.setItem('user', JSON.stringify(cachedUserObj));
              }
            } catch (e) {
              console.error("❌ Error al guardar artistas en el backend:", e);
            }
          }}
          onContinue={async () => {
            setScreen('dashboard');
            await loadPlaylist(null);
          }}
        />
      );
    case 'profile':
      return (
        <ProfileSummaryScreen
          surveyData={surveyData}
          selectedArtistsData={selectedArtistsData}
          fromOnboarding={false}
          onContinue={() => setScreen('dashboard')}
          onBack={() => setScreen('dashboard')}
          onArtistsSaved={async (ids, data) => {
            setSelectedArtistsData(data);
            localStorage.setItem('selectedArtistsData', JSON.stringify(data));
            try {
              const token = localStorage.getItem('token');
              if (token) {
                console.log("💾 Guardando artistas en el backend...");
                const completeSurvey = {
                  ...surveyData,
                  artist_interest: data.map(a => a.name).filter(Boolean),
                  genres: []
                };
                data.forEach(a => {
                  const artistGenres = Array.isArray(a.genres) ? a.genres : (a.genre ? [a.genre] : []);
                  artistGenres.forEach(g => {
                    if (g && !completeSurvey.genres.includes(g)) completeSurvey.genres.push(g);
                  });
                });
                if (completeSurvey.genres.length === 0) completeSurvey.genres = ["Lofi", "Ambient"];

                const backendPayload = mapSurveyToBackendPayload(completeSurvey);
                const res = await registerOrUpdateSurvey(backendPayload);
                if (res?.surveyId) {
                  completeSurvey._id = res.surveyId;
                }

                setSurveyData(completeSurvey);
                localStorage.setItem('surveyData', JSON.stringify(completeSurvey));

                const cachedUserObj = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {};
                cachedUserObj.selectedArtists = ids;
                localStorage.setItem('user', JSON.stringify(cachedUserObj));
              }
            } catch (e) {
              console.error("❌ Error al guardar artistas en el backend:", e);
            }
          }}
        />
      );
    case 'settings':
      return (
        <SettingsScreen
          onNavigate={setScreen}
          onLogout={() => handleFinalAction('finish')}
          targetEmotion={targetEmotion}
          surveyData={surveyData}
          selectedArtistsData={selectedArtistsData}
          onEmotionChange={(emo) => {
            setTargetEmotion(emo);
            setThemeMode('manual');
          }}
          themeMode={themeMode}
          onThemeModeChange={setThemeMode}
        />
      );
    case 'final-evaluation':
      return (
        <FinalSurvey
          initialStress={initialStress}
          onAction={handleFinalAction}
          onNavigate={setScreen}
        />
      );
    case 'register':
      return <Onboarding onLogin={handleLogin} initialMode="register" />;
    case 'onboarding':
    default:
      return <Onboarding onLogin={handleLogin} initialMode="select" />;
  }
};

// Determina el tema activo segun modo auto/manual
const currentTrack = playlist[currentIndex] || null;

// Mantiene onboarding y encuestas neutros (gris)
const onboardingScreens = ['onboarding', 'initial-evaluation', 'artist-evaluation', 'profile-summary', 'calibration'];
const isOnboarding = onboardingScreens.includes(screen);

const activeThemeKey = isOnboarding
  ? 'gris'
  : themeMode === 'manual'
    ? targetEmotion
    : currentTrack
      ? getTrackThemeKey(currentTrack)
      : targetEmotion;

const theme = emotionThemes[activeThemeKey] || emotionThemes.gris;

// Genera estilos inline para overrides de Bootstrap y brillos ambientales
const themeStyle = `
    :root {
      --bs-primary: ${theme.primary} !important;
      --bs-primary-rgb: ${theme.primaryRgb} !important;
      --bs-primary-bg-subtle: ${theme.bgSubtle} !important;
      --bs-primary-border-subtle: ${theme.borderSubtle} !important;
      --theme-glow-1: ${theme.glow1} !important;
      --theme-glow-2: ${theme.glow2} !important;
    }
    body, .bg-surface, .bg-background, #root {
      background-color: ${theme.bgSubtle} !important;
      transition: background-color 0.8s ease-in-out !important;
    }
    .btn-primary {
      background-color: var(--bs-primary) !important;
      border-color: var(--bs-primary) !important;
    }
    .btn-outline-primary {
      color: var(--bs-primary) !important;
      border-color: var(--bs-primary) !important;
    }
    .text-primary {
      color: var(--bs-primary) !important;
    }
    .progress-bar {
      background-color: var(--bs-primary) !important;
    }
    .border-primary {
      border-color: var(--bs-primary) !important;
    }
    .bg-primary-container {
      background-color: var(--bs-primary-bg-subtle) !important;
    }
    .ambient-glow {
      background: radial-gradient(circle, var(--theme-glow-1) 0%, transparent 70%) !important;
      transition: background 0.8s ease-in-out !important;
    }
    .ambient-glow-bottom {
      background: radial-gradient(circle, var(--theme-glow-2) 0%, transparent 70%) !important;
      transition: background 0.8s ease-in-out !important;
    }
  `;

const mainScreens = ['dashboard', 'music-code', 'timer', 'settings', 'final-evaluation', 'profile'];
const showSidebar = mainScreens.includes(screen);

if (showSidebar) {
  return (
    <div className="d-flex flex-column flex-md-row vh-100 w-100 position-relative overflow-hidden">
      <style>{themeStyle}</style>

      {/* Background Ambient Glows */}
      <div className="ambient-glow" />
      <div className="ambient-glow-bottom" />

      {/* Left Sidebar */}
      <Sidebar
        activeTab={screen}
        onTabChange={setScreen}
        targetEmotion={targetEmotion}
        onEmotionChange={(emo) => {
          setTargetEmotion(emo);
          setThemeMode('manual');
        }}
        themeMode={themeMode}
        onThemeModeChange={setThemeMode}
      />

      {/* Main Content Area - Locked Height, Independently Scrollable */}
      <div className="flex-grow-1 h-100 overflow-y-auto d-flex flex-column align-items-center justify-content-start p-4 position-relative z-1">
        <MouseGradient />
        {renderScreen()}
      </div>

      {/* Modal de Resumen de Estado Emocional */}
      {showEmotionalSummary && surveyData && (
        <EmotionalSummaryModal
          surveyData={surveyData}
          onClose={() => setShowEmotionalSummary(false)}
          onUpdateSurvey={handleUpdateSurveyInline}
        />
      )}
    </div>
  );
}

return (
  <div className="w-full min-h-screen flex flex-col items-center justify-center bg-surface text-on-surface position-relative overflow-hidden">
    <style>{themeStyle}</style>
    <div className="ambient-glow" />
    <div className="ambient-glow-bottom" />
    <div className="position-relative z-1 w-full flex-1 flex flex-col items-center justify-center">
      <MouseGradient />
      {renderScreen()}
    </div>
  </div>
);
}

/**
 * Componente modal para mostrar el resumen del estado emocional.
 */
const EmotionalSummaryModal = ({ surveyData, onClose, onUpdateSurvey }) => {
  const [comoSiente, setComoSiente] = useState(() => surveyData.comoSiente || 3);
  const [comoQuiere, setComoQuiere] = useState(() => surveyData.comoQuiere || 5);
  const [isSaving, setIsSaving] = useState(false);

  const labelsSientes = ["Triste", "Algo Triste", "Neutral", "Algo Feliz", "Feliz"];
  const labelsQuieres = ["Triste", "Algo Triste", "Neutral", "Algo Feliz", "Feliz"];

  const nodesSientes = [
    { value: 1, icon: 'sentiment_very_dissatisfied' },
    { value: 2, icon: 'sentiment_dissatisfied' },
    { value: 3, icon: 'sentiment_neutral' },
    { value: 4, icon: 'sentiment_satisfied' },
    { value: 5, icon: 'sentiment_very_satisfied' }
  ];

  const nodesQuieres = [
    { value: 1, icon: 'sentiment_very_dissatisfied' },
    { value: 2, icon: 'sentiment_dissatisfied' },
    { value: 3, icon: 'sentiment_neutral' },
    { value: 4, icon: 'sentiment_satisfied' },
    { value: 5, icon: 'sentiment_very_satisfied' }
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateSurvey(comoSiente, comoQuiere);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 backdrop-blur-sm animate-fade-in animate-fade-in-up" style={{ zIndex: 10000 }}>
      <div className="bg-white bg-opacity-95 rounded-4 p-4 shadow-lg border border-light-subtle max-w-[420px] w-100 mx-3 text-start animate-fade-in-up">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3">
          <div className="d-flex align-items-center gap-2">
            <span className="material-symbols-outlined notranslate text-primary fs-4" translate="no">psychology</span>
            <h3 className="h6 fw-bold mb-0 text-dark">Actualizar Estado Emocional</h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-link p-0 text-muted border-0 animate-scale-up"
          >
            <span className="material-symbols-outlined notranslate" translate="no">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="d-flex flex-column gap-3 mb-4">
          {/* Slider Cómo te sientes */}
          <div className="bg-light bg-opacity-75 p-3 rounded-3 border border-light-subtle shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-dark fw-bold" style={{ fontSize: '12px' }}>¿Cómo te sientes ahora?</span>
              <span className="badge bg-primary text-white" style={{ fontSize: '11px' }}>
                {labelsSientes[comoSiente - 1]}
              </span>
            </div>
            <div className="py-2">
              <Slider
                mode="likert"
                value={comoSiente}
                onChange={setComoSiente}
                nodes={nodesSientes}
              />
            </div>
            <div className="d-flex justify-content-between text-muted mt-1 px-1" style={{ fontSize: '10px' }}>
              <span>Triste</span>
              <span>Feliz</span>
            </div>
          </div>

          {/* Slider Cómo te quieres sentir */}
          <div className="bg-light bg-opacity-75 p-3 rounded-3 border border-light-subtle shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-dark fw-bold" style={{ fontSize: '12px' }}>¿Cómo te quieres sentir?</span>
              <span className="badge bg-primary text-white" style={{ fontSize: '11px' }}>
                {labelsQuieres[comoQuiere - 1]}
              </span>
            </div>
            <div className="py-2">
              <Slider
                mode="likert"
                value={comoQuiere}
                onChange={setComoQuiere}
                nodes={nodesQuieres}
              />
            </div>
            <div className="d-flex justify-content-between text-muted mt-1 px-1" style={{ fontSize: '10px' }}>
              <span>Triste</span>
              <span>Feliz</span>
            </div>
          </div>

          {/* Calibración de Frecuencia Hawkins */}
          {surveyData.volume !== undefined && (
            <div className="d-flex align-items-center justify-content-between bg-light bg-opacity-75 p-3 rounded-3 border border-light-subtle shadow-sm">
              <div>
                <span className="text-muted d-block" style={{ fontSize: '11px' }}>Frecuencia Calibrada:</span>
                <span className="fw-bold text-dark" style={{ fontSize: '14px' }}>
                  {surveyData.volume} Hz
                </span>
              </div>
              <span className="material-symbols-outlined notranslate text-primary fs-3" translate="no">
                graphic_eq
              </span>
            </div>
          )}
        </div>

        {/* Action */}
        <div className="d-flex gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn btn-primary w-100 py-2.5 rounded-pill fw-semibold d-flex align-items-center justify-content-center gap-2"
          >
            {isSaving ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: '18px' }}>check_circle</span>
            )}
            <span>{isSaving ? "Guardando..." : "Guardar y Sintonizar"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <MainApp />
    </BrowserRouter>
  );
}
