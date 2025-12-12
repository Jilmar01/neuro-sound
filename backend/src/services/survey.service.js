import Survey from "../models/survey.model.js";
import { updateUser } from "./user.service.js";

export const processSurvey = async (userId, surveyData) => {
    try {

        if (!userId) {
            throw new Error("El userId es obligatorio.");
        }

        if (!surveyData) {
            throw new Error("Los datos de la encuesta están vacíos.");
        }

        const sanitizedData = { userId, ...surveyData };
        

        const surveyDoc = new Survey(sanitizedData);
        const savedSurvey = await surveyDoc.save();

        await updateUser(userId, { form: true });

        return {
            ok: true,
            surveyId: savedSurvey._id,
            message: "Encuesta guardada correctamente",
            timestamp: savedSurvey.createdAt
        };

    } catch (error) {
        console.error("Error en processSurvey:", error);
        throw new Error(error.message || "Error procesando la encuesta");
    }
};

export const getProfileUser = async (userId) => {
    if (!userId) {
        throw new Error("El userId es obligatorio.");
    }

    try {
        const survey = await Survey.findOne({ userId }).lean();

        return survey;
        
    } catch (err) {
        throw new Error("No se pudo obtener el perfil del usuario.");
    }
};

