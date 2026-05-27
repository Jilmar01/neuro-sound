/* ==========================================
   js/spotifyPlayer.js
   Reproductor SDK de Spotify (Con soporte de Playlist)
   ========================================== */

import { apiCall } from '/js/refactored/fetch.js';
import UIController from '/js/uicontroller.js'; // Asegúrate que el nombre coincida (Mayús/Minús)

const SpotifyPlayerWrapper = {
    player: null,
    deviceId: null,
    
    // 👇 NUEVO: Estado interno para manejar la lista
    playlist: [],
    currentIndex: 0,

    init() {
        const token = localStorage.getItem('spotifyToken');
        if (!token) {
            console.warn("⚠️ [SpotifyPlayer] No hay token disponible.");
            return;
        }

        window.onSpotifyWebPlaybackSDKReady = () => {
            this.setupPlayer(token);
        };

        if (!document.getElementById('spotify-sdk')) {
            console.log("📥 Descargando SDK de Spotify...");
            const script = document.createElement('script');
            script.id = 'spotify-sdk';
            script.src = "https://sdk.scdn.co/spotify-player.js";
            document.body.appendChild(script);
        } else {
            if (window.Spotify) {
                this.setupPlayer(token);
            }
        }
        return this;
    },

    setupPlayer(token) {
        console.log("🎵 [SpotifyPlayer] Inicializando...");
        
        this.player = new Spotify.Player({
            name: 'Neuro-Sound Web',
            getOAuthToken: cb => { cb(token); },
            volume: 0.5
        });

        // --- LISTENERS ---
        this.player.addListener('player_state_changed', state => {
            if (!state) return;
            const track = state.track_window.current_track;
            const isPlaying = !state.paused;

            // Detectar fin de canción para pasar a la siguiente
            // (Si estaba sonando, ahora está pausado y la posición es 0)
            if (state.paused && state.position === 0 && !state.loading && state.restrictions.disallow_resuming_reasons?.includes('not_paused')) {
               // Nota: El SDK es caprichoso con el auto-next, pero esto ayuda.
               // Lo ideal es manejarlo manualmente o dejar que el usuario pulse next.
            }

            if (typeof UIController !== 'undefined') {
                UIController.updatePlayIcon(isPlaying);
                UIController.updateMetadata(
                    track.name,
                    track.artists.map(a => a.name).join(', '),
                    track.album.images[0]?.url,
                    state.duration
                );
                UIController.updateProgress(state.position, state.duration);
            }
        });

        this.player.addListener('ready', async ({ device_id }) => {
            console.log('✅ Spotify Listo. Device ID:', device_id);
            this.deviceId = device_id;
            await this.transferPlayback(device_id);
        });

        this.player.addListener('initialization_error', ({ message }) => console.error("❌ Init Error:", message));
        this.player.addListener('authentication_error', ({ message }) => console.error("❌ Auth Error:", message));

        this.player.connect();

        setInterval(async () => {
            if(this.player) {
                const state = await this.player.getCurrentState();
                if (state && !state.paused) {
                    UIController.updateProgress(state.position, state.duration);
                }
            }
        }, 1000);
    },

    async transferPlayback(deviceId) {
        console.log(`🔀 Transfiriendo a: ${deviceId}`);
        try {
            await apiCall('spotify', '/me/player', 'PUT', {
                device_ids: [deviceId],
                play: false 
            });
            console.log("✅ Transferencia Exitosa.");
        } catch (e) {
            console.warn("⚠️ Error en transferencia:", e);
        }
    },

    // 👇 NUEVO: Método para recibir la lista de canciones (Igual que LocalPlayer)
    updatePlaylist(songs) {
        if (!songs || !Array.isArray(songs)) return;
        this.playlist = songs;
        console.log(`📋 SpotifyWrapper: Playlist actualizada con ${songs.length} canciones.`);
    },

    // 👇 NUEVO: Método interno para reproducir por índice
    async playTrackAtIndex(index) {
        if (index < 0 || index >= this.playlist.length) return;
        
        this.currentIndex = index;
        const track = this.playlist[index];
        
        console.log(`▶️ Spotify Next/Prev: ${track.title}`);
        
        // Llamamos a la API para tocar esta canción específica
        await apiCall('spotify', `/me/player/play?device_id=${this.deviceId}`, 'PUT', { 
            uris: [track.uri] 
        });
    },

    // --- CONTROLES PÚBLICOS (Actualizados) ---

    togglePlay() { 
        this.player?.togglePlay(); 
    },

    // Ahora next() calcula el índice y manda la orden
    next() { 
        if (this.playlist.length > 0) {
            const nextIndex = (this.currentIndex + 1) % this.playlist.length;
            this.playTrackAtIndex(nextIndex);
        } else {
            this.player?.nextTrack(); // Fallback por si no hay playlist cargada
        }
    },

    // Ahora prev() calcula el índice y manda la orden
    prev() { 
        if (this.playlist.length > 0) {
            const prevIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
            this.playTrackAtIndex(prevIndex);
        } else {
            this.player?.previousTrack();
        }
    },

    seek(percent) { 
        this.player?.getCurrentState().then(state => {
            if(state) {
                const seekTo = (percent / 100) * state.duration;
                this.player.seek(seekTo);
            }
        });
    }
};

export default SpotifyPlayerWrapper;