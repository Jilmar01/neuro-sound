import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.mdlw.js';
import { getRecommendation, recommendMusic } from '../controllers/recommendation.ctrl.js';

const router = Router();

// Genera la recomendacion de las canciones
router.get("/generate", authMiddleware, recommendMusic);

// Obtiene la recomendacion de las canciones
router.get('/latest', authMiddleware, getRecommendation);

export default router;