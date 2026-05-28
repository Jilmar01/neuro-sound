import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.mdlw.js';
import { recommendMusic } from '../controllers/recommend.ctrl.js';

const router = Router();

//Obtine la recomendacion de las canciones
router.get("/music", authMiddleware, recommendMusic);

export default router;