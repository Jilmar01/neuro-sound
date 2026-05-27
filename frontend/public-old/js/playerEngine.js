/* js/playerEngine.js */

// 1. IMPORTACIONES NECESARIAS
import  LocalPlayer  from '/js/localPlayer.js';
// Asumimos que SpotifyPlayerWrapper se exporta de su archivo
import SpotifyPlayerWrapper from '/js/spotifyPlayer.js'; 
import { obtenerRecomendaciones, setOnContainer } from '/js/recomendations.js';

const PlayerEngine = {
    activeInstance: null, 

    async start() {
        console.log("🚀 Arrancando PlayerEngine...");
        
        // 2. Determinar quién es el jefe
        const spotifyToken = localStorage.getItem('spotifyToken');

        if (spotifyToken) {
            // --- MODO SPOTIFY ---
            console.log("🟢 MODO SPOTIFY ACTIVADO");
            this.activeInstance = SpotifyPlayerWrapper;
            
            if (SpotifyPlayerWrapper && typeof SpotifyPlayerWrapper.init === 'function') {
                SpotifyPlayerWrapper.init();
            }

            // En modo Spotify, la vista suele cargarse desde router.js u otro lado, 
            // pero si necesitas cargar canciones iniciales aquí, podrías hacerlo.
            // Por ahora dejamos la limpieza que tenías.
            const mainPanel = document.getElementById("mainPanel");
            if (mainPanel) mainPanel.innerHTML = "";

        } else {
            // --- MODO LOCAL ---
            console.log("🟠 MODO LOCAL ACTIVADO");
            this.activeInstance = LocalPlayer;
            
            try {
                // A. Pedimos las canciones al motor híbrido
                const songs = await obtenerRecomendaciones();
                
                if (songs && songs.length > 0) {
                    // B. 🔥 IMPORTANTE: Pintamos la interfaz visual
                    setOnContainer(songs);

                    // C. Inicializamos el reproductor interno (Carga la playlist)
                    LocalPlayer.init(songs);
                } else {
                    console.warn("⚠️ No se obtuvieron canciones para el Modo Local.");
                }

            } catch (error) {
                console.error("❌ Error arrancando Modo Local en PlayerEngine:", error);
            }
        }
        
        // 3. Conectar TODOS los botones (Desktop + Mobile)
        this.setupAllButtons();
    },

    setupAllButtons() {
        // Esta lógica se mantiene perfecta, delega la acción a la instancia activa

        // --- DESKTOP ---
        this.bindClick('btnPlayDesktop', () => this.activeInstance?.togglePlay());
        this.bindClick('btnNextDesktop', () => this.activeInstance?.next());
        this.bindClick('btnPrevDesktop', () => this.activeInstance?.prev());
        this.bindProgressBar('progressDesktop');

        // --- MOBILE MINI ---
        this.bindClick('btnPlayMobileMini', (e) => {
            e.stopPropagation(); 
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
                // Si el activeInstance tiene seek, lo usa
                if (this.activeInstance && typeof this.activeInstance.seek === 'function') {
                    this.activeInstance.seek(val);
                }
            };
        }
    },

    // Función auxiliar para no repetir código
    bindClick(elementId, action) {
        const el = document.getElementById(elementId);
        if (el) {
            el.onclick = (e) => {
                // e.preventDefault(); // A veces es necesario, a veces no.
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
                
                if (this.activeInstance && typeof this.activeInstance.seek === 'function') {
                    this.activeInstance.seek(percent);
                }
            };
        }
    }
};

// Exportamos para poder usarlo si es necesario, aunque el listener de abajo lo arranca.
export default PlayerEngine;

// Auto-arranque al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    // Pequeño timeout para asegurar que otros scripts (como Spotify SDK) respiren
    setTimeout(() => {
        PlayerEngine.start();
    }, 100);
});