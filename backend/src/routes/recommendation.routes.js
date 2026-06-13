import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.mdlw.js';
import { getRecommendation, recommendMusic, saveRecommendationBySurvey, updateFeedback } from '../controllers/recommendation.ctrl.js';

const router = Router();

// Genera la recomendacion de las canciones
router.get("/generate", authMiddleware, recommendMusic);

// Obtiene la recomendacion de las canciones
router.get('/latest', authMiddleware, getRecommendation);

// Actualizar el feedback de una cancion
router.patch('/feedback/:recommendationId', authMiddleware, updateFeedback)

// Guarda la recomendacion de las canciones
router.post("/save", authMiddleware, saveRecommendationBySurvey);

export default router;