/* ==========================================
   js/UIController.js
   Manejo del DOM y la interfaz gráfica
   ========================================== */

const UIController = {
    // 1. Utilidad de formateo de tiempo (ms -> mm:ss)
    formatTime(ms) {
        if (!ms && ms !== 0) return '0:00';
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },

    // 2. Actualizar textos e imágenes
    updateMetadata(title, artist, coverUrl, durationMs) {
        // A. Títulos
        document.querySelectorAll('.ui-track-name').forEach(el => {
            el.innerText = title || 'Desconocido';
        });

        // B. Artistas
        document.querySelectorAll('.ui-track-artist').forEach(el => {
            el.innerText = artist || 'Artista Desconocido';
        });

        // C. Portadas
        document.querySelectorAll('.ui-track-cover').forEach(el => {
            el.src = coverUrl || '/assets/img/defaultcover.png';
        });

        // D. Tiempo total
        document.querySelectorAll('.ui-total-time').forEach(el => {
            el.innerText = this.formatTime(durationMs);
        });
    },

    // 3. Actualizar Barras de Progreso
    updateProgress(currentMs, totalMs) {
        const progressPercent = totalMs > 0 ? (currentMs / totalMs) * 100 : 0;
        const formattedTime = this.formatTime(currentMs);

        // A. Ancho de barras
        document.querySelectorAll('.ui-track-progress').forEach(el => {
            el.style.width = `${progressPercent}%`;
            el.setAttribute('aria-valuenow', progressPercent);
        });

        // B. Inputs rango (sliders)
        document.querySelectorAll('.ui-track-range').forEach(el => {
            el.value = progressPercent;
        });

        // C. Texto tiempo actual
        document.querySelectorAll('.ui-current-time').forEach(el => {
            el.innerText = formattedTime;
        });
    },

    // 4. Sincronizar Iconos Play/Pause
    updatePlayIcon(isPlaying) {
        const allPlayBtns = document.querySelectorAll('.ui-play-btn');
        
        allPlayBtns.forEach(btn => {
            if (isPlaying) {
                // Poner PAUSA
                btn.classList.remove('bi-play-circle-fill', 'bi-play-fill'); 
                btn.classList.add('bi-pause-circle-fill'); 
            } else {
                // Poner PLAY
                btn.classList.remove('bi-pause-circle-fill', 'bi-pause-fill'); 
                btn.classList.add('bi-play-circle-fill'); 
            }
        });
    }
};

// 👇 EXPORTACIÓN PARA MÓDULOS
export default UIController;