import React, { useState, useEffect, useRef } from 'react';
import Onboarding from './components/screens/Onboarding';
import InitialSurvey from './components/screens/InitialSurvey';
import ArtistSurvey from './components/screens/ArtistSurvey';
import ProfileSummaryScreen from './components/screens/ProfileSummaryScreen';
import Dashboard from './components/screens/Dashboard';
import FinalSurvey from './components/screens/FinalSurvey';
import SettingsScreen from './components/screens/SettingsScreen';
import Sidebar from './components/common/Sidebar';
import { generateHybridPlaylist, processTrackOnDemand, mapSurveyToBackendPayload } from './engine/NECv2.js';
import { apiCall } from './utils/fetch.js';
import Slider from './components/common/Slider';

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
    preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
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
    preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
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
    preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
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
    preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
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
function App() {
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

  // Navegacion y sesion
  const [screen, setScreen] = useState(() => {
    const token = localStorage.getItem('token');
    const spotifyToken = localStorage.getItem('spotifyToken');
    if (token || spotifyToken) {
      const userCached = localStorage.getItem('user');
      if (userCached) {
        try {
          const userObj = JSON.parse(userCached);
          const hasSurvey = userObj.surveys && userObj.surveys.length > 0;
          const hasArtists = userObj.selectedArtists && userObj.selectedArtists.length > 0;
          if (hasSurvey && hasArtists) {
            return 'dashboard';
          } else if (hasSurvey) {
            return 'artist-evaluation';
          }
        } catch (e) {
          console.error(e);
        }
      }
      const survey = localStorage.getItem('surveyData');
      if (survey) {
        return 'dashboard';
      }
      return 'initial-evaluation';
    }
    return 'onboarding';
  });
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

  // Sincronizar el perfil del usuario desde el backend al montar el componente
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
            
            // Sincronizar encuestas si existen
            if (userObj.surveys && userObj.surveys.length > 0) {
              const lastSurvey = userObj.surveys[userObj.surveys.length - 1];
              setSurveyData(lastSurvey);
              localStorage.setItem('surveyData', JSON.stringify(lastSurvey));
            }
            
            // Sincronizar artistas seleccionados y sus datos completos
            if (userObj.selectedArtists && userObj.selectedArtists.length > 0) {
              localStorage.setItem('selectedArtists', JSON.stringify(userObj.selectedArtists));
              
              // Cargar detalles de los artistas seleccionados
              const artistsDetails = await apiCall('neuro', `/api/artists?ids=${userObj.selectedArtists.join(',')}`, 'GET');
              if (artistsDetails && artistsDetails.success && artistsDetails.data) {
                localStorage.setItem('selectedArtistsData', JSON.stringify(artistsDetails.data));
                setSelectedArtistsData(artistsDetails.data);
              }
            }
          }
        } catch (e) {
          console.error("❌ Error al sincronizar el perfil en el montaje:", e);
        }
      }
    };
    loadProfileAndSync();
  }, []);

  // Carga automática de playlist si se recarga la página directo en el Dashboard
  useEffect(() => {
    if (screen === 'dashboard' && playlist.length === 0) {
      console.log("🔄 Carga automática de playlist al recargar en Dashboard...");
      loadPlaylist(surveyData || {});
    }
  }, [screen, playlist.length, surveyData]);

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
  }, [volume]);

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
  }, [isTimerRunning]);

  // Verifica el callback OAuth de Spotify (PKCE) al montar
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code  = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('❌ Spotify rechazó la autenticación:', error);
      window.history.replaceState(null, null, '/');
      return;
    }

    if (!code) return; // No hay código → primera carga normal

    const verifier = localStorage.getItem('spotifyCodeVerifier');
    if (!verifier) {
      console.error('❌ No se encontró code_verifier en localStorage');
      window.history.replaceState(null, null, '/');
      return;
    }

    // Limpiar la URL para que no se vuelva a procesar
    window.history.replaceState(null, null, '/');
    localStorage.removeItem('spotifyCodeVerifier');

    const exchangeAndSync = async () => {
      try {
        console.log('🔄 Intercambiando código PKCE por access_token de Spotify...');

        // 1. Intercambio de código → token (PKCE, sin client_secret)
        const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id:     'f5e7f1f0a25642a8a1d7f57561f7db91',
            grant_type:    'authorization_code',
            code,
            redirect_uri:  window.location.origin + '/',
            code_verifier: verifier
          })
        });

        if (!tokenRes.ok) {
          const errBody = await tokenRes.json().catch(() => ({}));
          throw new Error(errBody.error_description || `Token exchange failed: ${tokenRes.status}`);
        }

        const tokenData = await tokenRes.json();
        const accessToken  = tokenData.access_token;
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
          return;
        }

        // No hay sesión local: obtener perfil de Spotify y crear cuenta
        const meRes = await fetch('https://api.spotify.com/v1/me', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (meRes.ok) {
          const spotifyUser = await meRes.json();
          const spotifyEmail = spotifyUser.email || `spotify_${spotifyUser.id}@neurosound.com`;
          const names    = (spotifyUser.display_name || 'Spotify User').split(' ');
          const name     = names[0] || 'Spotify';
          const lastName = names.slice(1).join(' ') || 'User';
          const password = `spotify_secret_2026_${spotifyUser.id}`;

          // Registrar usuario (si ya existe, ignoramos el error)
          try {
            await apiCall('neuro', '/api/user/register', 'POST', {
              name, last_name: lastName, email: spotifyEmail, password
            });
            console.log('✅ Usuario de Spotify registrado en base de datos local.');
          } catch (regErr) {
            console.log('ℹ️ Usuario ya existente o error leve de registro:', regErr.message);
          }

          // Iniciar sesión local para obtener JWT
          const loginRes = await apiCall('neuro', '/api/auth/login', 'POST', {
            email: spotifyEmail, password
          });

          if (loginRes?.success) {
            localStorage.setItem('token', loginRes.data.token);
            if (loginRes.data.user) {
              localStorage.setItem('user', JSON.stringify(loginRes.data.user));
            }
            console.log('✅ Sesión local iniciada para el usuario de Spotify.');
          }
        }
      } catch (e) {
        console.error('❌ Error en el flujo PKCE de Spotify:', e);
      } finally {
        setUserType('spotify');
        setScreen('initial-evaluation');
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
  }, [currentIndex, playlist, surveyData]);

  // Sincroniza la reproduccion de audio
  useEffect(() => {
    if (!audioRef.current || playlist.length === 0) return;
    const currentTrack = playlist[currentIndex];
    if (!currentTrack) return;

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
  }, [currentIndex, playlist, isPlaying, volume]);

  // Handlers de audio
  /**
   * Alterna reproduccion/pausa del audio.
   * @returns {void}
   */
  const handlePlayPause = () => {
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

    // Procesar feedback de sintonización según tiempo antes de cambiar
    if (isManual && currentTrack) {
      if (progress < 60) {
        await handleFeedback('negative', currentTrack);
        return; // handleFeedback ya recarga y reproduce la nueva playlist
      } else {
        await handleFeedback('positive', currentTrack);
      }
    } else if (!isManual && currentTrack) {
      await handleFeedback('positive', currentTrack);
    }

    // Verificar si se alcanzó el fin de la playlist actual
    if (currentIndex === playlist.length - 1) {
      console.log("🏁 Fin de la playlist. Cargando siguiente tanda de recomendaciones...");
      setIsPlaying(false);
      setIsLoading(true);
      await loadPlaylist(surveyData || {});
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
    setCurrentIndex((prev) => prev + 1);
    setIsPlaying(true);
  };

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
        await handleFeedback('negative', currentTrack);
        return;
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
    setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
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
        await handleFeedback('negative', currentTrack);
        return;
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
    setIsPlaying(true);
  };

  /**
   * Actualiza el tiempo de reproduccion.
   * @param {number} val - Tiempo destino en segundos.
   * @returns {void}
   */
  const handleSeek = (val) => {
    if (audioRef.current) {
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
    if (user) {
      const hasSurvey  = user.surveys && user.surveys.length > 0;
      const hasArtists = user.selectedArtists && user.selectedArtists.length > 0;

      if (hasSurvey) {
        const lastSurvey = user.surveys[user.surveys.length - 1];
        setSurveyData(lastSurvey);
        localStorage.setItem('surveyData', JSON.stringify(lastSurvey));
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
   * Guarda la encuesta inicial y define emocion/volumen base.
   * @param {Object} data - Datos de encuesta.
   * @returns {void}
   */
  const handleSurveySubmit = async (data) => {
    setSurveyData(data);
    setInitialStress(data.estres * 2);

    // Guardar encuesta en el backend para el usuario autenticado
    try {
      const token = localStorage.getItem('token');
      if (token) {
        console.log("💾 Registrando encuesta en el backend...");
        const backendPayload = mapSurveyToBackendPayload(data);
        await apiCall('neuro', '/api/survey/register', 'POST', backendPayload);
        console.log("✅ Encuesta registrada exitosamente en base de datos.");
      }
    } catch (e) {
      console.error("❌ Error al guardar encuesta en backend:", e);
    }

    // Emocion por defecto segun nivel de estres
    let defaultEmotion = 'calma';
    if (data.ansiedad >= data.estres && data.ansiedad >= data.tristeza) {
      defaultEmotion = 'calma';
    } else if (data.tristeza > data.ansiedad && data.tristeza > data.estres) {
      defaultEmotion = 'zen';
    } else {
      defaultEmotion = 'relajacion';
    }
    setTargetEmotion(defaultEmotion);
    setThemeMode('auto');

    // Si el usuario ya tiene artistas guardados → ir directo al Dashboard
    const cachedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    const hasArtists = cachedUser?.selectedArtists && cachedUser.selectedArtists.length > 0;

    if (hasArtists) {
      // Usuario recurrente: usar sus preferencias guardadas y cargar playlist directamente
      console.log("🎵 Usuario con artistas guardados. Cargando playlist directamente al Dashboard...");
      setScreen('dashboard');
      await loadPlaylist(data);
    } else {
      // Primera vez: completar el flujo de selección de artistas
      setScreen('artist-evaluation');
    }
  };

  /**
   * Actualiza el estado emocional del usuario directamente desde el modal.
   */
  const handleUpdateSurveyInline = async (sienteVal, quiereVal) => {
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
      ansiedad: ansiedadMapped,
      estres: estresMapped,
      tristeza: tristezaMapped,
      volume: currentFrequency,
      comoSiente: sienteVal,
      comoQuiere: quiereVal,
      emotion: targetEmo
    };

    setSurveyData(updatedData);
    setInitialStress(estresMapped * 2);
    setTargetEmotion(targetEmo);
    setThemeMode('auto');

    try {
      const token = localStorage.getItem('token');
      if (token) {
        console.log("💾 Actualizando encuesta inline en el backend...");
        const backendPayload = mapSurveyToBackendPayload(updatedData);
        await apiCall('neuro', '/api/survey/register', 'POST', backendPayload);
        console.log("✅ Encuesta inline guardada en base de datos.");
      }
    } catch (e) {
      console.error("❌ Error al guardar encuesta inline:", e);
    }

    await loadPlaylist(updatedData);
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
      const token = localStorage.getItem('spotifyToken') || 'mock-spotify-token';
      const result = await generateHybridPlaylist(token, survey);
      if (result && result.length > 0) {
        setPlaylist(result);
      } else {
        console.warn("⚠️ API de NeuroSound no responde. Activando playlist de respaldo local.");
        setPlaylist(fallbackPlaylist);
      }
      setCurrentIndex(0);
    } catch (e) {
      console.error("Error loading playlist, using fallback:", e);
      setPlaylist(fallbackPlaylist);
      setCurrentIndex(0);
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
        const backendPayload = mapSurveyToBackendPayload(surveyData);
        await apiCall('neuro', '/api/survey/register', 'POST', backendPayload);
        console.log("✅ Artistas guardados exitosamente en la base de datos.");
        
        // Actualizar el objeto de usuario local
        const cachedUserObj = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {};
        cachedUserObj.selectedArtists = selectedArtists;
        localStorage.setItem('user', JSON.stringify(cachedUserObj));
      }
    } catch (e) {
      console.error("❌ Error al guardar los artistas en el backend:", e);
    }
    
    setScreen(nextScreen);
  };

  // Acciones de feedback
  /**
   * Procesa feedback del usuario para refrescar recomendaciones.
   * @param {"negative"|"positive"} type - Tipo de feedback.
   * @returns {Promise<void>}
   */
  const handleFeedback = async (type, trackToFeedback = null) => {
    const track = trackToFeedback || playlist[currentIndex];
    if (!track) return;

    // Enviar feedback al backend
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await apiCall('neuro', '/api/user/feedback', 'POST', { trackId: track.id, type });
      }
    } catch (e) {
      console.error("❌ Error al registrar feedback en el backend:", e);
    }

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
      
      // Detener audio actual y marcar cargando
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      setIsLoading(true);

      console.log("Refrescando la playlist excluyendo la canción rechazada...");
      // Recargar la playlist con la misma encuesta (que enviará dislikedTracks en el payload)
      await loadPlaylist(surveyData || {});
      
      // Reproducir de forma automática la nueva lista
      setIsPlaying(true);
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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
                  const backendPayload = mapSurveyToBackendPayload(surveyData);
                  await apiCall('neuro', '/api/survey/register', 'POST', backendPayload);
                  console.log("✅ Artistas guardados exitosamente en el backend.");
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
              const surveyObj = surveyData || { emotion: 'calma', genres: ['ambient', 'pop'], estres: 3 };
              await loadPlaylist(surveyObj);
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
                  const backendPayload = mapSurveyToBackendPayload(surveyData);
                  await apiCall('neuro', '/api/survey/register', 'POST', backendPayload);
                  console.log("✅ Artistas guardados exitosamente en el backend.");
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
      default:
        return <Onboarding onLogin={handleLogin} />;
    }
  };

  // Determina el tema activo segun modo auto/manual
  const currentTrack = playlist[currentIndex] || null;

  // Mantiene onboarding y encuestas neutros (gris)
  const onboardingScreens = ['onboarding', 'initial-evaluation', 'artist-evaluation', 'profile-summary'];
  const isOnboarding = onboardingScreens.includes(screen);

  const activeThemeKey = isOnboarding
    ? 'gris'
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
        <div className="flex-grow-1 h-100 overflow-y-auto d-flex flex-column align-items-center justify-content-start p-4 relative z-1">
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
      <div className="position-relative z-1 w-full flex flex-col items-center justify-center">
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

export default App;
