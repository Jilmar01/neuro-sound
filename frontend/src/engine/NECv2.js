import { apiCall } from '../utils/fetch.js';

/**
 * Mapea los datos de la encuesta del frontend al esquema de Survey esperado por el backend.
 * @param {Object} rawSurvey - Carga útil de la encuesta del frontend.
 * @returns {Object} Carga útil formateada para el backend.
 */
export function mapSurveyToBackendPayload(rawSurvey) {
    if (!rawSurvey) {
        return {
            emotion: "calma",
            intensity: 3,
            tones: {
                group: [200, 396, 417],
                molestias: { tone1: 0, tone2: 0, tone3: 0 },
                favorite: "tone2",
                least_favorite: "tone3"
            },
            genres: ["Lofi", "Ambient"],
            artist_interest: [],
            tempo_preference: "normal",
            intent: 2
        };
    }

    // 1. Mapear emoción al conjunto esperado por el backend (tristeza, calma, alegria/felicidad, ira/molestia)
    let backendEmotion = 'calma';
    const rawEmotion = (rawSurvey.emotion || 'calma').toLowerCase();
    if (rawEmotion === 'zen') {
        backendEmotion = 'tristeza';
    } else if (rawEmotion === 'relajacion') {
        backendEmotion = 'alegria';
    } else if (['tristeza', 'calma', 'felicidad', 'alegria', 'ira', 'molestia'].includes(rawEmotion)) {
        backendEmotion = rawEmotion;
    }

    // 2. Mapear intensidad (escala de 1 a 10 en base a comoSiente o variables de estrés/tristeza)
    let intensity = 3;
    if (rawSurvey.comoSiente) {
        intensity = Math.round(rawSurvey.comoSiente * 2);
    } else if (rawSurvey.tristeza || rawSurvey.estres || rawSurvey.ansiedad) {
        intensity = Math.max(rawSurvey.tristeza || 1, rawSurvey.estres || 1, rawSurvey.ansiedad || 1);
    }
    intensity = Math.max(1, Math.min(10, intensity));

    // 3. Mapear intención (1=tristeza, 2=calma, 3=felicidad, 4=molestia)
    let intent = 2;
    if (rawSurvey.comoQuiere) {
        if (rawSurvey.comoQuiere <= 2) intent = 1;
        else if (rawSurvey.comoQuiere === 3) intent = 2;
        else intent = 3;
    } else if (rawSurvey.emotion === 'zen') {
        intent = 1;
    } else if (rawSurvey.emotion === 'calma') {
        intent = 2;
    } else if (rawSurvey.emotion === 'relajacion') {
        intent = 3;
    }

    // 4. Mapear tonos y frecuencia calibrada (Hawkins volume)
    const calibratedFreq = rawSurvey.volume || 200;
    const tones = {
        group: [calibratedFreq, 396, 417],
        molestias: {
            tone1: Math.max(0, 5 - (rawSurvey.comoSiente || 3)),
            tone2: 0,
            tone3: Math.max(0, (rawSurvey.estres || 3) - 3)
        },
        favorite: "tone2",
        least_favorite: "tone3"
    };

    // 5. Mapear géneros y artistas de interés desde localStorage si están presentes
    let genres = [];
    let artistInterest = [];
    try {
        const storedArtists = localStorage.getItem('selectedArtistsData');
        if (storedArtists) {
            const artistsList = JSON.parse(storedArtists);
            artistInterest = artistsList.map(a => a.name).filter(Boolean);
            artistsList.forEach(a => {
                const artistGenres = Array.isArray(a.genres) ? a.genres : (a.genre ? [a.genre] : []);
                artistGenres.forEach(g => {
                    if (g && !genres.includes(g)) genres.push(g);
                });
            });
        }
    } catch (e) {
        console.error("Error reading genres/artists for survey mapping:", e);
    }

    if (genres.length === 0) {
        genres = ["Lofi", "Ambient"];
    }

    // 6. Mapear tempo
    let tempoPreference = "normal";
    if (rawSurvey.emotion === 'zen' || rawSurvey.emotion === 'calma') {
        tempoPreference = "lento";
    } else if (rawSurvey.emotion === 'relajacion') {
        tempoPreference = "normal";
    }

    return {
        emotion: backendEmotion,
        intensity,
        tones,
        genres,
        artist_interest: artistInterest.length > 0 ? artistInterest : null,
        tempo_preference: tempoPreference,
        intent
    };
}

/**
 * Genera una nueva recomendación de canciones en el backend.
 * @param {Object} rawSurvey - Datos de la encuesta emocional del usuario.
 * @returns {Promise<Object|null>} Datos de la generación de recomendación.
 */
export async function generateRecommendation(rawSurvey = null) {
    console.log("⚡ GENERANDO RECOMENDACIÓN EN EL BACKEND...", rawSurvey);
    try {
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

        // Si hay una encuesta local, primero la registramos/guardamos en la base de datos
        if (rawSurvey) {
            console.log("💾 Registrando encuesta activa en el backend...");
            const backendPayload = mapSurveyToBackendPayload(rawSurvey);
            await apiCall('neuro', '/api/survey/register', 'POST', backendPayload);
            console.log("✅ Encuesta registrada correctamente.");
        }

        // Luego solicitamos al backend que genere las recomendaciones usando GET
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
        await generateRecommendation(rawSurvey);

        // 2. Obtener los detalles de la última recomendación generada
        const result = await getLatestRecommendation();

        // El backend almacena las canciones en el campo 'result'
        const playlistSongs = result?.result || result?.songs;

        if (result && Array.isArray(playlistSongs)) {
            console.log(`✅ Playlist recomendada recibida con ${playlistSongs.length} tracks.`);

            // Mapeamos las canciones del formato de MongoDB al formato enriquecido del reproductor
            return playlistSongs.map((song, idx) => ({
                id: song.id || song.track_id || `rec-${result.recommendationId || 'latest'}-${idx}`,
                title: song.title || song.name || 'Canción Desconocida',
                artist: Array.isArray(song.artists) ? song.artists.join(', ') : (song.artist || 'Artista Desconocido'),
                cover: song.cover || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjwpnpx7xR1WpHvUx8LUi2gZ6v3_Kwo235vwHux1GFHRpvFfQgjc2hroz00aWkf76aKfexB3-HFEXyhN2-Wy1ni3zOuFba7NYyKc2EMXafI-CRCKi0R-O4VOi-UV4RujbFto4TrVuUyWXycomJutNpNaFzSZiru9KDz_NHGhQPrrN7hXcoQHo_3jDu_TgYMvWJIM4Er55XPC16u_-gYPPUmlV4pzhcDWP0AD35dcMjy623l5HayeAwHKjVInj3G_fcubP6AACMrUo',
                preview_url: song.preview_url || song.file_url || null,
                energy: song.energy || 3,
                valence: song.valence || 7,
                bpm: song.bpm || song.tempo || 60,
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
    console.log(`⚡ [Local Bypass] Track ${trackId} se reproduce directamente desde el servidor de música.`);
    return null;
}