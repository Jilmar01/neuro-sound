document.addEventListener('DOMContentLoaded', () => {
    // 1. Validamos que los elementos existan antes de usarlos
    const searchInput = document.getElementById('spotifySearchInput');
    const resultsContainer = document.getElementById('spotifySearchResults');
    
    if (!searchInput || !resultsContainer) {
        console.warn("Advertencia: No se encontró el input o el contenedor de resultados en el HTML.");
        return; // Detenemos el script si no existen para evitar errores
    }

    const token = localStorage.getItem('spotifyToken');

    // Función para buscar en Spotify (URL Corregida)
    async function searchSpotify(query) {
        if (!query || !token) return;
        
        try {
            const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`;
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (!response.ok) throw new Error('Error en búsqueda');
            return await response.json();
        } catch (e) {
            console.error("Error buscando:", e);
        }
    }

    // Función especial para reproducir una canción específica
    // El SDK no hace esto directamente, hay que pedirlo a la API
    async function playSpotifyTrack(uri) {
        if (!token) return;
        
        // Necesitamos el Device ID activo. 
        // Si usaste mi código anterior, SpotifyPlayerWrapper lo tiene, pero para simplificar
        // lo enviaremos al dispositivo activo por defecto.
        await fetch(`https://api.spotify.com/v1/me/player/play`, {
            method: 'PUT',
            body: JSON.stringify({ uris: [uri] }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
    }

    // Mostrar resultados
    function displayResults(data) {
        resultsContainer.innerHTML = ''; // Limpiar anterior
        
        if (!data || !data.tracks || data.tracks.items.length === 0) {
            resultsContainer.innerHTML = '<div class="p-2 text-muted">No se encontraron resultados</div>';
            return;
        }

        data.tracks.items.forEach(track => {
            const trackDiv = document.createElement('div');
            // Clases de Bootstrap + tu estilo glass
            trackDiv.className = 'd-flex align-items-center mb-2 p-2 rounded'; 
            trackDiv.style.cursor = 'pointer';
            trackDiv.style.background = 'rgba(255,255,255,0.1)'; // Efecto visual simple
            
            // Imagen segura (por si no tiene portada)
            const imgUrl = track.album.images[2]?.url || 'img/defaultcover.png';

            trackDiv.innerHTML = `
                <img src="${imgUrl}" width="40" height="40" style="border-radius:4px; margin-right:10px; object-fit: cover;">
                <div style="overflow: hidden;">
                    <div class="text-truncate" style="font-weight: bold; font-size: 0.9rem;">${track.name}</div>
                    <small class="text-truncate d-block opacity-75">${track.artists.map(a=>a.name).join(', ')}</small>
                </div>
            `;

            // Click para reproducir
            trackDiv.addEventListener('click', () => {
                console.log("Reproduciendo:", track.name);
                playSpotifyTrack(track.uri);
            });

            resultsContainer.appendChild(trackDiv);
        });
    }

    // Listener del Input con Debounce
    let debounceTimer;
    searchInput.addEventListener('input', e => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();
        
        if (!query) {
            resultsContainer.innerHTML = '';
            return;
        }

        // Esperar 500ms antes de buscar para no saturar la API
        debounceTimer = setTimeout(async () => {
            const data = await searchSpotify(query);
            displayResults(data);
        }, 500);
    });
});