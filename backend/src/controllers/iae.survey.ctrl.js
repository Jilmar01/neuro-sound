import { getIAE, iaeRegister } from "../services/iae.survey.service.js";
import { getRecommendation } from "../services/recommendation.service.js";
import { HttpError } from "../utils/httpError.js";
import { sendSuccess, sendError } from "../utils/response.util.js";

export const getIAESurvey = async (req, res) => {
    try {
        const userId = req.user._id;

        const recomendation = await getRecommendation(userId);
        if(!recomendation) {
            throw new HttpError('No existe recomendacion disponible', 404);
        }

        const response = await getIAE(userId, recomendation._id);

        return sendSuccess(res, response, "Encuesta IAE obtenida correctamente", 200);
    } catch (error) {
        return sendError(res, "Error al obtener encuesta IAE", error.status, error.message);
    }
};

export const iaeSurveyRegister = async (req, res) => {
    try {
        const userId = req.user._id;
        const data = req.body;

        const recomendation = await getRecommendation(userId);
        if(!recomendation) {
            throw new HttpError('No existe recomendacion disponible', 404);
        }

        const response = await iaeRegister(userId, recomendation._id, data);

        return sendSuccess(res, response, "Encuesta IAE registrada correctamente", 201);
    } catch (error) {
        return sendError(res, "Error al registrar encuesta IAE", error.status, error.message);
    }
};
