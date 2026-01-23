/* ==========================================
   js/localPlayer.js
   Reproductor de archivos locales/servidor
   ========================================== */

const LocalPlayer = {
    playlist: [],
    currentIndex: 0,
    audio: new Audio(),
    
    // Nueva variable para controlar errores consecutivos
    errorCount: 0, 

    async init(songsData) {
        console.log("🛠️ Inicializando LocalPlayer...");

        if (!songsData || !Array.isArray(songsData) || songsData.length === 0) {
            console.error("❌ Error: LocalPlayer recibió una lista vacía.");
            return;
        }

        // 1. Guardar Playlist
        this.playlist = songsData;
        console.log("✅ Playlist cargada:", this.playlist.length, "canciones.");

        // 2. Configurar Eventos
        this.setupAudioEvents();

        // 3. Cargar visualmente la primera (sin reproducir)
        try {
            await this.loadTrack(0, false); 
        } catch (error) {
            console.warn("Advertencia en carga inicial:", error);
        }
        
        return this;
    },

    setupAudioEvents() {
        // --- PROGRESO ---
        this.audio.ontimeupdate = () => {
            if (typeof UIController !== 'undefined') {
                UIController.updateProgress(this.audio.currentTime * 1000, this.audio.duration * 1000);
            }
        };
        
        // --- SIGUIENTE AUTOMÁTICO (SOLO SI TERMINA BIEN) ---
        this.audio.onended = () => {
            console.log("Canción terminada. Pasando a la siguiente...");
            this.errorCount = 0; // Reseteamos errores si terminó bien una canción
            this.next();
        };
        
        // --- METADATOS ---
        this.audio.onloadedmetadata = () => {
            // Si cargó los metadatos, significa que el archivo está bien. Reseteamos contador de error.
            this.errorCount = 0;
            const track = this.playlist[this.currentIndex];
            if (typeof UIController !== 'undefined' && track) {
                UIController.updateMetadata(track.title, track.artist, track.cover, this.audio.duration * 1000);
            }
        };

        // --- ESTADOS DE LA UI ---
        this.audio.onplay = () => { 
            if (typeof UIController !== 'undefined') UIController.updatePlayIcon(true);
        };
        
        this.audio.onpause = () => { 
            if (typeof UIController !== 'undefined') UIController.updatePlayIcon(false);
        };
        
        // --- MANEJO DE ERRORES (CORREGIDO) ---
        this.audio.onerror = (e) => {
            console.error(`❌ Error al reproducir pista ${this.currentIndex}:`, e);
            
            this.errorCount++;

            // Si falla más de 2 veces seguidas, DETENEMOS TODO para no colgar el navegador
            if (this.errorCount >= 2) {
                console.error("⚠️ Demasiados errores consecutivos. Deteniendo reproducción automática.");
                if (typeof UIController !== 'undefined') UIController.updatePlayIcon(false);
                alert("Error de conexión con el servidor de audio. Por favor revisa si aceptaste el certificado de seguridad.");
                return; // NO LLAMAMOS A NEXT()
            }

            console.log("Intentando saltar a la siguiente canción...");
            setTimeout(() => {
                this.next(); 
            }, 1000); // Esperamos 1 segundo antes de saltar para no saturar
        };
    },

    // --- PETICIÓN AL SERVIDOR (POST) ---
    async fetchStreamUrl(title) {
        try {
            // CORRECCIÓN: Forzamos el uso de la variable correcta o un fallback seguro
            let baseUrl = "";
            if (typeof config !== 'undefined' && config.API_URL) {
                baseUrl = config.API_URL;
            } else if (typeof STREAM_BASE_URL !== 'undefined') {
                baseUrl = STREAM_BASE_URL;
            } else {
                // Fallback de emergencia basado en tus logs
                baseUrl = "http://10.40.43.218:5001"; 
            }

            // Aseguramos que la URL no tenga slash al final antes de concatenar
            baseUrl = baseUrl.replace(/\/$/, ""); 
            const apiUrl = `${baseUrl}/get-songs`; // Endpoint correcto según tu backend
            
            console.log(`📡 Solicitando audio a: ${apiUrl} para "${title}"...`);
            
            const bodyObject = { "songsRequested": [title] };

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyObject)
            });
            
            if (!response.ok) throw new Error(`Error ${response.status}`);
            
            const data = await response.json();

            // Lógica para extraer la URL del JSON
            let finalUrl = null;
            if (data.files && Array.isArray(data.files) && data.files.length > 0) {
                finalUrl = data.files[0].url || data.files[0].link;
            } else if (Array.isArray(data) && data.length > 0) {
                finalUrl = data[0].url || data[0].link;
            }
            
            // CORRECCIÓN DE PUERTO SI VIENE MAL DEL BACKEND
            // Si el backend devuelve puerto 5001 (https) pero estamos en local, a veces falla.
            // Si estás usando Tunnel, deja la URL como viene.
            return finalUrl;

        } catch (error) {
            console.error("❌ Error fetch stream:", error);
            return null;
        }
    },

    // --- CARGAR CANCIÓN (LÓGICA PRINCIPAL) ---
    async loadTrack(index, autoPlay = true) {
        if (index < 0 || index >= this.playlist.length) return;

        this.currentIndex = index;
        const track = this.playlist[index];
        console.log(`🔥 Cargando track ${index}: ${track.title}`);

        this.audio.pause();
        
        if (typeof UIController !== 'undefined') {
            UIController.updateMetadata(track.title, track.artist, track.cover, 0);
            UIController.updatePlayIcon(true); 
        }

        // 3. Resolver URL (si no la tiene)
        if (!track.src) {
            const streamUrl = await this.fetchStreamUrl(track.title);
            if (streamUrl) {
                track.src = streamUrl;
            } else {
                console.warn("⚠️ No se pudo obtener URL, cancelando reproducción.");
                // No saltamos automáticamente para evitar bucles si el servidor está caído
                if (typeof UIController !== 'undefined') UIController.updatePlayIcon(false);
                return; 
            }
        }

        // 4. Cargar y REPRODUCIR
        if (typeof track.src === 'string') {
            this.audio.src = track.src;
            this.audio.load();

            if (autoPlay) {
                console.log("▶️ Intentando reproducir...");
                try {
                    const playPromise = this.audio.play();

                    if (playPromise !== undefined) {
                        playPromise
                            .then(() => {
                                console.log("✅ Reproduciendo.");
                                this.errorCount = 0; // Éxito
                            })
                            .catch(error => {
                                console.error("❌ Autoplay bloqueado o error de carga:", error);
                                if (typeof UIController !== 'undefined') UIController.updatePlayIcon(false);
                            });
                    }
                } catch (e) {
                    console.error("Error síncrono al reproducir:", e);
                }
            }
        }
    },

    // --- MÉTODOS DE CONTROL ---

    async play() {
        if (this.audio.src) {
            try {
                await this.audio.play();
            } catch (e) {
                console.error("Error al forzar play:", e);
            }
        } else {
            this.loadTrack(this.currentIndex, true);
        }
    },

    togglePlay() {
        if (this.playlist.length === 0) return;

        if (this.audio.paused) {
            // Reiniciamos contador de errores al interacción manual del usuario
            this.errorCount = 0; 
            if (this.audio.src && this.audio.src !== window.location.href) {
                this.audio.play().catch(e => console.error("Error al reproducir:", e));
            } else {
                this.loadTrack(this.currentIndex, true);
            }
        } else {
            this.audio.pause();
        }
    },

    async next() {
        this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
        await this.loadTrack(this.currentIndex, true);
    },

    async prev() {
        this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
        await this.loadTrack(this.currentIndex, true);
    },
    
    seek(percent) {
        if(this.audio.duration) {
            this.audio.currentTime = (percent / 100) * this.audio.duration;
        }
    }
};