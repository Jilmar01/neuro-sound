const UIController = {
    // Referencias a elementos
    elements: {
        desktop: {
            cover: document.getElementById('trackCoverDesktop'),
            name: document.getElementById('trackNameDesktop'),
            artist: document.getElementById('trackArtistDesktop'),
            total: document.getElementById('totalTimeDesktop'),
            current: document.getElementById('currentTimeDesktop'),
            progress: document.getElementById('progressBarDesktop'),
            container: document.getElementById('progressContainerDesktop')
        }
        // Agrega aquí referencias mobile si las necesitas
    },

    formatTime(ms) {
        if (!ms && ms !== 0) return '0:00';
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },

    updateMetadata(title, artist, coverUrl, durationMs) {
        const d = this.elements.desktop;
        if (d.name) d.name.innerText = title || 'Desconocido';
        if (d.artist) d.artist.innerText = artist || 'Artista';
        if (d.cover) d.cover.src = coverUrl || 'img/defaultcover.png';
        if (d.total) d.total.innerText = this.formatTime(durationMs);
    },

    updateProgress(currentMs, totalMs) {
        const d = this.elements.desktop;
        const progressPercent = totalMs > 0 ? (currentMs / totalMs) * 100 : 0;
        
        if (d.progress) d.progress.style.width = `${progressPercent}%`;
        if (d.current) d.current.innerText = this.formatTime(currentMs);
    },
    
    updatePlayIcon(isPlaying) {
        const btnDesktop = document.getElementById('btnPlayDesktop');
        // Si tienes botón móvil, agrégalo aquí también: const btnMobile = document.getElementById('btnPlay');
        
        if (btnDesktop) {
            if (isPlaying) {
                // Si la música suena, mostramos el botón de PAUSA
                btnDesktop.classList.remove('bi-play-circle-fill');
                btnDesktop.classList.add('bi-pause-circle-fill');
            } else {
                // Si la música está parada, mostramos el botón de PLAY
                btnDesktop.classList.remove('bi-pause-circle-fill');
                btnDesktop.classList.add('bi-play-circle-fill');
            }
        }
    }
};