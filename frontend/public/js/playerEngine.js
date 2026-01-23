/* js/playerEngine.js */

const PlayerEngine = {
    activeInstance: null, 

    start() {
        console.log("🚀 Arrancando PlayerEngine...");
        
        // 1. Determinar quién es el jefe
        const spotifyToken = localStorage.getItem('spotifyToken');

        if (spotifyToken) {
            console.log("🟢 MODO SPOTIFY");
            this.activeInstance = SpotifyPlayerWrapper;
            SpotifyPlayerWrapper.init();
            
            // 👇 LIMPIEZA VISUAL: Aseguramos que no queden restos de canciones locales
            const mainPanel = document.getElementById("mainPanel");
            if (mainPanel) mainPanel.innerHTML = "";
            // 👆

        } else {
            console.log("🟠 MODO LOCAL");
            this.activeInstance = LocalPlayer;
            if (typeof obtenerRecomendaciones === 'function') {
                obtenerRecomendaciones().then(songs => {
                     // Solo iniciamos el player si hay canciones y NO hay token spotify
                     // (Aunque el obtenerRecomendaciones ya filtra, esto es doble seguridad)
                     if(songs && songs.length > 0) LocalPlayer.init(songs); 
                });
            }
        }
        
        // 2. Conectar TODOS los botones (Desktop + Mobile)
        this.setupAllButtons();
    },

    setupAllButtons() {
        // --- DESKTOP ---
        this.bindClick('btnPlayDesktop', () => this.activeInstance?.togglePlay());
        this.bindClick('btnNextDesktop', () => this.activeInstance?.next());
        this.bindClick('btnPrevDesktop', () => this.activeInstance?.prev());
        this.bindProgressBar('progressDesktop');

        // --- MOBILE MINI ---
        this.bindClick('btnPlayMobileMini', (e) => {
            e.stopPropagation(); // Evitar que se abra el modal al dar play
            this.activeInstance?.togglePlay();
        });
        this.bindClick('btnNextMobileMini', (e) => {
            e.stopPropagation();
            this.activeInstance?.next();
        });

        // --- MOBILE FULL SCREEN ---
        this.bindClick('btnPlayMobileFull', () => this.activeInstance?.togglePlay());
        this.bindClick('btnNextMobileFull', () => this.activeInstance?.next());
        this.bindClick('btnPrevMobileFull', () => this.activeInstance?.prev());
        
        // Input Range del Full Screen
        const rangeInput = document.getElementById('progressMobileFull');
        if (rangeInput) {
            rangeInput.oninput = (e) => {
                const val = e.target.value;
                this.activeInstance?.seek(val);
            };
        }
    },

    // Función auxiliar para no repetir código
    bindClick(elementId, action) {
        const el = document.getElementById(elementId);
        if (el) {
            el.onclick = (e) => {
                // e.preventDefault(); // Opcional, depende del elemento
                action(e);
            };
        }
    },

    bindProgressBar(elementId) {
        const bar = document.getElementById(elementId);
        if (bar) {
            bar.onclick = (e) => {
                const rect = bar.getBoundingClientRect();
                const percent = ((e.clientX - rect.left) / rect.width) * 100;
                this.activeInstance?.seek(percent);
            };
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    PlayerEngine.start();
});