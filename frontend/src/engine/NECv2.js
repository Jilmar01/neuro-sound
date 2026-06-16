import { apiCall } from '../utils/fetch.js';

/**
 * Registra o actualiza la encuesta según si ya existe un _id.
 * Una sola encuesta por usuario; en sesiones siguientes se actualiza.
 * @param {Object} payload - Payload mapeado para el backend.
 * @returns {Promise<Object>} Respuesta del backend.
 */
export async function registerOrUpdateSurvey(payload) {
    const stored = localStorage.getItem('surveyData');
    const existing = stored ? JSON.parse(stored) : {};
    const storedUser = localStorage.getItem('user');
    let userObj = null;
    try { userObj = storedUser ? JSON.parse(storedUser) : null; } catch (_) { }

    // Buscar _id en múltiples ubicaciones: localStorage surveyData, payload, user.surveys
    let surveyId = existing?._id || payload?._id || payload?.id || payload?.surveyId;

    if (!surveyId && userObj?.surveys?.length > 0) {
        const last = userObj.surveys[userObj.surveys.length - 1];
        surveyId = last?._id || last?.id || last?.surveyId;
    }

    // Intentar actualizar (PUT); si falla, crear nueva (POST)
    try {
        const res = await apiCall('neuro', '/api/survey/update', 'PUT', payload);
        if (res?.success || res?.status === 'success') {
            return { ...res, surveyId: surveyId || res.data?._id };
        }
    } catch (putErr) {
        console.warn("⚠️ PUT falló, intentando crear nueva encuesta:", putErr.message);
    }

    try {
        const res = await apiCall('neuro', '/api/survey/register', 'POST', payload);
        if (res?.success && res.data?.surveyId) {
            const updated = { ...existing, ...payload, _id: res.data.surveyId };
            localStorage.setItem('surveyData', JSON.stringify(updated));
            return { ...res, surveyId: res.data.surveyId };
        }
        return res;
    } catch (e) {
        console.error("❌ Error registrando/actualizando encuesta:", e);
        throw e;
    }
}

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

    // 5. Mapear géneros y artistas de interés
    let genres = [];
    let artistInterest = [];

    // Si es undefined explícitamente, no enviar — el backend preserva los valores existentes
    if (rawSurvey.artist_interest !== undefined) {
        if (rawSurvey.artist_interest && rawSurvey.artist_interest.length > 0) {
            // Usar los que vienen de la base de datos a través de rawSurvey
            artistInterest = [...rawSurvey.artist_interest];
            if (rawSurvey.genres && rawSurvey.genres.length > 0) {
                genres = [...rawSurvey.genres];
            } else {
                genres = ["Lofi", "Ambient"];
            }
        } else {
            // Fallback a localStorage si rawSurvey no los trae
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
        }
    }

    // 6. Mapear tempo
    let tempoPreference = "normal";
    if (rawSurvey.emotion === 'zen' || rawSurvey.emotion === 'calma') {
        tempoPreference = "lento";
    } else if (rawSurvey.emotion === 'relajacion') {
        tempoPreference = "normal";
    }

    const payload = {
        emotion: backendEmotion,
        intensity,
        tones,
        tempo_preference: tempoPreference,
        intent
    };

    // Solo incluir artist_interest/genres si no son undefined (preservar backend)
    if (rawSurvey.artist_interest !== undefined) {
        payload.genres = genres;
        payload.artist_interest = artistInterest.length > 0 ? artistInterest : null;
    }

    return payload;
}

/**
 * Genera una nueva recomendación de canciones en el backend.
 * @param {Object} rawSurvey - Datos de la encuesta emocional del usuario.
 * @returns {Promise<Object|null>} Datos de la generación de recomendación.
 */
export async function generateRecommendation(rawSurvey = null) {
    console.log("⚡ GENERANDO RECOMENDACIÓN EN EL BACKEND...", rawSurvey);
    try {
        let survey = rawSurvey;
        if (!survey) {
            try {
                const storedSurvey = localStorage.getItem('surveyData');
                if (storedSurvey) {
                    survey = JSON.parse(storedSurvey);
                }
            } catch (e) {
                console.error("❌ Error reading surveyData from localStorage:", e);
            }
        }

        if (!survey) {
            console.warn("⚠️ No hay encuesta local disponible. No se puede generar recomendación.");
            throw new Error("No hay datos de encuesta para generar recomendación");
        }

        console.log("💾 Usando encuesta activa para generar recomendación...");
        // El backend internamente hace getProfileUser(userId) y lee la última encuesta de la BD
        const response = await apiCall('neuro', '/api/recommend/generate', 'GET');
        if (response && (response.success || response.status === 'success')) {
            return response.data || response.recomendacionGenerada || response;
        }
        throw new Error(response?.message || "Error en respuesta del servidor");

        /*return [
            { id: "41sGC22d62AApd4dbiwhfr", uri: "http://172.210.237.82:8000/songs/Limbo.mp3", title: "Limbo", artists: ["Fernando Pessoa"], neuro_score: 95.8 },
            { id: "0eb1PfHxT6HnXvvdUOzmME", uri: "http://172.210.237.82:8000/songs/Just%20the%20Way%20You%20Are.mp3", title: "Just the Way You Are", artists: ["P!ink"], neuro_score: 93.6 },
            { id: "3QkuxlHi5RXa2YBr6S52n3", uri: "http://172.210.237.82:8000/songs/Royalty.mp3", title: "Royalty", artists: ["Fernando Pessoa"], neuro_score: 93.4 },
        ];*/
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
            if (response && (response.success || response.status === 'success')) {
                return response.data || response.recomendacionGenerada || response;
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
            // 1. Generar la recomendación y capturar su respuesta directa
            const genResult = await generateRecommendation(rawSurvey);
            const genData = genResult?.tracks || genResult?.result || genResult?.songs || genResult;

            if (Array.isArray(genData) && genData.length > 0) {
                if (typeof genData[0] === 'object') {
                    console.log(`✅ Playlist enriquecida desde generate: ${genData.length} pistas.`);
                    return genData.map((track) => {
                        const audioUrl = track.uri || track.preview_url || track.spotify_link || '';
                        const fileName = decodeURIComponent(audioUrl.split('/').pop()?.replace(/\.mp3$/, '') || '').replace(/_/g, ' ') || 'Canción';
                        const neuroScore = track.neuro_score ?? 50;
                        return {
                            id: track.id || track.track_id,
                            uri: '',
                            title: track.title || track.name || fileName || 'Canción Desconocida',
                            artist: track.artist || (Array.isArray(track.artists) ? track.artists.map(a => typeof a === 'string' ? a : a.name).join(', ') : 'NeuroSound'),
                            cover: track.cover || track.album?.images?.[0]?.url || '',
                            preview_url: audioUrl || null,
                            energy: track.energy ?? Math.round(neuroScore / 10),
                            valence: track.valence ?? 7,
                            bpm: track.bpm ?? 60,
                            genre: track.genre || rawSurvey?.emotion || 'Calma',
                            recommendationId: genResult?._id || null,
                            feedback: track.feedback !== undefined ? track.feedback : null
                        };
                    });
                }
                if (spotifyTokenArg) {
                    console.log(`✅ IDs recibidos: ${genData.length}. Obteniendo metadata de Spotify...`);

                    const idsString = genData.join(',');
                    const spotifyRes = await fetch(`https://api.spotify.com/v1/tracks?ids=${idsString}`, {
                        headers: { 'Authorization': `Bearer ${spotifyTokenArg}` }
                    });

                    if (!spotifyRes.ok) throw new Error("Fallo al obtener metadata de Spotify");
                    const spotifyData = await spotifyRes.json();

                    return spotifyData.tracks.map((track) => {
                        const originalTrack = genData.find(t => (t.id || t.track_id) === track.id);
                        return {
                            id: track.id,
                            uri: track.uri,
                            title: track.name || 'Canción Desconocida',
                            artist: track.artists?.map(a => a.name).join(', ') || 'Artista Desconocido',
                            cover: track.album?.images?.[0]?.url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjwpnpx7xR1WpHvUx8LUi2gZ6v3_Kwo235vwHux1GFHRpvFfQgjc2hroz00aWkf76aKfexB3-HFEXyhN2-Wy1ni3zOuFba7NYyKc2EMXafI-CRCKi0R-O4VOi-UV4RujbFto4TrVuUyWXycomJutNpNaFzSZiru9KDz_NHGhQPrrN7hXcoQHo_3jDu_TgYMvWJIM4Er55XPC16u_-gYPPUmlV4pzhcDWP0AD35dcMjy623l5HayeAwHKjVInj3G_fcubP6AACMrUo',
                            preview_url: track.preview_url || null,
                            energy: 3,
                            valence: 7,
                            bpm: 60,
                            genre: rawSurvey?.emotion || 'Calma',
                            recommendationId: genResult?._id || null,
                            feedback: originalTrack && originalTrack.feedback !== undefined ? originalTrack.feedback : null
                        };
                    });
                }
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