/**
 * TRADUCTOR MASIVO DE BASE DE DATOS
 * Convierte el array crudo de MongoDB a Vectores Matemáticos para el NeuroEngine.
 */

// Función auxiliar para normalizar UNA sola canción
const mapDbSongToVector = (songRaw) => {
    // Validación básica: Si no tiene ID de Spotify, no nos sirve
    if (!songRaw || !songRaw.track_id) return null;

    return {
        // --------------------------------------------------------
        // 1. IDENTIFICACIÓN
        // --------------------------------------------------------
        // Usamos 'track_id' porque es lo que Spotify necesita para el enriquecimiento final
        id: songRaw.track_id, 
        name: songRaw.name,

        // --------------------------------------------------------
        // 2. DATOS MATEMÁTICOS (Normalización 0.0 - 1.0)
        // --------------------------------------------------------
        
        // CORRECCIÓN DE ENERGÍA:
        // En tu BD está como entero (ej: 7). El motor necesita decimal (0.7).
        energy: songRaw.energy > 1 ? songRaw.energy / 10 : songRaw.energy,

        // VALENCIA (Humor):
        // Usamos 'vocal_presence' como proxy principal de "humanidad/emoción".
        // Si no existe, usamos 'danceability'.
        valence: songRaw.vocal_presence || songRaw.danceability || 0.5,

        // OTRAS DIMENSIONES
        bpm: songRaw.bpm || 100,
        danceability: songRaw.danceability || 0.5,
        
        // CLASIFICACIÓN DE FRECUENCIA (Para filtrar tonos molestos)
        // Ej: "Presencia (Inteligibilidad)"
        freq_class: songRaw.freq_class, 

        // --------------------------------------------------------
        // 3. DATOS CATEGÓRICOS (Filtros)
        // --------------------------------------------------------
        // El motor espera 'genres' (Array), tu BD tiene 'genre' (String)
        genres: songRaw.genre ? [songRaw.genre.toLowerCase()] : [],
        
        // Tu BD ya tiene 'artists' como array, lo pasamos directo
        artists: songRaw.artists || []
    };
};

// FUNCIÓN PRINCIPAL EXPORTADA
export const normalizeAllSongsResponse = (response) => {
    console.log("🏭 Normalizando lote de canciones...");

    // 1. DESEMPAQUETADO INTELIGENTE
    // Aceptamos tanto el objeto completo { success: true, data: [...] } como el array directo
    let rawList = [];
    
    if (Array.isArray(response)) {
        rawList = response;
    } else if (response && response.data && Array.isArray(response.data)) {
        rawList = response.data;
    } else {
        console.warn("⚠️ Estructura de canciones desconocida:", response);
        return [];
    }

    // 2. MAPEO Y LIMPIEZA
    // Convertimos cada elemento y eliminamos los nulos (errores)
    const normalizedList = rawList
        .map(mapDbSongToVector)
        .filter(vector => vector !== null);

    console.log(`✅ Normalización completada: ${normalizedList.length} vectores listos.`);
    
    return normalizedList;
};