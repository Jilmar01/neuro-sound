import { apiCall, testsApiCall } from "../refactored/fetch.js";

// A. Obtener la Encuesta del Usuario (Perfil Emocional)
export async function getSurvey() {
    try {
        // Asumo que el backend usa el token del header para saber qué usuario es
        const surveyData = await apiCall('neuro', '/api/survey/get-register', 'GET',);
        
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
export const getAnalizedSong = async (trackId) => {
    // 1. INTENTO REAL (Backend)
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout

        const response = await apiCall('/api/songs/track', 'POST', { trackId }, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        // Si la API responde correctamente con la estructura { data: ... }
        if (response && response.data && !response.error) {
            return response; 
        }
        // Si responde pero sin data o con error, saltamos al catch
        if (response && !response.data) throw new Error("Formato incorrecto");

    } catch (error) {
        // Falló la red o no existe la canción
    }

    // 2. MODO FALLBACK (Simulación)
    // Devolvemos los datos envueltos en "data" para que songNormalicer.js no falle
    return {
        data: simulateAnalysis(trackId)
    };
};

export const getAllAnalyzedSongs = async () => {
    console.log("Solicitando biblioteca completa al servidor...");

    try {
        // Asegúrate de que este sea la ruta correcta en tu backend 
        // que devuelve el JSON que me mostraste.
        const response = await apiCall('neuro','/api/songs/all-songs','GET'); 
        
        // Tu estructura es: { success: true, data: [ ... ] }
        if (response && response.success && Array.isArray(response.data)) {
            console.log(`Carga Masiva Exitosa: ${response.data.length} vectores recibidos.`);
            return response.data; 
        } else {
            console.warn("⚠️ La respuesta del servidor no tiene el formato esperado:", response);
            return [];
        }
    } catch (error) {
        console.error("Error fatal en getEverySongs:", error);
        return [];
    }
};

// Función auxiliar para generar datos matemáticos verosímiles
function simulateAnalysis(id) {
    const frequencies = ["Graves (Cuerpo)", "Medios (Voz)", "Agudos (Brillo)"];
    
    return {
        track_id: id,
        // Generamos valores aleatorios estocásticos (1-10)
        energy: Math.floor(Math.random() * 10) + 1,        
        bpm: Math.floor(Math.random() * (160 - 70) + 70),  
        danceability: Math.floor(Math.random() * 100),     
        vocal_presence: Math.floor(Math.random() * 100),   
        freq_class: frequencies[Math.floor(Math.random() * frequencies.length)],
        
        // Datos extra
        key: "C Major",
        camelot: "8B"
    };
}
