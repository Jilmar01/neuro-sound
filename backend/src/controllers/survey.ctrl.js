import { processSurvey } from "../services/survey.service.js";
import { sendError, sendSuccess } from "../utils/response.util.js";

export const survey = async (req, res) => {
  try {

    if (!req.user || !req.user._id) {
      return sendError(res, "Usuario no autenticado", 401);
    }

    const userId = req.user._id;

    const surveyData = { ...req.body };

    const result = await processSurvey(userId, surveyData);

    return sendSuccess(res, result, "Encuesta procesada correctamente", 200);

  } catch (error) {
    console.error("Error en survey controller:", error);
    return sendError(res, error.message || "Error interno del servidor", 500);
  }
};


