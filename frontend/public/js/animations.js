document.addEventListener('DOMContentLoaded', () => {
    
    // Seleccionamos los iconos dentro de los controles
    // Nota: Usamos querySelectorAll para obtener los elementos <i> exactos
    const icons = document.querySelectorAll(".playbackcontrols i, .d-flex.justify-content-center.gap-3 i");

    icons.forEach(icon => {
        // Guardamos la clase original al cargar para no perderla
        // Asumimos que la clase del icono es la segunda (ej: bi-play-circle-fill)
        const originalClass = Array.from(icon.classList).find(c => c.startsWith('bi-'));
        icon.dataset.original = originalClass;

        icon.addEventListener("mouseenter", () => {
            icon.style.transform = "scale(1.2)"; // Efecto de crecimiento
            icon.style.transition = "transform 0.2s ease";
            icon.style.color = "#fff"; // Forzar blanco brillante
            icon.style.textShadow = "0 0 10px rgba(255,255,255,0.6)"; // Efecto Glow
        });

        icon.addEventListener("mouseleave", () => {
            icon.style.transform = "scale(1)"; // Regresar tamaño
            icon.style.color = ""; // Regresar color original (heredado)
            icon.style.textShadow = "none";
        });
        
        // Efecto visual de click (hundirse un poco)
        icon.addEventListener("mousedown", () => {
            icon.style.transform = "scale(0.9)";
        });
        
        icon.addEventListener("mouseup", () => {
            icon.style.transform = "scale(1.2)";
        });
    });
});