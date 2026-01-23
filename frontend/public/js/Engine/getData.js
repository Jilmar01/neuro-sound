import { apiCall } from "../refactored/fetch";

// A. Obtener la Encuesta del Usuario (Perfil Emocional)
export async function getSurvey() {
    try {
        // Asumo que el backend usa el token del header para saber qué usuario es
        const surveyData = await apiCall('neuro', '/api/survey/get-register', 'GET');
        
        if (!surveyData) {
            console.warn("El usuario no tiene encuesta registrada.");
            return null;
        }

        console.log("Encuesta recibida:", surveyData);
        return surveyData;
    } catch (error) {
        console.error("Error obteniendo encuesta:", error);
        throw error;
    }
}

// B. Obtener (o analizar) una Canción por ID (MÉTODO POST)
export async function getAnalizedSong(SpotifyTrackId) {
    try {
        console.log(`Solicitando análisis para track: ${SpotifyTrackId}`);
        
        // CAMBIO A POST: Ahora enviamos el ID en el body
        const payload = { SpotifyTrackId }; 
        
        const songData = await apiCall('neuro', '/api/song/get-analized-song', 'POST', payload);
        
        console.log("Datos recibidos de la cancion: ", songData);
        return songData;
    } catch (error) {
        console.error(`Error recuperando track ${SpotifyTrackId}:`, error);
        return null; // Retornamos null para que el código principal sepa que falló esta canción
    }
}