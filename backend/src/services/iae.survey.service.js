import IAESurvey from "../models/iae.survey.model.js";
import { HttpError } from "../utils/httpError.js";

export const getIAE = async (userId, recommendationId) => {
    const survey = await IAESurvey.findOne({ userId, recommendationId });

    if (!survey) {
        throw new HttpError("Encuesta IAE no encontrada", 404);
    }

    return survey;
};

export const iaeRegister = async (userId, recommendationId, data) => {
    const { M1, M2, M3, satisfaction } = data;

    if (!M1 || !M2 || M3 === undefined, !satisfaction) {
        throw new HttpError("Datos M incompletos", 400);
    }

    const survey = new IAESurvey({ userId, recommendationId, M1, M2, M3, satisfaction });
    await survey.save();
    
    return survey;
};

