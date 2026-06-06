import Survey from "../models/survey.model.js";
import { HttpError } from "../utils/httpError.js";
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
        throw new HttpError(error.message || "Error procesando la encuesta", 500);
    }
};

export const getProfileUser = async (userId) => {
    if (!userId) {
        throw new HttpError("El userId es obligatorio.", 400);
    }

    try {
        const survey = await Survey
            .findOne({ userId })
            .sort({ createdAt: -1 })
            .lean();

        if (!survey) {
            throw new HttpError("El usuario no tiene una encuesta registrada.", 404);
        }

        return survey;

    } catch (error) {
        throw new HttpError(error.message || "Error obteniendo el perfil del usuario.", 500);
    }
};


/**
 * Actualiza una encuesta de un usuario
 * 
 * @param {*} surveyId - Id de la encuesta a Actualizar
 * @param {*} surveyData - Datos de la encuesta a Actualizar
 */
export const updateSurveyById = async (surveyId, surveyData) => {
    try {
        if (!surveyId) {
            throw new HttpError("El usuario no tiene una encuesta registrada.", 404);
        }

        if (!surveyData) {
            throw new HttpError("Los datos de la encuesta están vacíos.", 400);
        }

        const updatedSurvey = await Survey.findOneAndUpdate(
            { _id: surveyId },
            { $set: surveyData },
            { new: true }
        );

        if (!updatedSurvey) {
            throw new HttpError("Encuesta no encontrada.", 404);
        }

    } catch (error) {
        throw new HttpError(error.message || "Error actualizando la encuesta", 500);
    }
};
