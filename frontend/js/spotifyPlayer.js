const SpotifyPlayerWrapper = {
    player: null,

    init(token) {
        return new Promise((resolve) => {
            // Inyectar SDK si no existe
            if (!document.getElementById('spotify-sdk')) {
                const script = document.createElement('script');
                script.id = 'spotify-sdk';
                script.src = "https://sdk.scdn.co/spotify-player.js";
                document.body.appendChild(script);
            }

            window.onSpotifyWebPlaybackSDKReady = () => {
                this.player = new Spotify.Player({
                    name: 'Neuro-Sound Player',
                    getOAuthToken: cb => { cb(token); }
                });

                this.player.addListener('player_state_changed', state => {
                    if (!state) return;
                    const track = state.track_window.current_track;
                    const isPlaying = !state.paused;
                    UIController.updatePlayIcon(isPlaying);
                    UIController.updateMetadata(
                        track.name,
                        track.artists.map(a => a.name).join(', '),
                        track.album.images[0].url,
                        state.duration
                    );
                    UIController.updateProgress(state.position, state.duration);
                });

                this.player.addListener('ready', ({ device_id }) => {
                    console.log('Spotify Listo con Device ID', device_id);
                    resolve(this); // Avisamos que estamos listos
                });

                this.player.connect();
                
                // Intervalo de seguridad para suavidad de la barra
                setInterval(async () => {
                    if(this.player) {
                        const state = await this.player.getCurrentState();
                        if (state) UIController.updateProgress(state.position, state.duration);
                    }
                }, 500);
            };
        });
    },

    // Métodos públicos
    togglePlay() { this.player.togglePlay(); },
    next() { this.player.nextTrack(); },
    prev() { this.player.previousTrack(); },
    seek(percent) { 
        // Spotify requiere seek en ms, no tenemos duration aquí fácil, 
        // así que el seek en Spotify es mejor manejarlo directo con state si es posible,
        // o pasando duration. Por simplicidad, este wrapper asume que el playerState maneja el seek.
        this.player.getCurrentState().then(state => {
            if(state) {
                const seekTo = (percent / 100) * state.duration;
                this.player.seek(seekTo);
            }
        });
    }
};