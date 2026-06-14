import { apiCall, refreshSpotifySession } from './fetch.js';

const SDK_SCRIPT_ID = 'spotify-sdk';

const SpotifyPlayerWrapper = {
    player: null,
    deviceId: null,
    isReady: false,
    playlist: [],
    currentIndex: 0,
    callbacks: {},
    progressInterval: null,
    lastTrackEndUri: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    wasPlaying: false,
    reconnecting: false,

    init(callbacks = {}) {
        this.callbacks = { ...this.callbacks, ...callbacks };

        const token = localStorage.getItem('spotifyToken');
        if (!token) {
            console.warn('[SpotifyPlayer] No hay token disponible.');
            return this;
        }

        window.onSpotifyWebPlaybackSDKReady = () => {
            this.setupPlayer();
        };

        if (!document.getElementById(SDK_SCRIPT_ID)) {
            const script = document.createElement('script');
            script.id = SDK_SCRIPT_ID;
            script.src = 'https://sdk.scdn.co/spotify-player.js';
            script.async = true;
            document.body.appendChild(script);
        } else if (window.Spotify) {
            this.setupPlayer();
        }

        return this;
    },

    async setupPlayer() {
        if (this.player) return;

        this.player = new window.Spotify.Player({
            name: 'Neuro-Sound Web Player',
            getOAuthToken: async cb => {
                let t = localStorage.getItem('spotifyToken');
                const rt = localStorage.getItem('spotifyRefreshToken');
                if (t && rt) {
                    try {
                        const fresh = await refreshSpotifySession();
                        if (fresh) t = fresh;
                    } catch (e) {
                        // silent fail, use existing
                    }
                }
                cb(t);
            },
            volume: 0.5
        });

        this.player.addListener('player_state_changed', state => {
            if (!state) return;

            const isPlaying = !state.paused;
            const currentTrackUri = state.track_window?.current_track?.uri;

            this.callbacks.onPlayerStateChange?.(state);
            this.callbacks.onPlayingChange?.(isPlaying);
            this.callbacks.onProgressChange?.(state.position / 1000);
            this.callbacks.onDurationChange?.(state.duration / 1000);

            if (currentTrackUri && this.playlist.length > 0) {
                const matchedIdx = this.playlist.findIndex(track => track.uri === currentTrackUri);
                if (matchedIdx !== -1 && matchedIdx !== this.currentIndex) {
                    this.currentIndex = matchedIdx;
                    this.callbacks.onTrackIndexChange?.(matchedIdx);
                }
            }
        });

        this.player.addListener('ready', async ({ device_id }) => {
            this.deviceId = device_id;
            this.isReady = true;
            this.reconnectAttempts = 0;
            this.reconnecting = false;
            this.callbacks.onReady?.(device_id);
            await this.transferPlayback(device_id);

            if (this.wasPlaying) {
                console.log('▶️ Reanudando reproducción tras reconexión...');
                await new Promise(r => setTimeout(r, 1000));
                await this.playTrackAtIndex(this.currentIndex);
            }
        });

        this.player.addListener('not_ready', ({ device_id }) => {
            console.warn('[SpotifyPlayer] ⚠️ Dispositivo desconectado (not_ready). Intentando reconectar...');
            this.isReady = false;
            if (this.deviceId === device_id) this.deviceId = null;
            this.callbacks.onNotReady?.(device_id);
            this.attemptReconnect();
        });

        this.player.addListener('initialization_error', ({ message }) => console.error('Spotify init error:', message));
        this.player.addListener('authentication_error', ({ message }) => console.error('Spotify auth error:', message));
        this.player.addListener('playback_error', ({ message }) => console.error('Spotify playback error:', message));
        this.player.addListener('account_error', ({ message }) => {
            console.error('Spotify account error:', message);
            this.callbacks.onAccountError?.(message);
        });

        this.player.connect();
        this.startProgressPolling();
    },

    startProgressPolling() {
        if (this.progressInterval) clearInterval(this.progressInterval);

        this.progressInterval = setInterval(async () => {
            if (!this.player) return;

            const state = await this.player.getCurrentState();
            if (!state) return;

            const position = state.position / 1000;
            const duration = state.duration / 1000;
            const currentTrackUri = state.track_window?.current_track?.uri;

            this.callbacks.onPlayingChange?.(!state.paused);
            this.callbacks.onProgressChange?.(position);
            this.callbacks.onDurationChange?.(duration);

            if (!state.paused && state.duration > 0 && state.position >= state.duration - 750) {
                if (this.lastTrackEndUri !== currentTrackUri) {
                    this.lastTrackEndUri = currentTrackUri;
                    this.callbacks.onTrackEnd?.();
                }
            } else if (currentTrackUri !== this.lastTrackEndUri) {
                this.lastTrackEndUri = null;
            }
        }, 1000);
    },

    async transferPlayback(deviceId) {
        try {
            await apiCall('spotify', '/me/player', 'PUT', {
                device_ids: [deviceId],
                play: true
            });
        } catch (error) {
            console.warn('No se pudo transferir la reproduccion a Neuro-Sound:', error);
        }
    },

    updatePlaylist(songs) {
        if (!Array.isArray(songs)) return;
        this.playlist = songs;
    },

    isSpotifyTrackUri(uri) {
        return typeof uri === 'string' && uri.startsWith('spotify:track:');
    },

    async attemptReconnect() {
        if (this.reconnecting) return;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('[SpotifyPlayer] Máximo de reintentos alcanzado. La reconexión falló.');
            this.reconnecting = false;
            return;
        }

        this.reconnecting = true;
        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 8000);

        await new Promise(r => setTimeout(r, delay));

        try {
            const connected = await this.player?.connect();
            if (connected) {
                console.log('[SpotifyPlayer] Reconexión exitosa, esperando evento ready...');
            } else {
                console.warn(`[SpotifyPlayer] Reintento ${this.reconnectAttempts} fallido (connect=false).`);
                this.reconnecting = false;
                this.attemptReconnect();
            }
        } catch (error) {
            console.error('[SpotifyPlayer] Error en reconexión:', error);
            this.reconnecting = false;
            this.attemptReconnect();
        }
    },

    async playTrackAtIndex(index) {
        if (index < 0 || index >= this.playlist.length) return false;

        this.wasPlaying = true;
        this.currentIndex = index;
        const track = this.playlist[index];
        const spotifyUri = this.isSpotifyTrackUri(track?.uri) ? track.uri : null;

        if (!spotifyUri) {
            console.warn(`⚠️ "${track?.title || 'Pista'}" no tiene URI de Spotify reproducible.`);
            return false;
        }

        if (!this.player || !this.deviceId) {
            console.warn('⚠️ Spotify player no está listo.');
            return false;
        }

        console.log(`▶️ Spotify ejecutando índice ${index}: ${track.title}`);

        // Transferir playback y esperar a que el dispositivo se active en Spotify Connect
        await this.transferPlayback(this.deviceId);
        await new Promise(r => setTimeout(r, 800));

        try {
            await apiCall('spotify', '/me/player/play', 'PUT', {
                uris: [spotifyUri]
            });
            return true;
        } catch (error) {
            const isRestriction = error.status === 403 ||
                (error.message && error.message.includes('Restriction violated'));
            if (isRestriction) {
                console.warn('⚠️ Spotify API rechazó la reproducción (403). Verifica que el dispositivo "Neuro-Sound" esté visible en Spotify Connect y que tu cuenta tenga Premium.');
                this.callbacks.onAccountError?.(
                    'No se pudo reproducir en Spotify. Verifica que el dispositivo "Neuro-Sound" esté visible en Spotify Connect y que tu cuenta tenga Premium.'
                );
            } else {
                console.error("❌ Error enviando comando a Spotify:", error);
            }
            return false;
        }
    },

    togglePlay() {
        return this.player?.togglePlay();
    },

    resume() {
        return this.player?.resume();
    },

    pause() {
        this.wasPlaying = false;
        return this.player?.pause();
    },

    next() {
        if (this.playlist.length > 0) {
            const nextIndex = (this.currentIndex + 1) % this.playlist.length;
            return this.playTrackAtIndex(nextIndex);
        }
        return this.player?.nextTrack();
    },

    prev() {
        if (this.playlist.length > 0) {
            const prevIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
            return this.playTrackAtIndex(prevIndex);
        }
        return this.player?.previousTrack();
    },

    seek(seconds) {
        return this.player?.seek(seconds * 1000);
    },

    setVolume(volume) {
        return this.player?.setVolume(volume);
    },

    disconnect() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }

        this.player?.disconnect();
        this.player = null;
        this.deviceId = null;
        this.isReady = false;
        this.wasPlaying = false;
        this.reconnectAttempts = 0;
        this.reconnecting = false;
        this.lastTrackEndUri = null;
    }
};

export default SpotifyPlayerWrapper;
