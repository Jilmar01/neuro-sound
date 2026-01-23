/**
 * NEURO-ACOUSTIC ENGINE CORE
 * Implementación de la Ecuación de Compatibilidad Vectorial.
 * S = 100 - (w1·|ΔE| + w2·|ΔV| + w3·|ΔBPM| + P_bio) + Bonus
 */

// 1. CONFIGURACIÓN DE PESOS (Tuning del Algoritmo)
// Estos valores definen la "personalidad" del motor.
const WEIGHTS = {
    ENERGY: 35,    // Peso Alto: La energía es lo más perceptible físicamente.
    VALENCE: 25,   // Peso Medio: El estado de ánimo es subjetivo pero importante.
    BPM: 0.5,      // Peso Bajo: El BPM es un número grande, así que el multiplicador debe ser pequeño.
                   // Ej: 10 BPM de diferencia * 0.5 = 5 puntos de penalización.
};

// 2. PENALIZACIONES Y UMBRALES
const PENALTIES = {
    BIO_RISK: 60,  // "Hard Penalty": Si viola la bio-seguridad, pierde 60 puntos de golpe (Inviable).
};

const MIN_THRESHOLD = 60; // Puntuación mínima para entrar en la playlist.


/**
 * Función Principal: Clasifica y Ordena candidatos
 * @param {Object} targetVector - Lo que el usuario NECESITA { energy, valence, bpm, hated_freq_classes }
 * @param {Object} userFilters - Gustos conscientes { genres, artists }
 * @param {Array} candidateSongs - Lista de vectores de canciones candidatas
 */
exports.rankCandidates = (targetVector, userFilters, candidateSongs) => {

    // Procesamos cada canción individualmente
    const scoredTracks = candidateSongs.map(song => {
        
        let score = 100; // Empezamos con la perfección (100%)
        let reasons = []; // Historial de decisiones (Para debugging/UI)

        // --- A. CÁLCULO DE DISTANCIAS (VECTORES) ---
        
        // 1. Delta Energía (Escala 0.0 - 1.0)
        const diffEnergy = Math.abs(targetVector.energy - song.energy);
        const pEnergy = diffEnergy * WEIGHTS.ENERGY;
        
        // 2. Delta Valencia (Escala 0.0 - 1.0)
        const diffValence = Math.abs(targetVector.valence - song.valence);
        const pValence = diffValence * WEIGHTS.VALENCE;

        // 3. Delta BPM (Valor Absoluto)
        const diffBpm = Math.abs(targetVector.bpm - song.bpm);
        const pBpm = diffBpm * WEIGHTS.BPM;


        // --- B. FILTRO DE BIO-SEGURIDAD (La Clave de la Tesis) ---
        let pBio = 0;
        // Verificamos si la clase de frecuencia de la canción está en la lista negra del usuario
        // Ej: Usuario odia "Agudos" y la canción es "Agudos (Brillo)"
        const isBioRisk = targetVector.hated_freq_classes.some(hated => 
            song.freq_class.includes(hated.split(" ")[0]) // Comparamos la raíz del texto
        );

        if (isBioRisk) {
            pBio = PENALTIES.BIO_RISK;
            reasons.push(`⚠️ ALERTA BIO: Frecuencia molesta detectada (${song.freq_class})`);
        }


        // --- C. APLICACIÓN DE LA ECUACIÓN (Resta) ---
        const totalPenalty = pEnergy + pValence + pBpm + pBio;
        score = score - totalPenalty;


        // --- D. BONUS DE AFINIDAD (Refuerzo Positivo) ---
        // Esto ayuda a desempatar canciones matemáticas dándole prioridad a los gustos.
        
        let bonus = 0;
        
        // Bonus de Artista (+5 pts)
        const isFavArtist = userFilters.artists.some(favArt => 
            song.artists.some(songArt => songArt.toLowerCase().includes(favArt.toLowerCase()))
        );
        if (isFavArtist) {
            bonus += 5;
            reasons.push("⭐ Artista Favorito");
        }

        // Bonus de Género (+2 pts)
        // (Asumiendo que song.genres es un array o string)
        const songGenre = Array.isArray(song.genres) ? song.genres[0] : song.genres;
        if (userFilters.genres.includes(songGenre)) {
            bonus += 2;
            reasons.push("🎵 Género Preferido");
        }

        score += bonus;


        // --- E. NORMALIZACIÓN FINAL ---
        // El score no puede ser menor a 0 ni mayor a 100
        score = Math.max(0, Math.min(100, parseFloat(score.toFixed(1))));


        // Retornamos el objeto enriquecido con el análisis
        return {
            ...song, // Mantenemos los datos originales de la canción
            neuro_score: score,
            is_match: score >= MIN_THRESHOLD,
            match_details: {
                total_penalty: parseFloat(totalPenalty.toFixed(1)),
                breakdown: {
                    penalty_energy: parseFloat(pEnergy.toFixed(1)),
                    penalty_valence: parseFloat(pValence.toFixed(1)),
                    penalty_bpm: parseFloat(pBpm.toFixed(1)),
                    penalty_bio: pBio
                },
                bonus_points: bonus,
                deltas: {
                    diff_energy: diffEnergy.toFixed(2),
                    diff_bpm: diffBpm
                },
                logs: reasons // "Por qué"
            }
        };
    });

    // --- F. ORDENAMIENTO (Ranking) ---
    // De mayor Score a menor Score
    scoredTracks.sort((a, b) => b.neuro_score - a.neuro_score);

    return scoredTracks;
};