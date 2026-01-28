import { Router } from 'express';
import { getSongById, getSongs, analizeSong, getTracksByIds } from '../controllers/songs.ctrl.js';

const router = Router();

// Obtiene todas las canciones
router.get("/all-songs", getSongs);

// Obiene una canción por su ID
router.post("/track", getSongById);

// Obtiene las canciones por array de IDs
router.post("/tracks", getTracksByIds);

/* Analiza una cancion por nombre y artista */
router.post("/analyze-audio", analizeSong);

export default router;