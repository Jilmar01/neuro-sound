/* public/js/Engine/dbSource.js */
import { apiCall,testsApiCall } from '/js/refactored/fetch.js'; // Importamos tu herramienta maestra

export async function enrichWithLocalMetadata(topCandidates) {
    
    if (!topCandidates || topCandidates.length === 0) return [];

    const bodyPayload = {
        songsRequested: topCandidates.map(c => String(c.track_id).trim())
    };

    console.log(`🏠 (dbSource) Testeando Endpoint Local...`);

    try {
        // CORRECCIÓN AQUÍ: Agregamos 'local' como segundo argumento
        // Argumentos: (URL, SERVER_KEY, ENDPOINT, METHOD, BODY)
        const data = await testsApiCall(
            'https://t6b802qq-5001.use.devtunnels.ms/', // 1. URL Base
            'local',                  // 2. Server Key (¡Faltaba este!)
            '/get-songs',             // 3. Endpoint
            'POST',                   // 4. Método
            bodyPayload               // 5. Body
        );

        // ... (El resto de tu lógica de mapeo se mantiene igual) ...
        
        if (!data || !data.files || !Array.isArray(data.files)) {
            console.warn("⚠️ Respuesta inválida del servidor local.", data);
            return [];
        }

        const finalPlaylist = topCandidates.map((candidate) => {
            const candidateName = String(candidate.track_id).toLowerCase().trim();
            const localFile = data.files.find(f => f.name && f.name.toLowerCase().trim() === candidateName);

            if (!localFile || localFile.error) return null;

            let artistName = "Artista Local";
            let songTitle = localFile.name;

            if (localFile.name.includes(' - ')) {
                const parts = localFile.name.split(' - ');
                if (parts.length >= 2) {
                    artistName = parts[0].trim();
                    songTitle = parts[1].replace(/\.[^/.]+$/, "").trim();
                }
            }

            return {
                title: songTitle,
                artist: artistName, 
                cover: '/assets/img/defaultcover.png', 
                preview_url: localFile.url,
                uri: localFile.url,
                spotify_link: '#',
                score: candidate.neuro_score,            
                id: candidate.track_id,
                type: 'local',
                details: `Match Local: ${candidate.neuro_score}%`
            };
        }).filter(item => item !== null);

        return finalPlaylist;

    } catch (e) {
        console.error("❌ Error CRÍTICO en enrichWithLocalMetadata:", e);
        return [];
    }
}

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