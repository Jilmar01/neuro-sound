import { Router } from 'express';
import { getSongById, getSongs, getTracksByIds } from '../controllers/songs.ctrl.js';

const router = Router();

// Obtiene todas las canciones
router.get("/all-songs", getSongs);

// Obiene una canción por su ID
router.post("/track", getSongById);

// Obtiene las canciones por array de IDs
router.post("/tracks", getTracksByIds);

export default router;