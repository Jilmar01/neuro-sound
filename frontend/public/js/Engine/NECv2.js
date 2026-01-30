/* public/js/Engine/neuroEngineController.js */

// 1. IMPORTACIONES: Las 4 Piezas del Rompecabezas
import { getAllAnalyzedSongs, getSurvey } from './getData.js';          // El Minero (Trae todo de la BD)
import { translateFullSurvey } from './surveyNormalizer.js'; // El Arquitecto (Define el objetivo)
import { normalizeAllSongsResponse } from './allSongNormalizer.js'; // El Traductor Masivo (Convierte DB -> Math)
import { rankCandidates } from './neuroEngine.js';                 // El Juez (Ranking Matemático)
import { enrichWithSpotifyMetadata } from './dbsource.js';         // El Decorador (Trae fotos/audio de Spotify)

// 2. CONTROLADOR PRINCIPAL
export async function generateHybridPlaylist() {
    console.log("🏭 INICIANDO MOTOR (Modo: DB-First / Target-First)...");

    try {
        // =========================================================
        // PASO 1: OBTENCIÓN DE MATERIA PRIMA (Local Server)
        // =========================================================
        console.log("Solicitando biblioteca completa al servidor...");
        const rawSurvey = await getSurvey();

        // Descargamos las 774+ canciones de golpe (es texto ligero)
        const allRawSongs = await getAllAnalyzedSongs();

        

        if (!allRawSongs || allRawSongs.length === 0) {
            console.warn("⚠️ La base de datos está vacía o no respondió.");
            return [];
        }

        // =========================================================
        // PASO 2: TRADUCCIÓN Y NORMALIZACIÓN (Conversores)
        // =========================================================
        console.log("Traduciendo datos a Vectores Matemáticos...");

        // A. Definimos el OBJETIVO (Target Vector) basado en la encuesta
        const { targetVector, categoricalFilters } = translateFullSurvey(rawSurvey);
        
        // B. Definimos los CANDIDATOS (Candidate Vectors) basados en la BD
        // Usamos el normalizador masivo que creamos antes
        const candidateVectors = normalizeAllSongsResponse(allRawSongs);

        console.log(`Objetivo definido. Comparando contra ${candidateVectors.length} vectores candidatos...`);

        // =========================================================
        // PASO 3: EL MOTOR NEURO-ACÚSTICO (Ranking)
        // =========================================================
        // Aquí ocurre la ciencia: Distancia Euclidiana + Filtros
        const rankedResults = rankCandidates(
            targetVector,       // Lo que quiere el usuario
            categoricalFilters, // Filtros duros (Género, etc.)
            candidateVectors    // Lo que tenemos en la BD
        );

        // Seleccionamos a los ganadores (Top 15)
        const topWinners = rankedResults.slice(0, 15);

        if (topWinners.length === 0) {
            console.warn("Ninguna canción de la BD cumplió los criterios matemáticos.");
            return [];
        }

        console.log(`🏆 Top ${topWinners.length} seleccionados. ID Líder: ${topWinners[0].id} (Score: ${topWinners[0].score}%)`);

        // =========================================================
        // PASO 4: ENRIQUECIMIENTO (Llamada a Spotify)
        // =========================================================
        console.log("Obteniendo metadatos visuales/audibles de Spotify...");

        // Preparamos los datos para el "Mensajero"
        // Mapeamos .id (interno) a .track_id (para Spotify)

        const winnersForEnrichment = topWinners.map(w => ({
            track_id: (w.name || w.id), 
            neuro_score: w.score
        }));
        
        // Hacemos UNA sola llamada a Spotify para las 15 canciones
        const finalPlaylist = await enrichWithSpotifyMetadata(winnersForEnrichment);

        console.log(`✅ Playlist Final lista con ${finalPlaylist.length} tracks.`);
        return finalPlaylist;

    } catch (error) {
        console.error("❌ Fallo crítico en el flujo DB-First:", error);
        return [];
    }
}