/* ==========================================
   js/recommendations.js
   Controlador de Vista
   ========================================== */
import { generateHybridPlaylist } from '/js/Engine/NECv2.js'
import { apiCall } from '/js/refactored/fetch.js';
import SpotifyPlayerWrapper from '/js/spotifyPlayer.js';

// 👇 1. IMPORTAMOS TU NUEVO REPRODUCTOR
import LocalPlayer from '/js/localPlayer.js'; 

console.log("📄 recommendations.js cargado.");

export async function obtenerRecomendaciones() {
    
    const spotifyToken = localStorage.getItem('spotifyToken');

    if (!spotifyToken) {
        console.warn("⚠️ Modo: SERVIDOR LOCAL (Sin Token).");
    } else {
        console.log("✅ Modo: SPOTIFY API.");
    }

    try {
        console.log("⏳ Pidiendo playlist...");
        const finalList = await generateHybridPlaylist(spotifyToken);
        
        // 👇 2. INICIALIZAMOS EL LOCAL PLAYER CON LOS DATOS
        // Esto le da la lista completa al reproductor para que funcione el 'Next'
        if (finalList && finalList.length > 0) {
            LocalPlayer.init(finalList);
            SpotifyPlayerWrapper.updatePlaylist(finalList);
        }

        return finalList;

    } catch (error) {
        console.error("❌ Error:", error);
        return [];
    }
}

export function setOnContainer(songsList) {
    if (!songsList) return;
    const mainContainer = document.getElementById("mainPanel");
    if (!mainContainer) return;
    
    mainContainer.innerHTML = ""; 

    if (songsList.length === 0) {
        mainContainer.innerHTML = `<div class="text-white-50 p-5 text-center">Sin resultados.</div>`;
        return;
    }

    // (Tu código de Header aquí... lo omito para ahorrar espacio)

    songsList.forEach((song, index) => {
        let card = document.createElement("div");
        card.className = "card mb-3 shadow-sm border-0 fade-in"; 
        card.style.background = "rgba(255, 255, 255, 0.05)"; 
        card.style.cursor = "pointer";
        card.style.animation = `fadeIn 0.5s ease forwards ${index * 0.1}s`;

        // 👇 3. CLICK: USAR EL PLAYER CORRESPONDIENTE
        card.onclick = () => {
            playHybridTrack(song, index);
        };

        // (Tu HTML de la carta...)
        card.innerHTML = `
            <div class="row g-0 align-items-center p-2">
                <div class="col-3 col-sm-2 text-center">
                    <img src="${song.cover}" class="img-fluid rounded" style="width:55px;">
                </div>
                <div class="col-9 col-sm-10">
                    <div class="card-body py-1 px-3">
                        <h6 class="text-white mb-0 text-truncate">${song.title}</h6>
                        <p class="text-white-50 small mb-0">${song.artist}</p>
                    </div>
                </div>
            </div>
        `;
        mainContainer.appendChild(card);
    });
}

/**
 * 🎧 FUNCIÓN MAESTRA DE REPRODUCCIÓN
 */
export async function playHybridTrack(track, index) {
    console.log(`▶️ Play Request: ${track.title}`);

    const spotifyToken = localStorage.getItem('spotifyToken');
    const isLocalMode = track.type === 'local' || !spotifyToken;

    if (isLocalMode) {
        // --- MODO LOCAL: USAMOS TU LocalPlayer.js ---
        console.log("🟠 Usando LocalPlayer...");
        
        // Llamamos al método loadTrack de tu archivo localPlayer.js
        // Usamos el índice para que sepa en qué posición de la playlist está
        LocalPlayer.loadTrack(index, true);

    } else {
        // --- MODO SPOTIFY ---
        console.log("🟢 Usando Spotify Remote...");
        SpotifyPlayerWrapper.playTrackAtIndex(index);
    }
}

async function playSpotifyUri(uri) {
    if (!uri) return;
    let deviceId = window.SpotifyPlayerWrapper?.deviceId; 
    let queryParams = deviceId ? `?device_id=${deviceId}` : '';
    try {
        await apiCall('spotify', `/me/player/play${queryParams}`, 'PUT', { uris: [uri] });
    } catch (e) { console.warn("Spotify Play Error:", e); }
}