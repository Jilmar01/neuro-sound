/* ==========================================
   js/recommendations.js
   Controlador de Vista: Conecta el Neuro-Engine con el HTML
   ========================================== */
   import { getSurvey } from '/js/Engine/getData.js';
   import { generateHybridPlaylist } from '/js/Engine/NECv2.js'
   import { apiCall } from '/js/refactored/fetch.js';

console.log("📄 recommendations.js cargado correctamente.");

// 1. IMPORTAMOS EL CEREBRO HÍBRIDO
//import { generateHybridPlaylist } from './Engine/neuroEngineController.js';

// Función principal
/*export async function obtenerRecomendaciones() {
    
    const spotifyToken = localStorage.getItem('spotifyToken') || localStorage.getItem('access_token');
    // Intentamos obtener la encuesta del localStorage
    let userSurvey = await getSurvey();
    console.log("encuesta obtenida", userSurvey);

    // Si no hay encuesta guardada, usamos un default temporal para que no rompa
    if (!userSurvey) {
        console.warn("⚠️ No se encontró encuesta en localStorage. Usando perfil default 'Calma'.");
        userSurvey = { emotion: "calma", genres: ["Pop", "Ambient"], intent: 3 };
    }

    // ------------------------------------------------------
    // 1. MODO NEURO-HÍBRIDO
    // ------------------------------------------------------
    if (spotifyToken) {
        console.log("🟢 Token encontrado. Iniciando Motor Neuro-Híbrido...");
        
        try {
            const hybridResults = await generateHybridPlaylist(spotifyToken, userSurvey);

            if (hybridResults && hybridResults.length > 0) {
                console.log(`🧠 Motor generó ${hybridResults.length} recomendaciones.`);
                
                // Adaptamos los datos para la vista
                return hybridResults.map(item => ({
                    title: item.display_data.title,
                    artist: item.display_data.artist,
                    cover: item.display_data.cover,
                    uri: item.display_data.uri,
                    preview_url: item.display_data.preview_url,
                    score: item.neuro_score, 
                    type: 'spotify',
                    details: `Match: ${item.neuro_score}%`
                }));
            }
        } catch (e) {
            console.error("❌ Error en Neuro-Engine:", e);
        }
    }

    // ------------------------------------------------------
    // 2. MODO LOCAL (Fallback)
    // ------------------------------------------------------
    console.log("🟠 Fallback a biblioteca local...");
    return []; // Aquí iría tu lógica local si la necesitas
}*/
export async function obtenerRecomendaciones() {
    
    const spotifyToken = localStorage.getItem('spotifyToken') || localStorage.getItem('access_token');

    if (!spotifyToken) {
        console.error("🔴 Falta Token. No se puede iniciar.");
        return [];
    }

    try {
        console.log("⏳ Pidiendo playlist al Controlador...");
        
        // 🚀 EL CAMBIO CLAVE:
        // dbSource.js YA nos devuelve la lista con { title, artist, cover, score }.
        // Así que NO hacemos .map() aquí. Lo tomamos tal cual.
        const finalList = await generateHybridPlaylist(spotifyToken);
        
        // Pasamos la lista limpia directamente al pintor
        return finalList;

    } catch (error) {
        console.error("❌ Error obteniendo recomendaciones:", error);
        return [];
    }
}

// Función de Renderizado (Pintar en HTML)
/*export function setOnContainer(songsList) {
    console.log("🎨 setOnContainer: Intentando pintar en el DOM...", songsList);
    const mainContainer = document.getElementById("mainPanel");
    if (!mainContainer) {
        console.error("❌ Error: No existe el div con id='mainPanel' en el HTML.");
        return;
    }
    
    mainContainer.innerHTML = ""; 

    if (!songsList || songsList.length === 0) {
        mainContainer.innerHTML = `<div class="text-white-50 text-center mt-5 p-4">No se encontraron recomendaciones.</div>`;
        return;
    }

    // Header
    const header = document.createElement('h4');
    header.className = "text-white mb-3 d-flex align-items-center gap-2 mt-2";
    header.innerHTML = `<i class="bi bi-cpu text-info"></i> Selección Neuro-Acústica`;
    mainContainer.appendChild(header);

    // Cards
    songsList.forEach((song) => {
        let card = document.createElement("div");
        card.className = "card mb-3 shadow-sm song-card"; 
        card.style.background = "rgba(255,255,255,0.05)";
        card.style.cursor = "pointer";

        // Click para reproducir
        card.onclick = () => {
            console.log(`⚡ Play: ${song.title}`);
            playSpotifyUri(song.uri, localStorage.getItem('spotifyToken'));
        };

        const scoreBadge = song.score ? `<span class="badge bg-info text-dark float-end">${song.score}%</span>` : '';

        card.innerHTML = `
            <div class="row g-0 align-items-center">
                <div class="col-3 col-md-2 p-2 text-center">
                    <img src="${song.cover}" class="img-fluid rounded" style="width: 60px; height: 60px; object-fit: cover;">
                </div>
                <div class="col-8 col-md-9">
                    <div class="card-body py-2 ps-0">
                        <div class="d-flex justify-content-between">
                            <h6 class="card-title fw-bold text-white mb-0 text-truncate">${song.title}</h6>
                            ${scoreBadge}
                        </div>
                        <p class="card-text text-white-50 small mb-0">${song.artist}</p>
                    </div>
                </div>
            </div>
        `;
        mainContainer.appendChild(card);
    });
}*/

/* public/js/recommendations.js */

export function setOnContainer(songsList) {
    // 🛡️ BLINDAJE
    if (!songsList) {
        console.warn("⚠️ setOnContainer recibió 'undefined'. Ignorando.");
        return; 
    }

    console.log("🎨 setOnContainer: Recibido:", songsList);

    const mainContainer = document.getElementById("mainPanel");
    if (!mainContainer) return;
    
    mainContainer.innerHTML = ""; 

    if (songsList.length === 0) {
        mainContainer.innerHTML = `
            <div class="d-flex flex-column align-items-center justify-content-center text-white-50 mt-5 fade-in">
                <i class="bi bi-disc fs-1 mb-3 opacity-50"></i>
                <p>No se encontraron recomendaciones.</p>
            </div>`;
        return;
    }

    // Header
    const header = document.createElement('div');
    header.className = "d-flex justify-content-between align-items-center mb-3 px-2 fade-in";
    header.innerHTML = `
        <h5 class="text-white mb-0"><i class="bi bi-soundwave text-info me-2"></i>Tu Selección</h5>
        <span class="badge bg-dark border border-secondary text-white-50">${songsList.length}</span>
    `;
    mainContainer.appendChild(header);

    // Cards
    songsList.forEach((song, index) => {
        let card = document.createElement("div");
        card.className = "card mb-3 shadow-sm border-0 fade-in"; 
        card.style.background = "rgba(255, 255, 255, 0.05)"; 
        card.style.backdropFilter = "blur(12px)";
        card.style.cursor = "pointer";
        card.style.animation = `fadeIn 0.5s ease forwards ${index * 0.1}s`;

        card.onclick = () => {
            console.log(`▶️ Play: ${song.title}`);
            playSpotifyUri(song.uri);
        };

        // NOTA: Aquí usamos song.score directamente porque dbSource ya lo puso ahí.
        // No buscamos song.neuro_score ni song.display_data
        const scoreVal = song.score || 0;
        const scoreBadge = scoreVal > 0
            ? `<span class="badge bg-success bg-opacity-75 ms-auto">${Math.round(scoreVal)}%</span>` 
            : '';

        card.innerHTML = `
            <div class="row g-0 align-items-center p-2">
                <div class="col-3 col-sm-2 text-center">
                    <img src="${song.cover || '/img/default-cover.png'}" 
                         class="img-fluid rounded shadow-sm" 
                         style="width: 55px; height: 55px; object-fit: cover;"
                         loading="lazy"
                         onerror="this.src='/img/default-cover.png'"
                         alt="${song.title}">
                </div>
                <div class="col-9 col-sm-10">
                    <div class="card-body py-1 px-3">
                        <div class="d-flex align-items-center mb-1">
                            <h6 class="card-title fw-bold text-white mb-0 text-truncate w-75">${song.title}</h6>
                            ${scoreBadge}
                        </div>
                        <p class="card-text text-white-50 small mb-0 text-truncate">${song.artist}</p>
                    </div>
                </div>
            </div>
        `;
        mainContainer.appendChild(card);
    });
}

// Helper Spotify Play
async function playSpotifyUri(uri) {
    if (!uri) return;
    let deviceId = window.SpotifyPlayerWrapper?.deviceId; 
    let queryParams = deviceId ? `?device_id=${deviceId}` : '';

    try {
        await apiCall('spotify', `/me/player/play${queryParams}`, 'PUT', { uris: [uri] });
    } catch (e) {
        console.warn("⚠️ Error al reproducir:", e);
    }
}

/* ==========================================================
   🚀 AUTO-ARRANQUE (ESTO ES LO QUE TE FALTABA)
   ========================================================== */
/*(async function initSystem() {
    console.log("⚡ Auto-iniciando sistema de recomendaciones...");

    // Esperar a que el HTML cargue
    if (document.readyState === 'loading') {
        await new Promise(resolve => window.addEventListener('DOMContentLoaded', resolve));
    }

    try {
        const songs = await obtenerRecomendaciones();
        setOnContainer(songs);
    } catch (error) {
        console.error("❌ Error fatal en el auto-arranque:", error);
    }
})();*/