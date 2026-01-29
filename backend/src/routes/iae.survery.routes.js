import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.mdlw.js';
import { getIAESurvey, iaeSurveyRegister } from '../controllers/iae.survey.ctrl.js';

const router = Router();

// Obtener encuesta IAE del usuario autenticado
router.get("/get-register", authMiddleware, getIAESurvey);

// Registrar encuesta IAE
router.post("/register", authMiddleware, iaeSurveyRegister);

export default router;