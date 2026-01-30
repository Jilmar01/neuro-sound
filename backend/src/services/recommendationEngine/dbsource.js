
import { HttpError } from "../../utils/httpError.js";
import { getDomain } from "../music.server.service.js";

async function getSongsServer(songsRequested) {
    const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s

    
    try {
        const domainArr = await getDomain("NeuroSound Music Server");
        const domainUrl = domainArr[0].domainUrl;

        const response = await fetch(`${domainUrl}get-songs`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(songsRequested),
            signal: controller.signal
        });

        if (!response.ok) {
        throw new HttpError('Servidor de musica no disponible', 400);
        }
        return response.json();
    } catch (error) {
        console.error("Error cargando canciónes", error);
        return null;
    }

}

/**
 * EL DECORADOR (Spotify Enricher)
 * Usa 'apiCall' para pedir metadatos a Spotify en bloque.
 */
export async function enrichWithSpotifyMetadata(topCandidates) {

    // 1. VALIDACIÓN
    if (!topCandidates || topCandidates.length === 0) {
        return [];
    }

    // 2. PREPARACIÓN DE IDs
    const ids = topCandidates.map(c => c.track_id);

    const bodyPayload = {
        songsRequested: topCandidates.map(c => String(c.track_id).trim())
    };

    try {

        const data = await getSongsServer(bodyPayload);
        

        if (!data || !data.files || !Array.isArray(data.files)) {
            console.warn("⚠️ Respuesta inválida del servidor local.", data);
            throw new HttpError('Error al obtener las canciones del servidor', 400);
    
        }

        // 4. FUSIÓN (Igual que antes)
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
        console.error("❌ Error en enrichWithSpotifyMetadata:", e);
        throw new HttpError('Error al obtener las canciones del servidor', 400);
    }
}