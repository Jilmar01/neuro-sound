import { getIAE, iaeRegister } from "../services/iae.survey.service.js";
import { sendSuccess, sendError } from "../utils/response.util.js";
import { HttpError } from "../utils/httpError.js";

export const getIAESurvey = async (req, res) => {
    try {
        const userId = req.user.id;
        const response = await getIAE(userId);

        return sendSuccess(res, response, "Encuesta IAE obtenida correctamente", 200);
    } catch (error) {
        return sendError(res, "Error al obtener encuesta IAE", error.status, error.message);
    }
};

export const iaeSurveyRegister = async (req, res) => {
    try {
        const userId = req.user._id;
        const data = req.body;

        const response = await iaeRegister(userId, data);

        return sendSuccess(res, response, "Encuesta IAE registrada correctamente", 201);
    } catch (error) {
        return sendError(res, "Error al registrar encuesta IAE", error.status, error.message);
    }
};
