import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.mdlw.js';
import { searchSongs, survey, updateSurvey } from '../controllers/survey.ctrl.js';
import { getSurvey } from '../controllers/survey.ctrl.js';

const router = Router();

//Registro de la Encuesta
router.post("/register", authMiddleware, survey);

//Obtiene el registro de la Encuesta
router.get("/get-register", authMiddleware, getSurvey);

//Actualiza la ultima Encuesta del usuario
router.put("/update", authMiddleware, updateSurvey);

export default router;
