const UIController = {
    // 1. Utilidad de formateo de tiempo (ms -> mm:ss)
    formatTime(ms) {
        if (!ms && ms !== 0) return '0:00';
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },

    // 2. Actualizar textos e imágenes (Se ejecuta al cargar canción o cambiar metadatos)
    updateMetadata(title, artist, coverUrl, durationMs) {
        // A. Actualizar TODOS los títulos (Desktop, Mini, Full)
        document.querySelectorAll('.ui-track-name').forEach(el => {
            el.innerText = title || 'Desconocido';
        });

        // B. Actualizar TODOS los artistas
        document.querySelectorAll('.ui-track-artist').forEach(el => {
            el.innerText = artist || 'Artista Desconocido';
        });

        // C. Actualizar TODAS las portadas
        document.querySelectorAll('.ui-track-cover').forEach(el => {
            // Si hay URL usa esa, si no, usa la default
            el.src = coverUrl || '/assets/img/defaultcover.png';
        });

        // D. Actualizar tiempo total (si el elemento existe en esa vista)
        document.querySelectorAll('.ui-total-time').forEach(el => {
            el.innerText = this.formatTime(durationMs);
        });
    },

    // 3. Actualizar Barras de Progreso (Se ejecuta cada segundo)
    updateProgress(currentMs, totalMs) {
        const progressPercent = totalMs > 0 ? (currentMs / totalMs) * 100 : 0;
        const formattedTime = this.formatTime(currentMs);

        // A. Actualizar ancho de las barras (divs estilo Bootstrap)
        document.querySelectorAll('.ui-track-progress').forEach(el => {
            el.style.width = `${progressPercent}%`;
            // Para accesibilidad (opcional)
            el.setAttribute('aria-valuenow', progressPercent);
        });

        // B. Actualizar inputs tipo rango (si usas sliders en móvil)
        document.querySelectorAll('.ui-track-range').forEach(el => {
            el.value = progressPercent;
        });

        // C. Actualizar texto del tiempo actual
        document.querySelectorAll('.ui-current-time').forEach(el => {
            el.innerText = formattedTime;
        });
    },

    // 4. Sincronizar Botones Play/Pause
    updatePlayIcon(isPlaying) {
        // Buscamos TODOS los botones con la clase .ui-play-btn
        const allPlayBtns = document.querySelectorAll('.ui-play-btn');
        
        allPlayBtns.forEach(btn => {
            if (isPlaying) {
                // Estado: SONANDO -> Mostrar icono PAUSA
                btn.classList.remove('bi-play-circle-fill', 'bi-play-fill'); // Quita versiones de Play
                btn.classList.add('bi-pause-circle-fill'); // Pone Pausa
            } else {
                // Estado: PAUSADO -> Mostrar icono PLAY
                btn.classList.remove('bi-pause-circle-fill', 'bi-pause-fill'); // Quita versiones de Pausa
                btn.classList.add('bi-play-circle-fill'); // Pone Play
            }
        });
    }
};