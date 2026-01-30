// public/js/Engine/neuroEngineController.js

// 1. Usa IMPORT con .js
import { getSpotifyCandidates } from '../recomendationSpotify.js'; // Tu motor viejo
import { translateFullSurvey } from '/js/Engine/surveyNormalizer.js';
import { mapSongToVector } from '/js/Engine/songNormalicer.js'; // Ojo con el nombre del archivo
import { rankCandidates } from '/js/Engine/neuroEngine.js';
import { getAnalizedSong } from '/js/Engine/getData.js'; // Tu fetcher

// 2. Usa EXPORT en lugar de exports.generate...
export async function generateHybridPlaylist(spotifyToken, rawSurvey) {
    console.log("🚀 INICIANDO SISTEMA HÍBRIDO...");

    try {
        // =========================================================
        // 1. RECLUTAMIENTO (Usando el motor viejo refactorizado)
        // =========================================================
        // Le pasamos el token y la encuesta para que busque candidatos
        const rawCandidates = await getSpotifyCandidates(spotifyToken, rawSurvey);
        
        if (!rawCandidates || rawCandidates.length === 0) {
            console.warn("⚠️ No se encontraron candidatos.");
            return [];
        }

        // =========================================================
        // 2. ANÁLISIS Y FUSIÓN (Python + Datos Viejos)
        // =========================================================
        console.log(`🧪 Analizando ${rawCandidates.length} candidatos...`);

        const vectorPromises = rawCandidates.map(async (candidate) => {
            try {
                // A. Pedir análisis matemático (Energy, BPM...)
                const rawAnalysis = await getAnalizedSong(candidate.id);
                
                if (!rawAnalysis) return null; // Si falla el análisis, descartamos

                // B. Convertir a Vector (0.0 - 1.0)
                const songVector = mapSongToVector(rawAnalysis);

                // C. 🚨 FUSIÓN CRÍTICA: Pegamos el Audio/Imagen del motor viejo al vector nuevo
                songVector.display_data = {
                    title: candidate.name,
                    artist: candidate.artists.map(a => a.name).join(", "),
                    cover: candidate.album?.images[0]?.url || "/img/defaultcover.png",
                    preview_url: candidate.preview_url, // AQUÍ VA EL AUDIO
                    uri: candidate.uri,
                    spotify_link: candidate.external_url
                };

                return songVector;

            } catch (e) {
                console.error(`Error analizando ${candidate.name}`, e);
                return null;
            }
        });

        // Esperar a todos y filtrar nulos
        const validVectors = (await Promise.all(vectorPromises)).filter(v => v !== null);


        // =========================================================
        // 3. RANKING NEURO-ACÚSTICO (La Ecuación)
        // =========================================================
        console.log(`🧠 Aplicando ecuación a ${validVectors.length} tracks...`);

        // Convertimos la encuesta a Vector Objetivo
        const { targetVector, categoricalFilters } = translateFullSurvey(rawSurvey, { data: {} });

        // Ordenamos
        const rankedPlaylist = rankCandidates(targetVector, categoricalFilters, validVectors);


        // =========================================================
        // 4. RETORNO
        // =========================================================
        // Devolvemos solo el Top 10 (o 20)
        return rankedPlaylist.slice(0, 15);

    } catch (error) {
        console.error("❌ Fallo crítico en el motor híbrido:", error);
        return [];
    }
}