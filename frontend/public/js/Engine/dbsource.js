/* public/js/Engine/dbSource.js */
import { apiCall } from '/js/refactored/fetch.js'; // Importamos tu herramienta maestra

/**
 * EL DECORADOR (Spotify Enricher)
 * Usa 'apiCall' para pedir metadatos a Spotify en bloque.
 */
export async function enrichWithSpotifyMetadata(token, topCandidates) {
    
    // 1. VALIDACIÓN
    if (!topCandidates || topCandidates.length === 0) {
        return [];
    }

    // 2. PREPARACIÓN DE IDs
    const ids = topCandidates.map(c => c.track_id).join(',');

    console.log(`🎨 (dbSource) Solicitando metadatos para ${topCandidates.length} tracks...`);

    try {
        // 3. LLAMADA OPTIMIZADA (Usando apiCall)
        // serverName: 'spotify' (Usa la URL base y tokenKey configurados en fetch.js)
        // endpoint: '/tracks?ids=...'
        // method: 'GET'
        const data = await apiCall('spotify', `/tracks?ids=${ids}`, 'GET');

        if (!data || !data.tracks) {
            console.warn("⚠️ Spotify no devolvió la lista de tracks esperada.");
            return [];
        }

        // 4. FUSIÓN (Igual que antes)
        const finalPlaylist = topCandidates.map((candidate) => {
            
            // Buscamos la info correspondiente
            const spotifyInfo = data.tracks.find(t => t && t.id === candidate.track_id);

            if (!spotifyInfo) return null;

            return {
                // Info de Spotify
                title: spotifyInfo.name,
                artist: spotifyInfo.artists.map(a => a.name).join(', '),
                cover: spotifyInfo.album.images[0]?.url, 
                preview_url: spotifyInfo.preview_url,   
                uri: spotifyInfo.uri,
                spotify_link: spotifyInfo.external_urls.spotify,
                
                // Info del Motor
                score: candidate.neuro_score,            
                id: candidate.track_id,
                type: 'spotify',
                details: `Match: ${candidate.neuro_score}%`
            };
        }).filter(item => item !== null);

        return finalPlaylist;

    } catch (e) {
        console.error("❌ Error en enrichWithSpotifyMetadata:", e);
        return [];
    }
}