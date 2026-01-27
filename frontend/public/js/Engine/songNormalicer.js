/**
 * ADAPTADOR DE SEÑALES DE AUDIO (Calibrado con Python Analyzer)
 * Transforma la salida del script Python a vectores normalizados (0.0 - 1.0).
 */

export const mapSongToVector = (songData) => {
    // Accedemos a 'data' porque tu respuesta JSON tiene formato { success: true, data: {...} }
    const raw = songData.data; 

    // =========================================================
    // 1. NORMALIZACIÓN DE ENERGÍA
    // Python Output: Entero 1 a 10.
    // Target: Float 0.1 a 1.0.
    // =========================================================
    let normalizedEnergy = 0.5; // Default seguro
    if (typeof raw.energy === 'number') {
        normalizedEnergy = raw.energy / 10;
    }
    // Aseguramos que no se salga de rango
    normalizedEnergy = Math.min(Math.max(normalizedEnergy, 0.0), 1.0);


    // =========================================================
    // 2. CÁLCULO DE VALENCIA (Ingeniería Inversa)
    // Python Output: Danceability (0-100) y Vocal Presence (0-100).
    // Lógica: Si es bailable y tiene voz, suele ser "alegre/positiva".
    // =========================================================
    
    // Convertimos de 0-100 a 0.0-1.0
    const dance = (raw.danceability || 0) / 100;
    const vocal = (raw.vocal_presence || 0) / 100;

    // Fórmula Ponderada: El ritmo (dance) pesa más para definir el ánimo activo.
    let estimatedValence = (dance * 0.7) + (vocal * 0.3);
    
    // Corrección por Tonalidad (Camelot) - Opcional pero recomendado
    // Si la tonalidad es Menor (ej. "Am", "1A"), bajamos un poco la valencia (más triste).
    if (raw.camelot && raw.camelot.includes("A")) { // "A" en Camelot suele ser Minor
        estimatedValence -= 0.1;
    }
    if (raw.camelot && raw.camelot.includes("B")) { // "B" en Camelot suele ser Major
        estimatedValence += 0.1;
    }
    
    // Clampeo final 0-1
    estimatedValence = Math.min(Math.max(estimatedValence, 0.0), 1.0);


    // =========================================================
    // 3. CLASIFICACIÓN ESPECTRAL (Mapeo de las 7 Bandas)
    // Python Output: String exacto (ej: "Medios-Altos (Definición)")
    // Target: Clasificación para Bio-Seguridad (Graves, Medios, Agudos)
    // =========================================================
    
    let spectralClass = "Medios"; // Default neutro
    const freqText = raw.freq_class || "";

    // Mapeo Estricto de tus 7 Bandas Python -> 3 Tonos de Encuesta
    
    // --- GRUPO 1: GRAVES (Tone 1) ---
    if (freqText.includes("Subgraves") || freqText.includes("Graves")) {
        spectralClass = "Graves (Cuerpo)";
    }
    
    // --- GRUPO 2: MEDIOS (Tone 2) ---
    else if (freqText.includes("Medios-Bajos") || freqText.includes("Medios (Presencia)")) {
        spectralClass = "Medios (Voz)";
    }
    
    // --- GRUPO 3: AGUDOS / MEDIOS-ALTOS (Tone 3 - EL PELIGROSO) ---
    // Aquí es donde vive la "molestia" auditiva más común (2k - 4k Hz)
    else if (freqText.includes("Medios-Altos") || freqText.includes("Presencia (Inteligibilidad)") || freqText.includes("Agudos")) {
        // Mapeamos todo esto a lo que en tu encuesta llamas "Tone 3" (Brillo/Definición)
        spectralClass = "Agudos (Brillo)"; 
        
        // NOTA: He forzado "Medios-Altos" a ser "Agudos" porque ahí está la frecuencia 
        // que más duele al oído sensible (3kHz). Es mejor prevenir.
    }


    // =========================================================
    // 4. RETORNO DEL VECTOR LIMPIO
    // =========================================================
    return {
        id: raw.track_id, // Usamos track_id que viene en el data
        name: raw.name,
        
        // Vectores Matemáticos
        energy: normalizedEnergy,
        valence: parseFloat(estimatedValence.toFixed(2)), // Redondear a 2 decimales
        bpm: raw.bpm || 100,
        freq_class: spectralClass, // "Graves (Cuerpo)", "Medios (Voz)", o "Agudos (Brillo)"

        // Metadata para Bonus Points
        artists: raw.artists || [], // Array de artistas
        camelot: raw.camelot // Útil para DJs o mezcla armónica futura
    };
};