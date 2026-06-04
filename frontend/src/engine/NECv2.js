import { apiCall } from '../utils/fetch.js';

/**
 * Genera una nueva recomendación de canciones en el backend.
 * @param {Object} rawSurvey - Datos de la encuesta emocional del usuario.
 * @returns {Promise<Object|null>} Datos de la generación de recomendación.
 */
export async function generateRecommendation(rawSurvey = null) {
    console.log("⚡ GENERANDO RECOMENDACIÓN EN EL BACKEND CON ENCUESTA...", rawSurvey);
    try {
        const method = rawSurvey ? 'POST' : 'GET';
        
        // Enrich payload with selectedArtists and dislikedTracks from localStorage
        const payload = { ...(rawSurvey || {}) };
        try {
            const stored = localStorage.getItem('selectedArtists');
            if (stored) {
                payload.selectedArtists = JSON.parse(stored);
            }
        } catch (e) {
            console.error("❌ Error reading selectedArtists from localStorage:", e);
        }
        try {
            const storedDisliked = localStorage.getItem('dislikedTracks');
            if (storedDisliked) {
                payload.dislikedTracks = JSON.parse(storedDisliked);
            }
        } catch (e) {
            console.error("❌ Error reading dislikedTracks from localStorage:", e);
        }
        try {
            const storedPlayed = localStorage.getItem('playedTracks');
            if (storedPlayed) {
                payload.playedTracks = JSON.parse(storedPlayed);
            }
        } catch (e) {
            console.error("❌ Error reading playedTracks from localStorage:", e);
        }

        const response = await apiCall('neuro', '/api/recommend/generate', method, payload);
        if (response && response.success) {
            return response.data;
        }
        throw new Error(response?.message || "Error en respuesta del servidor");
    } catch (error) {
        console.error("❌ Error en generateRecommendation:", error);
        return null;
    }
}

/**
 * Obtiene la última recomendación generada en el backend.
 * @returns {Promise<Object|null>} Lista de canciones recomendadas.
 */
export async function getLatestRecommendation() {
    console.log("🔍 OBTENIENDO ÚLTIMA RECOMENDACIÓN...");
    try {
        const response = await apiCall('neuro', '/api/recommend/latest', 'GET');
        if (response && response.success) {
            return response.data;
        }
        throw new Error(response?.message || "Error en respuesta del servidor");
    } catch (error) {
        console.error("❌ Error en getLatestRecommendation:", error);
        return null;
    }
}

/**
 * Solicita recomendaciones de canciones al backend utilizando la encuesta del usuario
 * llamando a las rutas oficiales de generación y obtención.
 * @param {string} spotifyTokenArg - Token de acceso de Spotify.
 * @param {Object} rawSurvey - Datos de la encuesta emocional del usuario.
 * @returns {Promise<Array|null>} Lista de pistas recomendadas o null para activar el fallback en el frontend.
 */
export async function generateHybridPlaylist(spotifyTokenArg, rawSurvey) {
    console.log("🏭 SOLICITANDO RECOMENDACIONES AL BACKEND...");
    try {
        // 1. Generar la recomendación en base al usuario autenticado y la encuesta
        await generateRecommendation(rawSurvey);

        // 2. Obtener los detalles de la última recomendación generada
        const result = await getLatestRecommendation();

        if (result && Array.isArray(result.songs)) {
            console.log(`✅ Playlist recomendada recibida con ${result.songs.length} tracks.`);
            
            // Mapeamos las canciones del formato de MongoDB al formato enriquecido del reproductor
            return result.songs.map((song, idx) => ({
                id: song.track_id || `rec-${result.recommendationId || 'latest'}-${idx}`,
                title: song.name || 'Canción Desconocida',
                artist: Array.isArray(song.artists) ? song.artists.join(', ') : (song.artist || 'Artista Desconocido'),
                cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjwpnpx7xR1WpHvUx8LUi2gZ6v3_Kwo235vwHux1GFHRpvFfQgjc2hroz00aWkf76aKfexB3-HFEXyhN2-Wy1ni3zOuFba7NYyKc2EMXafI-CRCKi0R-O4VOi-UV4RujbFto4TrVuUyWXycomJutNpNaFzSZiru9KDz_NHGhQPrrN7hXcoQHo_3jDu_TgYMvWJIM4Er55XPC16u_-gYPPUmlV4pzhcDWP0AD35dcMjy623l5HayeAwHKjVInj3G_fcubP6AACMrUo',
                // If already downloaded: use backend URL. Otherwise null — the on-demand processor
                // in App.jsx will fetch and update it when this track becomes active.
                preview_url: (song.file_url && song.file_url.includes("/processed/")) ? `http://${window.location.hostname}:5002${song.file_url}` : null,
                energy: song.energy || 3,
                valence: song.vocal_presence ? Math.round(song.vocal_presence * 10) : 7,
                bpm: song.bpm || 60,
                genre: song.genre || rawSurvey?.emotion || 'Calma'
            }));
        }
        throw new Error("Formato de respuesta de recomendación no válido");
    } catch (error) {
        console.warn("⚠️ El backend no devolvió recomendaciones. Se activará el fallback local en el cliente:", error);
        return null; // Retornar null para forzar el uso de fallbackPlaylist en App.jsx
    }
}

/**
 * Solicita el procesamiento terapéutico de un track específico en el backend.
 * @param {string} trackId - ID del track a procesar.
 * @param {Object} surveyData - Datos de la encuesta (ansiedad, estres, tristeza).
 * @returns {Promise<string|null>} URL del archivo de audio procesado, o null si no disponible.
 */
export async function processTrackOnDemand(trackId, surveyData) {
    console.log(`⚡ SOLICITANDO PROCESAMIENTO TERAPÉUTICO ON-DEMAND PARA EL TRACK ${trackId}...`);
    try {
        const payload = {
            track_id: trackId,
            estres: surveyData?.estres || 3,
            ansiedad: surveyData?.ansiedad || 3,
            tristeza: surveyData?.tristeza || 1,
            volume: surveyData?.volume !== undefined ? surveyData.volume : 45
        };
        const response = await apiCall('neuro', '/api/recommend/process', 'POST', payload);
        if (response && response.success) {
            console.log(`✅ Track ${trackId} procesado con éxito: ${response.file_url}`);
            return response.file_url;
        }
        throw new Error(response?.error || "Error en respuesta del servidor");
    } catch (error) {
        // 422 = El audio no está disponible en YouTube — esto no es un crash, solo skip
        const is422 = error?.message?.includes('Error HTTP 422') || error?.message?.includes('422');
        if (is422) {
            console.warn(`⚠️ Track ${trackId} no disponible en YouTube (422). Saltando...`);
            const notAvailableErr = new Error('TRACK_NOT_AVAILABLE');
            notAvailableErr.notAvailable = true;
            throw notAvailableErr;
        }
        console.error("❌ Error en processTrackOnDemand:", error);
        return null;
    }
}