const LocalPlayer = {
    playlist: [],
    currentIndex: 0,
    audio: new Audio(),
    skipCount: 0, // Contador para evitar bucles infinitos si todo falla

    async init(songsData) {
        console.log("🛠️ Inicializando LocalPlayer...");

        if (!songsData || !Array.isArray(songsData) || songsData.length === 0) {
            console.error("❌ Error: LocalPlayer recibió una lista vacía.");
            return;
        }

        // 1. Guardar Playlist
        this.playlist = songsData;
        console.log("✅ Playlist cargada:", this.playlist.length, "canciones.");

        // 2. Configurar Eventos (Aquí se conecta con tu UIController)
        this.setupAudioEvents();

        // 3. Precarga visual de la primera canción (track 0)
        try {
            // false = No reproducir automáticamente al iniciar
            await this.loadTrack(0, false); 
        } catch (error) {
            console.warn("Advertencia en carga inicial:", error);
        }
        
        return this; // Importante para tu motor
    },

    setupAudioEvents() {
        // --- PROGRESO ---
        this.audio.ontimeupdate = () => {
            if (typeof UIController !== 'undefined') {
                // Multiplicamos por 1000 porque tu UIController espera milisegundos
                UIController.updateProgress(this.audio.currentTime * 1000, this.audio.duration * 1000);
            }
        };
        
        // --- SIGUIENTE AUTOMÁTICO ---
        this.audio.onended = () => this.next();
        
        // --- METADATOS (DURACIÓN REAL) ---
        this.audio.onloadedmetadata = () => {
            const track = this.playlist[this.currentIndex];
            if (typeof UIController !== 'undefined') {
                UIController.updateMetadata(track.title, track.artist, track.cover, this.audio.duration * 1000);
            }
        };

        // --- ICONO DE PLAY/PAUSE (AQUÍ USAMOS TU NUEVA FUNCIÓN) ---
        this.audio.onplay = () => { 
            if (typeof UIController !== 'undefined') {
                UIController.updatePlayIcon(true); // true = Mostramos icono de Pausa
            }
        };
        
        this.audio.onpause = () => { 
            if (typeof UIController !== 'undefined') {
                UIController.updatePlayIcon(false); // false = Mostramos icono de Play
            }
        };
        
        // --- ERROR DE REPRODUCCIÓN ---
        this.audio.onerror = (e) => {
            console.error("❌ Error interno del audio, intentando saltar...", e);
            this.next(); // Auto-skip si el archivo falla a mitad
        };
    },

    // --- PETICIÓN AL SERVIDOR (POST) ---
    async fetchStreamUrl(title) {
        try {
            console.log(`📡 POST solicitando audio para: "${title}"...`);
            
            const apiUrl = "https://8nlqb9lj-5001.use2.devtunnels.ms/get-songs";
            const bodyObject = { "songsRequested": [title] };

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyObject) // IMPORTANTE: Stringify
            });
            
            if (!response.ok) throw new Error(`Error ${response.status}`);
            
            const data = await response.json();

            // Extracción robusta de la URL
            if (data.files && Array.isArray(data.files) && data.files.length > 0) {
                return data.files[0].url || data.files[0].link;
            }
            if (Array.isArray(data) && data.length > 0) return data[0].url || data[0].link;
            if (data.url || data.link) return data.url || data.link;

            return null; 
        } catch (error) {
            console.error("❌ Error fetch stream:", error);
            return null;
        }
    },

    // --- CARGAR CANCIÓN (CON AUTO-SKIP) ---
    async loadTrack(index, autoPlay = true) {
        // Validar índice
        if (index < 0 || index >= this.playlist.length) return;

        this.currentIndex = index;
        const track = this.playlist[index];

        console.log(`🔎 Preparando: ${track.title}`);

        // 1. LIMPIEZA TOTAL (Para evitar que suene la anterior)
        this.audio.pause();
        this.audio.src = "";
        this.audio.removeAttribute("src");
        this.audio.load();

        // Actualizar UI inmediatamente (Feedback visual)
        if (typeof UIController !== 'undefined') {
            UIController.updateMetadata(track.title, track.artist, track.cover, 0);
        }

        // 2. BUSCAR URL (SI NO EXISTE)
        if (!track.src) {
            const streamUrl = await this.fetchStreamUrl(track.title);
            
            if (streamUrl) {
                track.src = streamUrl; 
                this.skipCount = 0; // Éxito, reseteamos contador
            } else {
                console.warn(`⚠️ Sin URL para: ${track.title}. Saltando...`);
                
                // Lógica de salto automático si falla
                this.skipCount++;
                if (this.skipCount < this.playlist.length) {
                    await this.next(); 
                } else {
                    alert("Ninguna canción disponible pudo ser reproducida.");
                    this.skipCount = 0;
                }
                return; 
            }
        }

        // 3. ASIGNAR Y REPRODUCIR
        if (typeof track.src === 'string') {
            // Limpieza de URL dobles (ej: http://...//...)
            let safeUrl = track.src.replace(/([^:]\/)\/+/g, "$1");
            
            this.audio.src = safeUrl;
            this.audio.load();

            if (autoPlay) {
                try {
                    await this.audio.play();
                } catch (e) {
                    console.warn("Auto-play bloqueado por el navegador:", e);
                }
            }
        }
    },

    togglePlay() {
        if (this.playlist.length === 0) return;

        if (this.audio.paused) {
            // Validamos que haya una fuente cargada
            if (this.audio.src && this.audio.src !== window.location.href) {
                this.audio.play().catch(e => console.error("Error al reproducir:", e));
            } else {
                // Si le dan Play y no hay nada cargado, recargar la actual
                this.loadTrack(this.currentIndex, true);
            }
        } else {
            this.audio.pause();
        }
    },

    async next() {
        this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
        // autoPlay = true para que suene apenas cambie
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