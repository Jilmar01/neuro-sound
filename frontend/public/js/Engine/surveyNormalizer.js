/**
 * TRADUCTOR NEURO-ACÚSTICO V3 (FINAL)
 * Convierte el mapa de datos exacto de la encuesta a Vectores Matemáticos.
 */

exports.translateFullSurvey = (surveyRaw, songRaw) => {

    // =================================================================
    // 1. PUNTO DE PARTIDA: ESTADO ACTUAL (Current State)
    // =================================================================
    
    let currentVector = { energy: 0.5, valence: 0.5 };
    
    // Factor de Intensidad (1 al 5):
    // Usamos una función logarítmica suave: a mayor intensidad, más extremo el valor.
    const intensityFactor = (surveyRaw.intensity || 3) * 0.1; 

    switch (surveyRaw.emotion.toLowerCase()) {
        case 'tristeza':
            // Valencia baja. Si intensidad es 5, valencia baja a 0.1
            currentVector.valence = 0.5 - intensityFactor; 
            currentVector.energy = 0.3; 
            break;
        case 'calma':
            // Valencia alta, Energía baja.
            currentVector.valence = 0.6 + intensityFactor; // Puede llegar a 1.0
            currentVector.energy = 0.3; 
            break;
        case 'felicidad':
            // Valencia alta, Energía alta.
            currentVector.valence = 0.5 + intensityFactor;
            currentVector.energy = 0.5 + intensityFactor;
            break;
        case 'ira':
            // Valencia muy baja, Energía explosiva.
            currentVector.valence = 0.4 - intensityFactor; // Puede bajar a 0.0 (Pura negatividad)
            currentVector.energy = 0.5 + intensityFactor;  // Puede subir a 1.0 (Pura furia)
            break;
    }

    // =================================================================
    // 2. PUNTO DE LLEGADA: LA INTENCIÓN (Target State)
    // =================================================================
    
    let targetVector = {
        energy: currentVector.energy,
        valence: currentVector.valence,
        bpm: 100, // Default
        hated_freq_classes: []
    };

    // Mapeo EXACTO de tus IDs de Intent (1-5)
    const intentId = parseInt(surveyRaw.intent);

    switch (intentId) {
        case 1: // "Mantener como me siento" (Principio de Identidad ISO)
            // Copiamos el estado actual tal cual.
            // La música acompaña la emoción (ej. triste para llorar).
            targetVector.energy = currentVector.energy;
            targetVector.valence = currentVector.valence;
            break;

        case 2: // "Sentirme más feliz" (Principio de Levantamiento)
            targetVector.valence = 0.9; // Buscamos positividad máxima
            targetVector.energy = 0.7;  // Energía alegre pero no caótica
            break;

        case 3: // "Relajarme" (Principio de Sedación)
            targetVector.energy = 0.2;  // Mínima energía
            targetVector.valence = 0.8; // Placer auditivo
            targetVector.bpm = 65;      // Forzamos BPM bajo
            break;

        case 4: // "Aumentar mi energía" (Principio de Activación)
            targetVector.energy = 0.95; // Energía a tope
            targetVector.bpm = 135;     // Forzamos BPM alto
            // Si la valencia actual es muy negativa (ira), la subimos a neutra
            if (targetVector.valence < 0.5) targetVector.valence = 0.5;
            break;

        case 5: // "Ayudarme a concentrarme" (Estado de Flow)
            targetVector.energy = 0.4;  // Energía media-baja
            targetVector.valence = 0.6; // Ligeramente positivo
            targetVector.bpm = 60;      // Ritmo Barroco/Lofi (Ideal estudio)
            break;
    }


    // =================================================================
    // 3. REFINAMIENTO: PREFERENCIAS FÍSICAS
    // =================================================================

    // A. Mapeo EXACTO de Tempo (Strings)
    const tempoMap = {
        "muy lentas y solemnes": 55,
        "lentas y tranquilas": 75,
        "ritmo moderado": 105,
        "rapidas y animadas": 125,
        "muy rapidas e intensas": 150
    };
    
    // Si el usuario eligió un tempo explícito, este tiene prioridad sobre la intención
    if (surveyRaw.tempo_preference && tempoMap[surveyRaw.tempo_preference]) {
        targetVector.bpm = tempoMap[surveyRaw.tempo_preference];
    }

    // B. BIO-SEGURIDAD (Análisis de Tonos Molestos)
    // Asumimos mapeo espectral estándar: Tone1=Graves, Tone2=Medios, Tone3=Agudos
    if (surveyRaw.tones && surveyRaw.tones.molestias) {
        const m = surveyRaw.tones.molestias;
        const UMBRAL_MOLESTIA = 3; // Si marca 4 o 5, es molesto.

        // Si Tone 1 (Bajas Frecuencias) molesta
        if (m.tone1 > UMBRAL_MOLESTIA) {
            targetVector.hated_freq_classes.push("Subgraves (Profundo)", "Graves (Cuerpo)");
        }
        
        // Si Tone 3 (Altas Frecuencias) molesta
        if (m.tone3 > UMBRAL_MOLESTIA) {
            targetVector.hated_freq_classes.push("Agudos (Brillo)", "Medios-Altos (Definición)");
        }
        
        // Opcional: Tone 2 (Medios)
        if (m.tone2 > UMBRAL_MOLESTIA) {
            targetVector.hated_freq_classes.push("Medios (Voz)", "Medios-Bajos (Calidez)");
        }
    }

    // =================================================================
    // 4. DATOS DE LA CANCIÓN & FILTROS CATEGÓRICOS
    // =================================================================
    const tData = songRaw.data;
    
    // Filtros Booleanos (No matemáticos)
    const filters = {
        genres: surveyRaw.generes || [], // Nota: En tu mapa pusiste "generes" (con e)
        artists: surveyRaw.artist_preference || [] // Array de strings
    };

    let songVector = {
        id: tData.track_id,
        name: tData.name,
        // Normalización: Aseguramos que energy quede 0.0 - 1.0
        energy: tData.energy > 1 ? tData.energy / 10 : tData.energy,
        // Usamos danceability como proxy de Valencia si no existe
        valence: tData.vocal_presence || tData.danceability || 0.5,
        bpm: tData.bpm,
        freq_class: tData.freq_class, // Ej: "Medios-Altos (Definición)"
        
        // Metadata para Bonus
        genres: [tData.genre], 
        artists: tData.artists 
    };

    return { 
        targetVector, 
        categoricalFilters: filters, 
        songVector 
    };
};