import { getProfileUser, processSurvey, updateSurveyById } from "../services/survey.service.js";
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

export const getSurvey = async(req, res)  => {
  try {
    const userId = req.user?._id;
    
    const survey = await getProfileUser(userId);

    if (!survey) {
      return sendError(res, "El usuario no tiene encuestas registradas", 404);
    }

    return sendSuccess(res, survey, "Encuesta del usuario", 200);

  } catch (error) {
    return sendError(res, error.message || "Error interno del servidor", 500);
  }
}

/**
 * Actualiza la última encuesta del usuario
 */
export const updateSurvey = async (req, res) => {
  try {
    const userId = req.user?._id;
    const surveyData = { ...req.body };

    const survey = await getProfileUser(userId);

    const updatedSurvey = await updateSurveyById(survey._id, surveyData);

    return sendSuccess(res, updatedSurvey, "Encuesta actualizada correctamente", 200);

  } catch (error) {
    return sendError(res, "Error actualizando la encuesta", error.status || 500, error.message);
  }
}

export const updateSurveyId = async (req, res) => {
  try {
    const { id } = req.params;
    const surveyData = { ...req.body };

    const updatedSurvey = await updateSurveyById(id, surveyData);

    return sendSuccess(res, updatedSurvey, "Encuesta actualizada correctamente", 200);
  } catch (error) {
    return sendError(res, "Error actualizando la encuesta", error.status || 500, error.message);
  }
};
