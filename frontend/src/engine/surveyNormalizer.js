/* public/js/utils/surveyNormalizer.js */

/**
 * TRADUCTOR NEURO-ACÚSTICO V3 (ADAPTADO)
 * Convierte el mapa de datos exacto de la encuesta a Vectores Matemáticos.
 * Incluye protección contra estructuras anidadas (Wrappers).
 */
export function translateFullSurvey(rawInput, historyData) {
    
    // =================================================================
    // 0. SANITIZACIÓN Y DESEMPAQUETADO (El Fix Vital)
    // =================================================================
    let survey = rawInput;
    // Si viene dentro de una caja 'data', la abrimos.
    if (rawInput && rawInput.data) {
        survey = rawInput.data;
    }

    // Extracción segura de variables para evitar crash
    const rawEmotion = survey.emotion || "calma";
    const emotion = String(rawEmotion).toLowerCase().trim();
    const intensity = parseInt(survey.intensity) || 3;
    const intentId = parseInt(survey.intent) || 3; // Default: Relajar (3)

    console.log(`🧮 Calculando Vectores: Emoción="${emotion}", Intención=${intentId}, Intensidad=${intensity}`);

    // =================================================================
    // 1. PUNTO DE PARTIDA: ESTADO ACTUAL (Current State)
    // =================================================================
    
    let currentVector = { energy: 0.5, valence: 0.5 };
    
    // Factor de Intensidad (1 al 5):
    // Usamos una función logarítmica suave: a mayor intensidad, más extremo el valor.
    const intensityFactor = intensity * 0.1; 

    switch (emotion) {
        case 'tristeza':
            currentVector.valence = 0.5 - intensityFactor; 
            currentVector.energy = 0.3; 
            break;
        case 'calma':
            currentVector.valence = 0.6 + intensityFactor;
            currentVector.energy = 0.3; 
            break;
        case 'felicidad':
            currentVector.valence = 0.5 + intensityFactor;
            currentVector.energy = 0.5 + intensityFactor;
            break;
        case 'molestia': // Sincronizado con el nuevo mapa de emociones
            currentVector.valence = 0.4 - intensityFactor;
            currentVector.energy = 0.5 + intensityFactor; 
            break;
        default:
            currentVector.valence = 0.5;
            currentVector.energy = 0.5;
    }

    // =================================================================
    // 2. PUNTO DE LLEGADA: LA INTENCIÓN (Target State)
    // =================================================================
    
    let targetVector = {
        energy: currentVector.energy,
        valence: currentVector.valence,
        bpm: 100, // Default
        danceability: 0.5, 
        hated_freq_classes: []
    };

    switch (intentId) {
        case 1: // "Mantener como me siento"
            targetVector.energy = currentVector.energy;
            targetVector.valence = currentVector.valence;
            break;

        case 2: // "Sentirme más feliz"
            targetVector.valence = 0.9; 
            targetVector.energy = 0.7; 
            targetVector.danceability = 0.8;
            break;

        case 3: // "Relajarme"
            targetVector.energy = 0.2; 
            targetVector.valence = 0.8; 
            targetVector.bpm = 65; 
            targetVector.danceability = 0.3;
            break;

        case 4: // "Aumentar mi energía"
            targetVector.energy = 0.95; 
            targetVector.bpm = 135; 
            targetVector.danceability = 0.9;
            if (targetVector.valence < 0.5) targetVector.valence = 0.5;
            break;

        case 5: // "Ayudarme a concentrarme"
            targetVector.energy = 0.4; 
            targetVector.valence = 0.6; 
            targetVector.bpm = 60; 
            targetVector.danceability = 0.1;
            break;
    }

    // =================================================================
    // 3. REFINAMIENTO: PREFERENCIAS FÍSICAS
    // =================================================================

    // A. MAPEO DE TEMPO (Actualizado según nuevos rangos)
    const tempoMap = {
        "lentas y tranquilas": 60,   // Representante del rango 40-75 BPM
        "ritmo moderado": 95,       // Representante del rango 76-120 BPM
        "rapidas y animadas": 140   // Representante del rango 121-180 BPM
    };
    
    if (survey.tempo_preference && tempoMap[survey.tempo_preference]) {
        targetVector.bpm = tempoMap[survey.tempo_preference];
    }

    // B. BIO-SEGURIDAD (Tonos Molestos)
    if (survey.tones && survey.tones.molestias) {
        const m = survey.tones.molestias;
        const UMBRAL_MOLESTIA = 3; 

        // tone1 = frecuencias bajas, tone2 = medias, tone3 = altas
        if (m.tone1 > UMBRAL_MOLESTIA) targetVector.hated_freq_classes.push("Subgraves (Profundo)", "Graves (Cuerpo)");
        if (m.tone2 > UMBRAL_MOLESTIA) targetVector.hated_freq_classes.push("Medios (Voz)", "Medios-Bajos (Calidez)");
        if (m.tone3 > UMBRAL_MOLESTIA) targetVector.hated_freq_classes.push("Agudos (Brillo)", "Medios-Altos (Definición)");
    }

    console.log("🎯 Target Vector Final:", targetVector);

    // =================================================================
    // 4. RETORNO PARA EL CONTROLADOR
    // =================================================================
    return { 
        targetVector, 
        categoricalFilters: {
            genres: survey.generes || survey.genres || [], 
            // Sincronizado con 'artist_preference' del nuevo mapa
            artists: survey.artist_preference || [] 
        }
    };
}