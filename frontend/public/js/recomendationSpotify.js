// public/js/recomendationSpotify.js

/**
 * FASE 1: RECLUTADOR (Legacy Engine)
 * Se encarga de buscar en Spotify y traer candidatos con Audio e Imagen.
 */

/* public/js/Engine/recomendationSpotify.js */

export async function getSpotifyCandidates(token, survey) {
    console.log("🕵️ SpotifySource: Validando datos de encuesta...", survey);

    // 1. SANITIZACIÓN DE DATOS (El paso clave)
    // Extraemos la emoción y los géneros, sin importar si vienen como array o string
    const emotion = survey.emotion || "calma";
    
    let genresStr = "";
    if (Array.isArray(survey.genres)) {
        // Si es un array (como viene de tu BD), tomamos los 2 primeros
        genresStr = survey.genres.slice(0, 2).join(" ");
    } else if (typeof survey.genres === 'string') {
        genresStr = survey.genres;
    } else if (survey.genre) {
        // Soporte retrocompatible por si acaso
        genresStr = survey.genre;
    } else {
        // Fallback si no hay géneros
        genresStr = "Pop Ambient";
    }

    // 2. VALIDACIÓN RELAJADA
    // Si tenemos al menos una emoción O un género, procedemos.
    if (!emotion && !genresStr) {
        console.warn("⚠️ Datos insuficientes. Se requiere emoción o género.");
        return [];
    }

    // 3. CONSTRUCCIÓN DE LA QUERY
    // Ejemplo: "calma Classical Pop mix"
    const query = `${emotion} ${genresStr} mix`;
    
    // Aleatoriedad para que no salgan siempre las mismas
    const randomOffset = Math.floor(Math.random() * 5); 

    console.log(`🔎 Query Generada: "${query}" | Offset: ${randomOffset}`);

    try {
        const response = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=50&offset=${randomOffset}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!data.tracks || !data.tracks.items) {
            console.warn("⚠️ Spotify no devolvió canciones.");
            return [];
        }

        const candidates = data.tracks.items;
        console.log(`✅ SpotifySource: ${candidates.length} candidatos encontrados.`);
        
        // Retornamos el array de canciones crudas de Spotify
        return candidates;

    } catch (e) {
        console.error("❌ Error conectando con Spotify Search:", e);
        return [];
    }
}

// Función interna exportada (por si acaso)
export async function searchPlaylists(token, survey) {
    const shuffledGenres = (survey.genres || [])
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);

    const keywords = [
        survey.emotion,     
        ...shuffledGenres,  
        "mix"               
    ].filter(Boolean);

    const query = keywords.join(" ");
    
    // Offset aleatorio para variedad
    const randomOffset = Math.floor(Math.random() * 5);

    console.log(`🔎 Query: "${query}" | Offset: ${randomOffset}`);

    try {
        const url = `https://api.spotify.com/v1/search` +
            `?q=${encodeURIComponent(query)}` +
            `&type=playlist` +
            `&limit=5` + 
            `&offset=${randomOffset}`;

        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) return [];

        const data = await res.json();
        return (data.playlists?.items || []).filter(Boolean);
    } catch (e) {
        console.error("Error buscando playlists:", e);
        return [];
    }
}

// Función interna
async function extractTracks(token, playlists) {
    let tracks = [];
    const seen = new Set();
    const shuffledPlaylists = playlists.sort(() => 0.5 - Math.random());

    // Limitamos a 3 playlists para no saturar
    for (const pl of shuffledPlaylists.slice(0, 3)) {
        try {
            const res = await fetch(`${pl.tracks.href}?limit=20`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) continue;

            const data = await res.json();

            data.items.forEach(item => {
                const t = item.track;
                // Filtros de calidad: ID, No Local, PREVIEW_URL (Vital)
                if (t && t.id && !seen.has(t.id) && !t.is_local) {
                    seen.add(t.id);
                    
                    // Normalizamos la estructura para el siguiente paso
                    tracks.push({
                        id: t.id,
                        name: t.name,
                        artists: t.artists, // Array de objetos
                        album: t.album,     // Objeto con images
                        preview_url: t.preview_url, // EL AUDIO
                        uri: t.uri,
                        external_url: t.external_urls.spotify
                    });
                }
            });
        } catch (e) {
            console.warn("Error leyendo tracks de playlist:", e);
        }
    }
    return tracks;
}