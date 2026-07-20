import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../common/Button';
import spotifyLogo from '../../assets/logos/Spotify_logo_without_text.svg';
import CryptoJS from 'crypto-js';
import { apiCall } from '../../utils/fetch.js';

const Onboarding = ({ onLogin, initialMode = 'select' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState(initialMode); // 'select' | 'login' | 'register'

  // Estados con persistencia en sessionStorage
  const [email, setEmail] = useState(() => sessionStorage.getItem('onboarding_email') || '');
  const [password, setPassword] = useState(() => sessionStorage.getItem('onboarding_password') || '');
  const [confirmPassword, setConfirmPassword] = useState(() => sessionStorage.getItem('onboarding_confirmPassword') || '');
  const [name, setName] = useState(() => sessionStorage.getItem('onboarding_name') || '');
  const [lastName, setLastName] = useState(() => sessionStorage.getItem('onboarding_lastName') || '');

  // Guardar en sessionStorage automáticamente al cambiar
  useEffect(() => {
    sessionStorage.setItem('onboarding_email', email);
    sessionStorage.setItem('onboarding_password', password);
    sessionStorage.setItem('onboarding_confirmPassword', confirmPassword);
    sessionStorage.setItem('onboarding_name', name);
    sessionStorage.setItem('onboarding_lastName', lastName);
  }, [email, password, confirmPassword, name, lastName]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Leer errores pasados por navegación
  useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error);
      // Limpiar el estado de ubicación para no mostrar el error repetidamente al cambiar de modo
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleTraditionalLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, ingresa correo y contraseña.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await apiCall('neuro', '/api/auth/login', 'POST', { email, password });
      if (response && response.success) {
        // Save the token and user
        localStorage.setItem('token', response.data.token);
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        clearStorage();
        onLogin('traditional', response.data.user);
      } else {
        setError(response?.message || 'Error al iniciar sesión.');
      }
    } catch (err) {
      setError(err.message || 'Error en el servidor de autenticación.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !lastName || !email || !password || !confirmPassword) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // 1. Register user
      const regResponse = await apiCall('neuro', '/api/user/register', 'POST', {
        name,
        last_name: lastName,
        email,
        password
      });

      if (regResponse && regResponse.success) {
        // 2. Automate login on success
        const loginResponse = await apiCall('neuro', '/api/auth/login', 'POST', { email, password });
        if (loginResponse && loginResponse.success) {
          localStorage.setItem('token', loginResponse.data.token);
          if (loginResponse.data.user) {
            localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
          }
          clearStorage();
          onLogin('traditional', loginResponse.data.user);
        } else {
          // If auto-login fails, redirect to login mode
          setMode('login');
          setError('Registro exitoso. Inicia sesión con tus credenciales.');
        }
      } else {
        setError(regResponse?.message || 'Error al registrar usuario.');
      }
    } catch (err) {
      setError(err.message || 'Error en el registro del usuario.');
    } finally {
      setLoading(false);
    }
  };

  const handleSpotifyLogin = async () => {
    const clientId = 'f94cd594219c4d11abc5a2ab15472b9c';
    const redirectUri = 'http://127.0.0.1:5173/callback';
    const scopes = ['user-read-private', 'user-read-email', 'user-modify-playback-state', 'user-read-playback-state', 'streaming'].join(' ');

    const generateCodeVerifier = (length = 128) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
      let result = '';
      try {
        const arr = new Uint8Array(length);
        crypto.getRandomValues(arr);
        result = Array.from(arr).map(v => chars[v % chars.length]).join('');
      } catch (e) {
        // Fallback para HTTP en LAN
        for (let i = 0; i < length; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
      }
      return result;
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

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
  };

  const clearStorage = () => {
    sessionStorage.removeItem('onboarding_email');
    sessionStorage.removeItem('onboarding_password');
    sessionStorage.removeItem('onboarding_confirmPassword');
    sessionStorage.removeItem('onboarding_name');
    sessionStorage.removeItem('onboarding_lastName');
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setLastName('');
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    clearStorage();
  };

  return (
    <div className="min-vh-100 position-relative d-flex flex-column align-items-center justify-content-start w-100 bg-surface pb-5" style={{ paddingTop: '5vh', overflowY: 'auto' }}>
      {/* Ambient Background Effects */}
      <div className="ambient-glow" />
      <div className="ambient-glow-bottom" />

      <main className="position-relative z-3 w-100 d-flex flex-column align-items-center justify-content-center text-center p-4" style={{ maxWidth: '600px' }}>
        {/* Logo Section */}
        <div className="mb-4 d-flex flex-column align-items-center animate-fade-in-up">
          <div className="rounded-circle bg-light d-flex align-items-center justify-content-center mb-3 shadow-sm border border-light-subtle" style={{ width: '120px', height: '120px' }}>
            <img src="/favicon.svg" alt="NeuroSound Logo" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
          </div>
          <h1 className="h2 text-primary fw-bold mb-1" style={{ fontSize: '32px' }}>
            NeuroSound
          </h1>
          <p className="text-secondary fw-normal mb-0" style={{ fontSize: '15px' }}>
            Tu sintonía personal para el bienestar emocional.
          </p>
        </div>

        {/* 1. SELECT MODE */}
        {mode === 'select' && (
          <div className="w-100 d-flex flex-column gap-3 animate-fade-in-up" style={{ maxWidth: '420px' }}>
            {/* Traditional Login Option */}
            <Button
              onClick={() => { setMode('login'); navigate('/login', { replace: true }); resetForm(); }}
              className="w-100 py-3.5 fs-5 fw-semibold"
              variant="outline"
            >
              Iniciar Sesión
            </Button>

            {
              <div className="position-relative w-100">
                <Button
                  onClick={handleSpotifyLogin}
                  className="w-100 py-3.5"
                  style={{ backgroundColor: '#1DB954', borderColor: '#1DB954', color: '#ffffff' }}
                >
                  <span className="d-inline-flex align-items-center gap-2 justify-content-center">
                    <img
                      src={spotifyLogo}
                      alt="Spotify Logo"
                      style={{ width: '22px', height: '22px' }}
                    />
                    <span className="d-flex flex-column align-items-center" style={{ lineHeight: '1.2' }}>
                      <span className="fs-5 fw-semibold">Iniciar Sesión con Spotify</span>
                      <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>(Aún en producción)</span>
                    </span>
                  </span>
                </Button>
              </div>
            }
          </div>
        )}

        {/* 2. LOGIN FORM MODE */}
        {mode === 'login' && (
          <div className="glass-panel p-5 rounded-4 shadow-sm border border-light-subtle w-100 animate-fade-in-up text-start" style={{ maxWidth: '460px' }}>
            <div className="d-flex align-items-center mb-4">
              <button
                type="button"
                className="btn btn-link p-0 text-secondary me-2 d-flex align-items-center"
                onClick={() => { setMode('select'); navigate('/login', { replace: true }); }}
              >
                <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: '24px' }}>arrow_back</span>
              </button>
              <h2 className="h4 text-primary fw-bold mb-0">Iniciar Sesión</h2>
            </div>

            {error && (
              <div className="alert alert-danger py-2 px-3 small border-0 rounded-3 mb-3" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleTraditionalLogin}>
              {/* Email */}
              <div className="mb-3">
                <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '14px' }}>Correo Electrónico</label>
                <div className="input-group">
                  <span className="input-group-text bg-white bg-opacity-20 border-end-0 border-light-subtle rounded-start-3 text-secondary" style={{ padding: '0 12px' }}>
                    <span className="material-symbols-outlined notranslate text-[24px]" translate="no">mail</span>
                  </span>
                  <input
                    type="email"
                    className="form-control bg-white bg-opacity-10 border-start-0 border-light-subtle rounded-end-3 py-3 text-secondary fs-6"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '14px' }}>Contraseña</label>
                <div className="input-group">
                  <span className="input-group-text bg-white bg-opacity-20 border-end-0 border-light-subtle rounded-start-3 text-secondary" style={{ padding: '0 12px' }}>
                    <span className="material-symbols-outlined notranslate text-[24px]" translate="no">lock</span>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control bg-white bg-opacity-10 border-start-0 border-end-0 border-light-subtle py-3 text-secondary fs-6"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn bg-white bg-opacity-20 border border-start-0 border-light-subtle rounded-end-3 text-secondary d-flex align-items-center"
                    style={{ padding: '0 12px' }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined notranslate text-[24px]" translate="no">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-100 py-3 fw-bold fs-5"
                disabled={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Ingresar'}
              </Button>
            </form>

            <div className="text-center mt-4">
              <p className="text-secondary mb-0" style={{ fontSize: '14px' }}>
                ¿No tienes una cuenta? <button type="button" className="btn btn-link p-0 text-primary fw-semibold fs-6" onClick={() => { setMode('register'); navigate('/register'); resetForm(); }}>Regístrate</button>
              </p>
            </div>
          </div>
        )}

        {/* 3. REGISTER FORM MODE */}
        {mode === 'register' && (
          <div className="glass-panel p-5 rounded-4 shadow-sm border border-light-subtle w-100 animate-fade-in-up text-start" style={{ maxWidth: '480px' }}>
            <div className="d-flex align-items-center mb-4">
              <button
                type="button"
                className="btn btn-link p-0 text-secondary me-2 d-flex align-items-center"
                onClick={() => { setMode('login'); navigate('/login'); }}
              >
                <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: '24px' }}>arrow_back</span>
              </button>
              <h2 className="h4 text-primary fw-bold mb-0">Crear Cuenta</h2>
            </div>

            {error && (
              <div className="alert alert-danger py-2 px-3 small border-0 rounded-3 mb-3" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister}>
              {/* Name */}
              <div className="row g-2 mb-3">
                <div className="col">
                  <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '14px' }}>Nombre</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white bg-opacity-20 border-end-0 border-light-subtle rounded-start-3 text-secondary" style={{ padding: '0 12px' }}>
                      <span className="material-symbols-outlined notranslate text-[24px]" translate="no">person</span>
                    </span>
                    <input
                      type="text"
                      className="form-control bg-white bg-opacity-10 border-start-0 border-light-subtle rounded-end-3 py-3 text-secondary fs-6"
                      placeholder="Juan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="col">
                  <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '14px' }}>Apellido</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white bg-opacity-20 border-end-0 border-light-subtle rounded-start-3 text-secondary" style={{ padding: '0 12px' }}>
                      <span className="material-symbols-outlined notranslate text-[24px]" translate="no">person</span>
                    </span>
                    <input
                      type="text"
                      className="form-control bg-white bg-opacity-10 border-start-0 border-light-subtle rounded-end-3 py-3 text-secondary fs-6"
                      placeholder="Pérez"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '14px' }}>Correo Electrónico</label>
                <div className="input-group">
                  <span className="input-group-text bg-white bg-opacity-20 border-end-0 border-light-subtle rounded-start-3 text-secondary" style={{ padding: '0 12px' }}>
                    <span className="material-symbols-outlined notranslate text-[24px]" translate="no">mail</span>
                  </span>
                  <input
                    type="email"
                    className="form-control bg-white bg-opacity-10 border-start-0 border-light-subtle rounded-end-3 py-3 text-secondary fs-6"
                    placeholder="juan.perez@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '14px' }}>Contraseña</label>
                <div className="input-group">
                  <span className="input-group-text bg-white bg-opacity-20 border-end-0 border-light-subtle rounded-start-3 text-secondary" style={{ padding: '0 12px' }}>
                    <span className="material-symbols-outlined notranslate text-[24px]" translate="no">lock</span>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control bg-white bg-opacity-10 border-start-0 border-end-0 border-light-subtle py-3 text-secondary fs-6"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn bg-white bg-opacity-20 border border-start-0 border-light-subtle rounded-end-3 text-secondary d-flex align-items-center"
                    style={{ padding: '0 12px' }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined notranslate text-[24px]" translate="no">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '14px' }}>Confirmar Contraseña</label>
                <div className="input-group">
                  <span className="input-group-text bg-white bg-opacity-20 border-end-0 border-light-subtle rounded-start-3 text-secondary" style={{ padding: '0 12px' }}>
                    <span className="material-symbols-outlined notranslate text-[24px]" translate="no">lock_clock</span>
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className={`form-control bg-white bg-opacity-10 border-start-0 border-end-0 border-light-subtle py-3 text-secondary fs-6 ${password && confirmPassword && password !== confirmPassword ? 'is-invalid border-danger' : ''}`}
                    placeholder="Confirma tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className={`btn bg-white bg-opacity-20 border border-start-0 border-light-subtle rounded-end-3 text-secondary d-flex align-items-center ${password && confirmPassword && password !== confirmPassword ? 'border-danger' : ''}`}
                    style={{ padding: '0 12px' }}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <span className="material-symbols-outlined notranslate text-[24px]" translate="no">
                      {showConfirmPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-100 py-3 fw-bold fs-5"
                disabled={loading}
              >
                {loading ? 'Creando cuenta...' : 'Registrarse'}
              </Button>
            </form>

            <div className="text-center mt-4">
              <p className="text-secondary mb-0" style={{ fontSize: '14px' }}>
                ¿Ya tienes una cuenta? <button type="button" className="btn btn-link p-0 text-primary fw-semibold fs-6" onClick={() => { setMode('login'); navigate('/login'); resetForm(); }}>Inicia Sesión</button>
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-auto w-100 text-center z-3 pt-4 pb-3 opacity-75">
        <p className="small text-secondary mb-0" style={{ fontSize: '12px' }}>
          Al continuar, aceptas nuestros términos de servicio.
        </p>
      </footer>
    </div>
  );
};

export default Onboarding;
