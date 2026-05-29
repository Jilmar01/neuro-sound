import { apiCall } from '../utils/fetch.js';

/**
 * Genera una nueva recomendación de canciones en el backend.
 * @returns {Promise<Object|null>} Datos de la generación de recomendación.
 */
export async function generateRecommendation() {
    console.log("⚡ GENERANDO RECOMENDACIÓN EN EL BACKEND...");
    try {
        const response = await apiCall('neuro', '/api/recommend/generate', 'GET');
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
        // 1. Generar la recomendación en base al usuario autenticado
        await generateRecommendation();

        // 2. Obtener los detalles de la última recomendación generada
        const result = await getLatestRecommendation();

        if (result && Array.isArray(result.songs)) {
            console.log(`✅ Playlist recomendada recibida con ${result.songs.length} tracks.`);
            
            // Mapeamos las canciones del formato simple {title, artist} al formato enriquecido del reproductor
            return result.songs.map((song, idx) => ({
                id: `rec-${result.recommendationId || 'latest'}-${idx}`,
                title: song.title,
                artist: song.artist,
                cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjwpnpx7xR1WpHvUx8LUi2gZ6v3_Kwo235vwHux1GFHRpvFfQgjc2hroz00aWkf76aKfexB3-HFEXyhN2-Wy1ni3zOuFba7NYyKc2EMXafI-CRCKi0R-O4VOi-UV4RujbFto4TrVuUyWXycomJutNpNaFzSZiru9KDz_NHGhQPrrN7hXcoQHo_3jDu_TgYMvWJIM4Er55XPC16u_-gYPPUmlV4pzhcDWP0AD35dcMjy623l5HayeAwHKjVInj3G_fcubP6AACMrUo',
                preview_url: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(idx % 4) + 1}.mp3`,
                energy: 3,
                valence: 7,
                bpm: 60,
                genre: rawSurvey?.emotion || 'Calma'
            }));
        }
        throw new Error("Formato de respuesta de recomendación no válido");
    } catch (error) {
        console.warn("⚠️ El backend no devolvió recomendaciones. Se activará el fallback local en el cliente:", error);
        return null; // Retornar null para forzar el uso de fallbackPlaylist en App.jsx
    }
}