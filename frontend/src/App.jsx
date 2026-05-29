import React, { useState, useEffect, useRef } from 'react';
import Onboarding from './components/screens/Onboarding';
import InitialSurvey from './components/screens/InitialSurvey';
import ArtistSurvey from './components/screens/ArtistSurvey';
import Calibration from './components/screens/Calibration';
import Dashboard from './components/screens/Dashboard';
import FinalSurvey from './components/screens/FinalSurvey';
import TimerScreen from './components/screens/TimerScreen';
import SettingsScreen from './components/screens/SettingsScreen';
import Sidebar from './components/common/Sidebar';
import { generateHybridPlaylist } from './engine/NECv2.js';

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
  }
};

const getTrackThemeKey = (track) => {
  if (!track || !track.genre) return 'calma';
  const genreLower = track.genre.toLowerCase();
  if (genreLower.includes('calma')) return 'calma';
  if (genreLower.includes('foco') || genreLower.includes('concentracion') || genreLower.includes('trabajo')) return 'foco';
  if (genreLower.includes('zen') || genreLower.includes('atmosfera') || genreLower.includes('meditacion')) return 'zen';
  return 'relajacion';
};

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

function App() {
  // Navigation & Session
  const [screen, setScreen] = useState('onboarding');
  const [targetEmotion, setTargetEmotion] = useState('gris');
  const [themeMode, setThemeMode] = useState('auto');
  const [userType, setUserType] = useState(null); // 'spotify' | 'guest'
  const [surveyData, setSurveyData] = useState(null);
  const [volume, setVolume] = useState(45);
  const [initialStress, setInitialStress] = useState(8);

  // Persistent Audio State
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef(null);

  // Check Spotify OAuth callback on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      if (token) {
        localStorage.setItem('spotifyToken', token);
        window.history.replaceState(null, null, ' ');
        setUserType('spotify');
        setScreen('initial-evaluation');
      }
    }
  }, []);

  // Initialize persistent Audio object
  useEffect(() => {
    audioRef.current = new Audio();

    const onTimeUpdate = () => {
      setProgress(audioRef.current.currentTime);
    };

    const onLoadedMetadata = () => {
      setDuration(audioRef.current.duration || 30);
      setIsLoading(false);
    };

    const onEnded = () => {
      handleNext();
    };

    audioRef.current.addEventListener('timeupdate', onTimeUpdate);
    audioRef.current.addEventListener('loadedmetadata', onLoadedMetadata);
    audioRef.current.addEventListener('ended', onEnded);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('timeupdate', onTimeUpdate);
        audioRef.current.removeEventListener('loadedmetadata', onLoadedMetadata);
        audioRef.current.removeEventListener('ended', onEnded);
      }
    };
  }, [currentIndex, playlist]);

  // Synchronize Audio Playback
  useEffect(() => {
    if (!audioRef.current || playlist.length === 0) return;
    const currentTrack = playlist[currentIndex];
    if (!currentTrack) return;

    const src = currentTrack.preview_url || currentTrack.src;
    if (src) {
      if (audioRef.current.src !== src) {
        setIsLoading(true);
        audioRef.current.src = src;
        audioRef.current.load();
      } else {
        setIsLoading(false);
      }

      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.warn("Autoplay blocked:", err);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentIndex, playlist, isPlaying]);

  // Audio Handlers
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (playlist.length === 0) return;
    setIsLoading(true);
    setCurrentIndex((prev) => (prev + 1) % playlist.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (playlist.length === 0) return;
    setIsLoading(true);
    setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
  };

  const handleSelectTrack = (index) => {
    if (index === currentIndex) {
      setIsPlaying(!isPlaying);
      return;
    }
    setIsLoading(true);
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const handleSeek = (val) => {
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setProgress(val);
    }
  };

  // Login & Onboarding
  const handleLogin = (type) => {
    setUserType(type);
    setScreen('initial-evaluation');
  };

  const handleSurveySubmit = (data) => {
    setSurveyData(data);
    setInitialStress(data.estres * 2);
    
    // Smart default emotion mapping based on user stress level
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
    
    setScreen('artist-survey');
  };

  // Generate & load playlist
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

  const handleCalibrationConfirm = async (volVal) => {
    setVolume(volVal);
    setScreen('dashboard');

    const surveyObj = surveyData || { emotion: 'calma', genres: ['ambient', 'pop'], estres: 3 };
    await loadPlaylist(surveyObj);
  };

  // Feedback triggers
  const handleFeedback = async (type) => {
    if (type === 'negative') {
      // Refresh playlist by modifying query criteria slightly for better match
      console.log("Refreshing playlist with altered parameters...");
      const modifiedSurvey = {
        ...surveyData,
        emotion: surveyData?.emotion === 'calma' ? 'relajación' : 'calma',
        genres: surveyData?.genres ? [...surveyData.genres].reverse() : ['ambient', 'classical']
      };
      await loadPlaylist(modifiedSurvey);
    } else {
      console.log("User likes the track recommendation!");
    }
  };

  // Timer complete callback
  const handleTimerEnd = () => {
    setIsPlaying(false);
    alert("¡Sesión finalizada! Tu tiempo de sintonización ha terminado.");
    setScreen('final-evaluation');
  };

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
    }
  };

  const renderScreen = () => {
    switch (screen) {
      case 'onboarding':
        return <Onboarding onLogin={handleLogin} />;
      case 'initial-evaluation':
        return (
          <InitialSurvey 
            onSubmit={handleSurveySubmit} 
            onBack={() => setScreen('onboarding')}
          />
        );
      case 'artist-survey':
        return (
          <ArtistSurvey 
            onConfirm={(selectedArtists) => {
              setSurveyData(prev => ({ ...prev, selectedArtists }));
              setScreen('calibration');
            }}
            onBack={() => setScreen('initial-evaluation')}
          />
        );
      case 'calibration':
        return (
          <Calibration 
            onConfirm={handleCalibrationConfirm} 
            onBack={() => setScreen('artist-survey')}
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
            onPlayPause={handlePlayPause}
            onNext={handleNext}
            onPrev={handlePrev}
            onSelectTrack={handleSelectTrack}
            onSeek={handleSeek}
            onNavigate={setScreen}
            onFeedback={handleFeedback}
          />
        );
      case 'timer':
        return (
          <TimerScreen
            onTimerEnd={handleTimerEnd}
            onNavigate={setScreen}
          />
        );
      case 'settings':
        return (
          <SettingsScreen 
            onNavigate={setScreen} 
            onLogout={() => handleFinalAction('finish')} 
            targetEmotion={targetEmotion}
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

  // Determine active theme based on auto/manual state
  const currentTrack = playlist[currentIndex] || null;

  // Keep onboarding, survey and calibration fully neutral (gray)
  const onboardingScreens = ['onboarding', 'initial-evaluation', 'artist-survey', 'calibration'];
  const isOnboarding = onboardingScreens.includes(screen);

  const activeThemeKey = isOnboarding 
    ? 'gris' 
    : (themeMode === 'auto' && currentTrack) 
      ? getTrackThemeKey(currentTrack) 
      : targetEmotion;

  const theme = emotionThemes[activeThemeKey] || emotionThemes.gris;

  // Custom inline style generator for Bootstrap CSS overrides and ambient glows
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

  const mainScreens = ['dashboard', 'timer', 'settings', 'final-evaluation'];
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

export default App;
