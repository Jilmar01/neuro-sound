import IAESurvey from "../models/iae.survey.model.js";
import { HttpError } from "../utils/httpError.js";

export const getIAE = async (userId) => {
    const survey = await IAESurvey.findOne({ userId: userId });

    if (!survey) {
        throw new HttpError("Encuesta IAE no encontrada", 404);
    }

    return survey;
};

export const iaeRegister = async (userId, data) => {
    const { M1, M2, M3 } = data;


    if (!M1 || !M2 || M3 === undefined) {
        throw new HttpError("Datos M incompletos", 400);
    }

    const exists = await IAESurvey.findOne({ useId: userId });
    if (exists) {
        throw new HttpError("El usuario ya tiene una encuesta IAE", 409);
    }

    const survey = new IAESurvey({ userId: userId, M1, M2, M3 });
    await survey.save();
    
    return survey;
};

