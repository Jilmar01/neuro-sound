import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.mdlw.js';
import { survey } from '../controllers/survey.ctrl.js';
import { getSurvey } from '../controllers/survey.ctrl.js';

const router = Router();

//Registro de la Encuesta
router.post("/register", authMiddleware, survey);

//Obtiene el registro de la Encuesta
router.get("/get-register", authMiddleware, getSurvey);

export default router;
