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
        case 'alegria': // Agrego alias comunes
            currentVector.valence = 0.5 + intensityFactor;
            currentVector.energy = 0.5 + intensityFactor;
            break;
        case 'ira':
        case 'molestia':
            currentVector.valence = 0.4 - intensityFactor;
            currentVector.energy = 0.5 + intensityFactor;
            break;
        default:
            // Si no reconoce la emoción, usa valores neutros
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
        danceability: 0.5, // Agregado por defecto
        hated_freq_classes: []
    };

    switch (intentId) {

        case 1: // tristeza
            targetVector.valence = 0.2;
            targetVector.energy = 0.3;
            targetVector.danceability = 0.2;
            targetVector.bpm = 65;
            break;

        case 2: // calma
            targetVector.valence = 0.6;
            targetVector.energy = 0.25;
            targetVector.danceability = 0.15;
            targetVector.bpm = 60;
            break;

        case 3: // felicidad
            targetVector.valence = 0.9;
            targetVector.energy = 0.8;
            targetVector.danceability = 0.85;
            targetVector.bpm = 120;
            break;

        case 4: // molestia
            targetVector.valence = 0.35;
            targetVector.energy = 0.75;
            targetVector.danceability = 0.6;
            targetVector.bpm = 130;
            break;

        default:
            console.warn("Intent no reconocido:", intentId);
    }


    // =================================================================
    // 3. REFINAMIENTO: PREFERENCIAS FÍSICAS
    // =================================================================

    // A. Mapeo de Tempo
    const tempoMap = {
        "lento":   [40, 75],
        "normal":  [76, 120],
        "rapido":  [121, 180]
    };

    // Validamos que tempo_preference exista antes de usarlo
    if (survey.tempo_preference && tempoMap[survey.tempo_preference]) {
        targetVector.bpm = tempoMap[survey.tempo_preference];
    }

    // B. BIO-SEGURIDAD (Tonos Molestos)
    if (survey.tones && survey.tones.molestias) {
        const m = survey.tones.molestias;
        const UMBRAL_MOLESTIA = 3;

        if (m.tone1 > UMBRAL_MOLESTIA) targetVector.hated_freq_classes.push("Subgraves (Profundo)", "Graves (Cuerpo)");
        if (m.tone3 > UMBRAL_MOLESTIA) targetVector.hated_freq_classes.push("Agudos (Brillo)", "Medios-Altos (Definición)");
        if (m.tone2 > UMBRAL_MOLESTIA) targetVector.hated_freq_classes.push("Medios (Voz)", "Medios-Bajos (Calidez)");
    }

    console.log("🎯 Target Vector Final:", targetVector);

    // =================================================================
    // 4. RETORNO PARA EL CONTROLADOR
    // =================================================================
    return {
        targetVector,
        categoricalFilters: {
            genres: survey.genres || [],
            // Mapeamos 'artist_interest' (BD) a 'artists' (Motor)
            artists: survey.artist_interest || []
        }
    };
}