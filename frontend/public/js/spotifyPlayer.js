/* ==========================================
   js/spotifyPlayer.js
   ========================================== */

const SpotifyPlayerWrapper = {
    player: null,
    deviceId: null,

    // Función principal para inyectar el script e iniciar
    init() {
        const token = localStorage.getItem('spotifyToken');
        if (!token) return console.warn("⚠️ No hay token para el Player");

        // 1. Definir la función global QUE SPOTIFY BUSCARÁ
        // Es vital que esto se defina ANTES de que el script de Spotify termine de cargar
        window.onSpotifyWebPlaybackSDKReady = () => {
            this.setupPlayer(token);
        };

        // 2. Inyectar el SDK manualmente (si no existe ya)
        if (!document.getElementById('spotify-sdk')) {
            console.log("📥 Descargando SDK de Spotify...");
            const script = document.createElement('script');
            script.id = 'spotify-sdk';
            script.src = "https://sdk.scdn.co/spotify-player.js";
            document.body.appendChild(script);
        } else {
            // Si el script ya existía y cargó antes de que llegáramos aquí,
            // forzamos la inicialización manual
            if (window.Spotify) {
                this.setupPlayer(token);
            }
        }
        return this;
    },

    // Lógica interna para configurar el reproductor
    setupPlayer(token) {
        console.log("🔑 Token que se va a usar:", token);
        console.log("🎵 Inicializando instancia del Player...");
        
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

            // Actualizar UI si existe el controlador
            if (typeof UIController !== 'undefined') {
                UIController.updatePlayIcon(isPlaying);
                UIController.updateMetadata(
                    track.name,
                    track.artists.map(a => a.name).join(', '),
                    track.album.images[0].url,
                    state.duration
                );
                UIController.updateProgress(state.position, state.duration);
            }
        });

        this.player.addListener('ready', async ({ device_id }) => {
            console.log('✅ Spotify Listo. Device ID:', device_id);
            this.deviceId = device_id;
            // Transferir reproducción automáticamente
            await this.transferPlayback(token, device_id);
        });

        this.player.addListener('initialization_error', ({ message }) => console.error(message));
        this.player.addListener('authentication_error', ({ message }) => console.error(message));

        this.player.connect();

        // Intervalo para la barra de progreso
        setInterval(async () => {
            if(this.player) {
                const state = await this.player.getCurrentState();
                if (state && !state.paused && typeof UIController !== 'undefined') {
                    UIController.updateProgress(state.position, state.duration);
                }
            }
        }, 1000);
    },

    // Transferir el audio a este navegador
    async transferPlayback(token, deviceId) {
        try {
            await fetch('https://api.spotify.com/v1/me/player', {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "device_ids": [deviceId],
                    "play": false 
                })
            });
            console.log("🔀 Reproducción transferida a Neuro-Sound");
        } catch (e) {
            console.warn("No se pudo transferir la reproducción automáticamente.");
        }
    },

    // Controles públicos
    togglePlay() { this.player?.togglePlay(); },
    next() { this.player?.nextTrack(); },
    prev() { this.player?.previousTrack(); },
    seek(percent) { 
        this.player?.getCurrentState().then(state => {
            if(state) {
                const seekTo = (percent / 100) * state.duration;
                this.player.seek(seekTo);
            }
        });
    }
};

// Iniciar al cargar el archivo
document.addEventListener('DOMContentLoaded', () => {
    SpotifyPlayerWrapper.init();
});