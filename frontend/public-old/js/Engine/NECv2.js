/* public/js/Engine/neuroEngineController.js */

// 1. IMPORTACIONES: Las 4 Piezas del Rompecabezas
import { getAllAnalyzedSongs, getSurvey } from '/js/Engine/getData.js';          // El Minero (Trae todo de la BD)
import { translateFullSurvey } from '/js/Engine/surveyNormalizer.js'; // El Arquitecto (Define el objetivo)
import { normalizeAllSongsResponse } from '/js/Engine/allSongNormalizer.js'; // El Traductor Masivo (Convierte DB -> Math)
import { rankCandidates } from '/js/Engine/neuroEngine.js';                 // El Juez (Ranking Matemático)
import { enrichWithSpotifyMetadata,enrichWithLocalMetadata } from '/js/Engine/dbsource.js';         // El Decorador (Trae fotos/audio de Spotify)

// 2. CONTROLADOR PRINCIPAL
export async function generateHybridPlaylist(spotifyTokenArg, rawSurvey) {
    console.log("🏭 INICIANDO MOTOR (Modo: DB-First)...");

    try {
        // --- PASO 1: DATA ---
        console.log("Solicitando biblioteca completa al servidor...");
        if (!rawSurvey) rawSurvey = await getSurvey();
        const allRawSongs = await getAllAnalyzedSongs();

        if (!allRawSongs || allRawSongs.length === 0) {
            console.warn("⚠️ Base de datos vacía.");
            return [];
        }

        // --- PASO 2: NORMALIZACIÓN ---
        console.log("Traduciendo datos...");
        const { targetVector, categoricalFilters } = translateFullSurvey(rawSurvey);
        const candidateVectors = normalizeAllSongsResponse(allRawSongs);

        console.log(`Comparando contra ${candidateVectors.length} vectores...`);

        // --- PASO 3: RANKING ---
        const rankedResults = rankCandidates(targetVector, categoricalFilters, candidateVectors);
        const topWinners = rankedResults.slice(0, 15);

        if (topWinners.length === 0) return [];

        console.log(`🏆 Top ${topWinners.length} seleccionados.`);

        // =========================================================
        // PASO 4: ENRIQUECIMIENTO (LÓGICA HÍBRIDA)
        // =========================================================
        
        // 1. VALIDACIÓN PREVIA DEL TOKEN
        const storedToken = localStorage.getItem('spotifyToken');
        const activeToken = spotifyTokenArg || storedToken;
        const hasValidToken = activeToken && activeToken !== 'undefined' && activeToken !== 'null';

        // 2. MAPEO INTELIGENTE (Aquí está el cambio clave) 🧠
        const winnersForEnrichment = topWinners.map(w => {
            // ¿Qué valor necesitamos?
            // Si vamos a Spotify -> Queremos el ID (w.id)
            // Si vamos a Local   -> Queremos el NOMBRE (w.title o w.name)
            
            const identifier = hasValidToken 
                ? w.id 
                : (w.title || w.name || w.id); // Intenta sacar título, sino nombre, sino fallback a ID

            return {
                track_id: identifier, 
                neuro_score: w.score
            };
        });

        console.log(`📋 Identificadores preparados para modo ${hasValidToken ? 'Spotify' : 'Local'}`);

        let finalPlaylist = [];

        // 3. EJECUCIÓN
        if (hasValidToken) {
            console.log("🟢 Token válido. Usando Spotify API...");
            finalPlaylist = await enrichWithSpotifyMetadata(activeToken, winnersForEnrichment);
        } else {
            console.log("🟠 Sin Token. Usando Servidor LOCAL...");
            // Ahora winnersForEnrichment lleva los TÍTULOS ("Take on Me", etc.)
            finalPlaylist = await enrichWithLocalMetadata(winnersForEnrichment);
        }

        console.log(`✅ Playlist Final lista con ${finalPlaylist.length} tracks.`);
        return finalPlaylist;

    } catch (error) {
        console.error("❌ Fallo crítico en el flujo DB-First:", error);
        return [];
    }
}