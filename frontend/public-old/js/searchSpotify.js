/* js/spotifySearch.js */

function initSpotifySearch() {
    // 1. Validamos elementos
    const searchInput = document.getElementById('spotifySearchInput');
    const resultsContainer = document.getElementById('spotifySearchResults');
    const localRecommendations = document.getElementById('mainPanel'); // Tu panel de recomendaciones locales

    if (!searchInput || !resultsContainer) return;

    // Si NO hay token, ocultamos el input para no confundir
    const token = localStorage.getItem('spotifyToken');
    if (!token) {
        searchInput.style.display = 'none'; 
        return;
    } else {
        searchInput.style.display = 'block';
    }

    // --- LÓGICA DE BÚSQUEDA ---
    async function searchSpotify(query) {
        try {
            // URL OFICIAL DE LA API
            const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`;
            
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (!response.ok) throw new Error('Error API Spotify');
            return await response.json();
        } catch (e) {
            console.error("Error buscando:", e);
            return null;
        }
    }

    // --- REPRODUCIR ---
    async function playSpotifyTrack(uri) {
        // Intentamos usar el ID del dispositivo que ya inicializamos
        const deviceId = (window.SpotifyPlayerWrapper && window.SpotifyPlayerWrapper.deviceId) 
                         ? window.SpotifyPlayerWrapper.deviceId 
                         : null;

        const url = deviceId 
            ? `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`
            : `https://api.spotify.com/v1/me/player/play`;

        await fetch(url, {
            method: 'PUT',
            body: JSON.stringify({ uris: [uri] }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
    }

    // --- MOSTRAR RESULTADOS ---
    function displayResults(data) {
        resultsContainer.innerHTML = ''; 

        if (!data || !data.tracks || data.tracks.items.length === 0) {
            resultsContainer.innerHTML = '<div class="text-white-50 p-2">No se encontraron resultados</div>';
            return;
        }

        data.tracks.items.forEach(track => {
            const trackDiv = document.createElement('div');
            trackDiv.className = 'd-flex align-items-center mb-2 p-2 rounded glass-hover';
            trackDiv.style.cursor = 'pointer';
            trackDiv.style.backgroundColor = 'rgba(255,255,255,0.05)';
            
            const imgUrl = track.album.images[2]?.url || '/assets/img/defaultcover.png';

            trackDiv.innerHTML = `
                <img src="${imgUrl}" width="40" height="40" class="rounded me-3">
                <div class="overflow-hidden">
                    <div class="text-white fw-bold text-truncate" style="font-size: 0.9rem;">${track.name}</div>
                    <div class="text-white-50 small text-truncate">${track.artists.map(a=>a.name).join(', ')}</div>
                </div>
                
            `;

            trackDiv.addEventListener('click', () => {
                playSpotifyTrack(track.uri);
                // Opcional: Limpiar búsqueda al seleccionar
                // searchInput.value = '';
                // resetView();
            });

            resultsContainer.appendChild(trackDiv);
        });
    }

    // --- RESETEAR VISTA (Volver a Local) ---
    function resetView() {
        resultsContainer.innerHTML = '';
        if (localRecommendations) localRecommendations.style.display = 'flex'; // O 'block'
        if (resultsContainer) resultsContainer.style.display = 'none';
    }

    // --- LISTENER (DEBOUNCE) ---
    let debounceTimer;
    searchInput.addEventListener('input', e => {
        const query = e.target.value.trim();

        clearTimeout(debounceTimer);

        if (!query) {
            resetView(); // Si borra el texto, mostramos las recomendaciones de nuevo
            return;
        }

        // Si escribe algo: Ocultamos recomendaciones locales, mostramos resultados spotify
        if (localRecommendations) localRecommendations.style.display = 'none';
        if (resultsContainer) resultsContainer.style.display = 'block';

        debounceTimer = setTimeout(async () => {
            const data = await searchSpotify(query);
            displayResults(data);
        }, 500);
    });
}