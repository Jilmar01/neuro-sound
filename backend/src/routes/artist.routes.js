import { Router } from 'express';
import { getPopularArtists, searchArtists } from '../controllers/artis.ctrl.js';

const router = Router();

// Obtine los artistas más populares, con un límite opcional
router.get('/popular', getPopularArtists);

// Busca artistas por nombre o género
router.get('', searchArtists);

export default router;