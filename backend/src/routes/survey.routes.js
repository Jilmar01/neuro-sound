import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.mdlw.js';
import { survey, getSurvey, updateSurvey, updateSurveyId } from '../controllers/survey.ctrl.js';

const router = Router();

//Registro de la Encuesta
router.post("/register", authMiddleware, survey);

//Obtiene el registro de la Encuesta
router.get("/get-register", authMiddleware, getSurvey);

//Actualiza la ultima Encuesta del usuario
router.put("/update", authMiddleware, updateSurvey);

//Actualizar la encuesta por ID
router.put("/update/:id", authMiddleware, updateSurveyId);

export default router;
