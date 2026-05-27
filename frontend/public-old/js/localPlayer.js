/* ==========================================
   js/localPlayer.js
   Reproductor de archivos locales/servidor
   ========================================== */
import UIController from '/js/uicontroller.js';

const LocalPlayer = {
    playlist: [],
    currentIndex: 0,
    audio: new Audio(),
    errorCount: 0, 

    async init(songsData) {
        console.log("🛠️ Inicializando LocalPlayer...");

        if (!songsData || !Array.isArray(songsData) || songsData.length === 0) {
            console.error("❌ Error: LocalPlayer recibió una lista vacía.");
            return;
        }

        this.playlist = songsData;
        console.log("✅ Playlist cargada en LocalPlayer:", this.playlist.length, "canciones.");

        this.setupAudioEvents();

        // Precargar la primera sin reproducir
        try {
            await this.loadTrack(0, false); 
        } catch (error) {
            console.warn("Advertencia en carga inicial:", error);
        }
        
        return this;
    },

    setupAudioEvents() {
        this.audio.ontimeupdate = () => {
            if (typeof UIController !== 'undefined') {
                UIController.updateProgress(this.audio.currentTime * 1000, this.audio.duration * 1000);
            }
        };
        
        this.audio.onended = () => {
            console.log("Canción terminada. Siguiente...");
            this.errorCount = 0; 
            this.next();
        };
        
        this.audio.onloadedmetadata = () => {
            this.errorCount = 0;
            const track = this.playlist[this.currentIndex];
            if (typeof UIController !== 'undefined' && track) {
                UIController.updateMetadata(track.title, track.artist, track.cover, this.audio.duration * 1000);
            }
        };

        this.audio.onplay = () => { 
            if (typeof UIController !== 'undefined') UIController.updatePlayIcon(true);
        };
        
        this.audio.onpause = () => { 
            if (typeof UIController !== 'undefined') UIController.updatePlayIcon(false);
        };
        
        this.audio.onerror = (e) => {
            console.error(`❌ Error audio track ${this.currentIndex}:`, e);
            this.errorCount++;

            if (this.errorCount >= 2) {
                console.error("⚠️ Demasiados errores. Stop.");
                if (typeof UIController !== 'undefined') UIController.updatePlayIcon(false);
                return; 
            }

            console.log("Intentando saltar...");
            setTimeout(() => { this.next(); }, 1000); 
        };
    },

    async fetchStreamUrl(title) {
        try {
            // 👇 Actualiza URL del túnel si cambia
            const baseUrl = "https://strips-discretion-anderson-harbor.trycloudflare.com/"; 
            
            const apiUrl = `${baseUrl}/get-songs`;
            console.log(`📡 Fetch Audio: ${apiUrl} -> "${title}"`);
            
            const bodyObject = { "songsRequested": [title] };

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyObject)
            });
            
            if (!response.ok) throw new Error(`Error ${response.status}`);
            
            const data = await response.json();

            let finalUrl = null;
            if (data.files && Array.isArray(data.files) && data.files.length > 0) {
                finalUrl = data.files[0].url || data.files[0].link;
            }
            
            return finalUrl;

        } catch (error) {
            console.error("❌ Error fetch stream:", error);
            return null;
        }
    },

    async loadTrack(index, autoPlay = true) {
        if (index < 0 || index >= this.playlist.length) return;

        this.currentIndex = index;
        const track = this.playlist[index];
        console.log(`🔥 LocalPlayer Load: ${track.title}`);

        this.audio.pause();
        
        if (!track.src && !track.preview_url) {
            const streamUrl = await this.fetchStreamUrl(track.title);
            if (streamUrl) {
                track.src = streamUrl;
                track.preview_url = streamUrl; 
            } else {
                console.warn("⚠️ Sin URL.");
                return; 
            }
        } else if (!track.src && track.preview_url) {
            track.src = track.preview_url;
        }

        if (typeof track.src === 'string') {
            this.audio.src = track.src;
            this.audio.load();

            if (autoPlay) {
                try {
                    await this.audio.play();
                    this.errorCount = 0;
                } catch (e) {
                    console.error("Autoplay prevent:", e);
                }
            }
        }
    },

    // Métodos públicos extra
    togglePlay() {
        if (this.audio.paused) this.audio.play();
        else this.audio.pause();
    },

    next() {
        const nextIndex = (this.currentIndex + 1) % this.playlist.length;
        this.loadTrack(nextIndex, true);
    },

    prev() {
        const prevIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
        this.loadTrack(prevIndex, true);
    },

    // 👇 AQUÍ ESTÁ LA NUEVA FUNCIÓN PARA LA BARRA DE PROGRESO
    seek(percent) {
        // Validamos que el audio tenga una duración válida (que esté cargado)
        if (this.audio && this.audio.duration && isFinite(this.audio.duration)) {
            // Calculamos el nuevo tiempo: (Porcentaje / 100) * Duración Total
            const newTime = (percent / 100) * this.audio.duration;
            
            // Asignamos el nuevo tiempo al reproductor HTML5
            this.audio.currentTime = newTime;
            
            console.log(`⏩ Seek to: ${Math.round(percent)}% (${newTime.toFixed(1)}s)`);
        } else {
            console.warn("⚠️ No se puede hacer seek: Audio no cargado o duración desconocida.");
        }
    }
};

export default LocalPlayer;