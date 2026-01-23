/* ==========================================
   js/recommendations.js
   Maneja la visualización (MODO EXCLUSIVO: Spotify O Local)
   ========================================== */

async function obtenerRecomendaciones() {
    const spotifyToken = localStorage.getItem('spotifyToken');

    // ------------------------------------------------------
    // 1. MODO SPOTIFY (Prioridad Absoluta)
    // ------------------------------------------------------
    if (spotifyToken) {
        console.log("🟢 Modo Spotify detectado. Omitiendo biblioteca local.");
        
        if (typeof SpotifyRecommender !== 'undefined') {
            try {
                // Solo devolvemos lo que traiga Spotify
                return await SpotifyRecommender.getRecommendations(spotifyToken);
            } catch (e) {
                console.error("Error crítico Spotify:", e);
                return []; 
            }
        }
    }

    // ------------------------------------------------------
    // 2. MODO LOCAL (Solo si NO hay token de Spotify)
    // ------------------------------------------------------
    console.log("🟠 No hay token Spotify. Cargando biblioteca local...");
    
    let localResults = [];
    try {
        const localToken = localStorage.getItem('token');
        if (localToken) {
            const apiUrl = `${API_BASE_URL}/api/recommend/music`;
            
            // A. Pedir recomendación teórica al backend
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localToken}` 
                }
            });

            if (response.ok) {
                const json = await response.json();
                const rawSongs = json.data?.songs || [];

                if (rawSongs.length > 0) {
                    // B. Verificar archivos físicos (Puerto 5001)
                    const songTitles = rawSongs.map(s => s.name);
                    const validSongs = await filtrarCancionesDisponibles(songTitles);

                    // C. Formatear
                    rawSongs.forEach(originalSong => {
                        const match = validSongs.find(v => v.name.toLowerCase() === originalSong.name.toLowerCase());
                        if (match) {
                            localResults.push({
                                title: originalSong.name,             
                                src: match.url || match.link, 
                                artist: (originalSong.artists && originalSong.artists.length > 0) ? originalSong.artists[0] : "Artista Desconocido",
                                cover: "/assets/img/defaultcover.png",
                                genre: originalSong.genre,
                                bpm: originalSong.bpm,
                                type: 'local', 
                                details: "Tu Biblioteca"
                            });
                        }
                    });
                }
            }
        }
    } catch (error) {
        console.error("❌ Error en recomendaciones locales:", error);
    }

    return localResults;
}

// --- Helper para filtrar locales ---
async function filtrarCancionesDisponibles(titlesArray) {
    try {
        const apiUrlStream = `${STREAM_BASE_URL}/get-songs`;
        const response = await fetch(apiUrlStream, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "songsRequested": titlesArray })
        });
        if (!response.ok) return [];
        const data = await response.json();
        return data.files || []; 
    } catch (error) { return []; }
}


/* ------------------------------------------------------
   FUNCIÓN DE RENDERIZADO
   ------------------------------------------------------ */
function setOnContainer(songsList) {
    const mainContainer = document.getElementById("mainPanel");
    if (!mainContainer) return;
    
    mainContainer.innerHTML = ""; 

    if (!songsList || songsList.length === 0) {
        const isSpotifyMode = localStorage.getItem('spotifyToken');
        const msg = isSpotifyMode 
            ? "No se encontraron recomendaciones en Spotify para tu perfil." 
            : "No se encontraron canciones locales disponibles.";
            
        mainContainer.innerHTML = `<div class="text-white-50 text-center mt-5 p-4 glass-panel">${msg}</div>`;
        return;
    }

    // Detectamos el tipo de la primera canción para poner el título correcto
    const isSpotify = songsList[0].type === 'spotify';
    
    // Renderizamos la sección única
    const title = isSpotify ? "Recomendado para ti (Spotify)" : "Tu Biblioteca Local";
    const icon = isSpotify ? "bi-spotify text-success" : "bi-hdd-network text-primary";
    
    renderSection(mainContainer, title, icon, songsList, isSpotify);
}

// --- Helper para pintar la lista ---
function renderSection(container, title, iconClass, songs, isSpotify) {
    // Título
    const header = document.createElement('h4');
    header.className = "text-white mb-3 d-flex align-items-center gap-2 mt-2";
    header.innerHTML = `<i class="bi ${iconClass}"></i> ${title}`;
    container.appendChild(header);

    // Grid de canciones
    songs.forEach((song, index) => {
        let card = document.createElement("div");
        card.className = "card mb-3 shadow-sm song-card glass-hover"; 
        card.style.cursor = "pointer";
        card.style.background = "rgba(255,255,255,0.05)";
        card.style.border = "1px solid rgba(255,255,255,0.05)";

        card.onclick = async () => {
            console.log(`⚡ Reproduciendo: ${song.title}`);

            if (isSpotify) {
                // --- MODO SPOTIFY ---
                const token = localStorage.getItem('spotifyToken');
                await playSpotifyUri(song.uri, token);
            } else {
                // --- MODO LOCAL ---
                if (typeof LocalPlayer !== 'undefined') {
                    // 1. Inyectamos la lista actual al reproductor para que sepa qué sigue
                    LocalPlayer.playlist = songs;
                    
                    // 2. Actualizamos UI Controller si existe
                    if (typeof uicontroller !== 'undefined') {
                        uicontroller.songs = songs;
                    }

                    // 3. Cargamos y reproducimos
                    await LocalPlayer.loadTrack(index, true);
                }
            }
        };

        card.innerHTML = `
            <div class="row g-0 align-items-center">
                <div class="col-3 col-md-2 p-2 text-center">
                    <img src="${song.cover}" class="img-fluid rounded" style="width: 60px; height: 60px; object-fit: cover;">
                </div>
                <div class="col-8 col-md-9">
                    <div class="card-body py-2 ps-0">
                        <h6 class="card-title fw-bold text-white mb-0 text-truncate">${song.title}</h6>
                        <p class="card-text text-white-50 small mb-0 text-truncate">${song.artist}</p>
                        ${song.details ? `<small class="text-white-50" style="font-size: 0.65rem">${song.details}</small>` : ''}
                    </div>
                </div>
                <div class="col-1 text-center">
                     ${isSpotify ? '<i class="bi bi-play-circle-fill text-success fs-4"></i>' : '<i class="bi bi-play-circle text-white-50 fs-4"></i>'}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

/* ==========================================================
   🛠️ FUNCIÓN DE REPRODUCCIÓN SPOTIFY (PUT)
   ========================================================== */
async function playSpotifyUri(uri, token) {
    if (!token) return console.error("❌ No hay token");
    
    // URL OFICIAL
    let url = `https://api.spotify.com/v1/me/player/play`;
    
    // Intentamos forzar el dispositivo actual si está listo
    let deviceId = window.SpotifyPlayerWrapper?.deviceId;
    if (deviceId) url += `?device_id=${deviceId}`;

    try {
        await fetch(url, {
            method: 'PUT',
            body: JSON.stringify({ uris: [uri] }),
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        });
    } catch (e) { console.error(e); }
}