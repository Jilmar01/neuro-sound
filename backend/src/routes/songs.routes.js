import { Router } from 'express';
import { getSongById, getSongs, getTracksByIds, getSongsPaginated } from '../controllers/songs.ctrl.js';

const router = Router();

// Obtiene todas las canciones
router.get("/all-songs", getSongs);

// Obtiene las canciones de forma paginada
router.get("/paginated", getSongsPaginated);

// Obiene una canción por su ID
router.post("/track", getSongById);

// Obtiene las canciones por array de IDs
router.post("/tracks", getTracksByIds);

export default router;