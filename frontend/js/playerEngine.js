const PlayerEngine = {
    activeInstance: null, // Aquí se guardará LocalPlayer o SpotifyPlayerWrapper

    async start() {
        const token = localStorage.getItem('spotifyToken');

        if (token) {
            // Intentar cargar Spotify
            this.activeInstance = await SpotifyPlayerWrapper.init(token);
        } else {
            // Cargar Local
            const songs = await obtenerRecomendaciones(); // Asumo que esta función existe y devuelve las canciones
            setOnContainer(songs); // Pintar la lista en el contenedor
            this.activeInstance = await LocalPlayer.init(songs);
        }
        
        this.setupButtons();
    },

    setupButtons() {
        const btnPlay = document.getElementById('btnPlayDesktop');
        const btnNext = document.getElementById('btnNextDesktop');
        const btnPrev = document.getElementById('btnPrevDesktop');
        const progressBar = document.getElementById('progressContainerDesktop');

        // Los botones no saben quién toca, solo le dicen al Engine "haz esto"
        if(btnPlay) btnPlay.onclick = () => this.activeInstance?.togglePlay();
        if(btnNext) btnNext.onclick = () => this.activeInstance?.next();
        if(btnPrev) btnPrev.onclick = () => this.activeInstance?.prev();
        
        if(progressBar) {
            progressBar.onclick = (e) => {
                const rect = progressBar.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const width = rect.width;
                const percent = (x / width) * 100;
                this.activeInstance?.seek(percent);
            };
        }
    }
};

// Arrancamos todo cuando el HTML esté cargado
document.addEventListener('DOMContentLoaded', () => {
    PlayerEngine.start();
});