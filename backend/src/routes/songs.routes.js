import { Router } from 'express';
import { getSongById, getSongs } from '../controllers/songs.ctrl.js';

const router = Router();

// Obtiene todas las canciones
router.get("/all-songs", getSongs);

// Obiene una canción por su ID
router.post("/track", getSongById);

export default router;