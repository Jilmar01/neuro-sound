import { apiCall } from '../utils/fetch.js';

/**
 * Registra o actualiza la encuesta según si ya existe un _id.
 * Una sola encuesta por usuario; en sesiones siguientes se actualiza.
 * @param {Object} payload - Payload mapeado para el backend.
 * @returns {Promise<Object>} Respuesta del backend.
 */
export async function registerOrUpdateSurvey(payload) {
    try {
        const stored = localStorage.getItem('surveyData');
        const existing = stored ? JSON.parse(stored) : {};
        const surveyId = existing?._id;

        if (surveyId) {
            const res = await apiCall('neuro', `/api/survey/update/${surveyId}`, 'PUT', payload);
            return { ...res, surveyId };
        }

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

        if (survey) {
            console.log("💾 Registrando encuesta activa en el backend...");
            const backendPayload = mapSurveyToBackendPayload(survey);

            // Asegurar que artist_interest y emotion siempre estén poblados
            if (!backendPayload.artist_interest || backendPayload.artist_interest.length === 0) {
                try {
                    const storedArtists = localStorage.getItem('selectedArtistsData');
                    if (storedArtists) {
                        const artistsList = JSON.parse(storedArtists);
                        backendPayload.artist_interest = artistsList.map(a => a.name).filter(Boolean);
                        artistsList.forEach(a => {
                            const artistGenres = Array.isArray(a.genres) ? a.genres : (a.genre ? [a.genre] : []);
                            artistGenres.forEach(g => {
                                if (g && !backendPayload.genres.includes(g)) backendPayload.genres.push(g);
                            });
                        });
                    }
                } catch (e) {
                    console.error("❌ Error leyendo artistas de localStorage:", e);
                }
            }

            await registerOrUpdateSurvey(backendPayload);
            console.log("✅ Encuesta registrada/actualizada correctamente.");
        } else {
            console.warn("⚠️ No hay encuesta local disponible. El backend usará la última encuesta registrada.");
        }

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
        // 1. Generar la recomendación y capturar su respuesta directa
        const genResult = await generateRecommendation(rawSurvey);
        const genData = genResult?.result || genResult?.songs || genResult;

        if (Array.isArray(genData) && genData.length > 0) {
            if (typeof genData[0] === 'object') {
                console.log(`✅ Playlist enriquecida desde generate: ${genData.length} pistas.`);
                return genData.map((track) => ({
                    id: track.id || track.track_id,
                    uri: track.uri || track.spotify_link || track.preview_url,
                    title: track.title || track.name || 'Canción Desconocida',
                    artist: track.artist || track.artists?.map?.(a => a.name)?.join(', ') || 'Artista Desconocido',
                    cover: track.cover || track.album?.images?.[0]?.url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjwpnpx7xR1WpHvUx8LUi2gZ6v3_Kwo235vwHux1GFHRpvFfQgjc2hroz00aWkf76aKfexB3-HFEXyhN2-Wy1ni3zOuFba7NYyKc2EMXafI-CRCKi0R-O4VOi-UV4RujbFto4TrVuUyWXycomJutNpNaFzSZiru9KDz_NHGhQPrrN7hXcoQHo_3jDu_TgYMvWJIM4Er55XPC16u_-gYPPUmlV4pzhcDWP0AD35dcMjy623l5HayeAwHKjVInj3G_fcubP6AACMrUo',
                    preview_url: track.preview_url || null,
                    energy: track.energy ?? 3,
                    valence: track.valence ?? 7,
                    bpm: track.bpm ?? 60,
                    genre: track.genre || rawSurvey?.emotion || 'Calma'
                }));
            }
            if (spotifyTokenArg) {
                console.log(`✅ IDs recibidos: ${genData.length}. Obteniendo metadata de Spotify...`);

                const idsString = genData.join(',');
                const spotifyRes = await fetch(`https://api.spotify.com/v1/tracks?ids=${idsString}`, {
                    headers: { 'Authorization': `Bearer ${spotifyTokenArg}` }
                });

                if (!spotifyRes.ok) throw new Error("Fallo al obtener metadata de Spotify");
                const spotifyData = await spotifyRes.json();

                return spotifyData.tracks.map((track) => ({
                    id: track.id,
                    uri: track.uri,
                    title: track.name || 'Canción Desconocida',
                    artist: track.artists?.map(a => a.name).join(', ') || 'Artista Desconocido',
                    cover: track.album?.images?.[0]?.url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjwpnpx7xR1WpHvUx8LUi2gZ6v3_Kwo235vwHux1GFHRpvFfQgjc2hroz00aWkf76aKfexB3-HFEXyhN2-Wy1ni3zOuFba7NYyKc2EMXafI-CRCKi0R-O4VOi-UV4RujbFto4TrVuUyWXycomJutNpNaFzSZiru9KDz_NHGhQPrrN7hXcoQHo_3jDu_TgYMvWJIM4Er55XPC16u_-gYPPUmlV4pzhcDWP0AD35dcMjy623l5HayeAwHKjVInj3G_fcubP6AACMrUo',
                    preview_url: track.preview_url || null,
                    energy: 3,
                    valence: 7,
                    bpm: 60,
                    genre: rawSurvey?.emotion || 'Calma'
                }));
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