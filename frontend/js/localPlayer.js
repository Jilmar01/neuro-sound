const LocalPlayer = {
    playlist: [],
    currentIndex: 0,
    audio: new Audio(),

    init(songsData) {
        console.log("Inicializando Player con datos recibidos...");
        
        // Guardamos la lista que nos envia recommendations.js
        this.playlist = songsData;

        if (this.playlist.length > 0) {
            this.setupAudioEvents();
            this.loadTrack(0); // Carga la primera, pero espera al play
            console.log("Player listo con " + this.playlist.length + " canciones.");
        } else {
            console.warn("La lista de reproducción está vacía.");
        }
    },

    setupAudioEvents() {
        // Actualizar barra de progreso
        this.audio.ontimeupdate = () => {
            UIController.updateProgress(this.audio.currentTime * 1000, this.audio.duration * 1000);
        };
        // Cuando termina la canción, pasa a la siguiente
        this.audio.onended = () => {
            this.next();
        };
        // Cuando cargan los datos de duración
        this.audio.onloadedmetadata = () => {
            const track = this.playlist[this.currentIndex];
            UIController.updateMetadata(track.title, track.artist, track.cover, this.audio.duration * 1000);
        };

        this.audio.onplay = () => {
            UIController.updatePlayIcon(true);
        };

        // CUANDO SE DETIENE LA MÚSICA
        this.audio.onpause = () => {
            UIController.updatePlayIcon(false);
        };
    },

    loadTrack(index) {
        this.currentIndex = index;
        const track = this.playlist[index];
        
        // CORRECCIÓN 1: Limpiamos la URL por si viene con doble slash //
        let safeUrl = track.src.replace(/([^:]\/)\/+/g, "$1"); 
        
        console.log("Cargando audio desde:", safeUrl); // Para depurar en consola
        
        this.audio.src = safeUrl;
        this.audio.load(); // Forzamos al navegador a recargar la fuente
        
        UIController.updateMetadata(track.title, track.artist, track.cover, 0);
    },

    togglePlay() {
        if (this.playlist.length === 0) return;

        if (this.audio.paused) {
            // CORRECCIÓN 2: Manejar la Promesa de play() para evitar el error "Uncaught"
            const playPromise = this.audio.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error("Error al reproducir:", error);
                    // Si falla, revisa la pestaña 'Network' del navegador
                });
            }
        } else {
            this.audio.pause();
        }
    },

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
        this.loadTrack(this.currentIndex);
        this.audio.play();
    },

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
        this.loadTrack(this.currentIndex);
        this.audio.play();
    },
    
    seek(percent) {
        if(this.audio.duration) {
            this.audio.currentTime = (percent / 100) * this.audio.duration;
        }
    }
};