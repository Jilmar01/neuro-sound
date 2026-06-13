import Recommendation from "../models/recommendation.model.js"
import { HttpError } from "../utils/httpError.js";

export const saveRecommendation = async (userId, surveyId, tracks) => {
    if (!result) {
        throw new HttpError('Datos incompletos para registrar la recomendación', 400);
    }

    const recommendation = new Recommendation({ userId, surveyId, tracks });
    return await recommendation.save();
}

export const getRecommendationBySurvey = async (userId, surveyId) => {
    const recommendation = await Recommendation.findOne({ userId, surveyId });
    if (!recommendation) {
        throw new HttpError('No existe recomendación para esta encuesta', 404);
    }
    return recommendation;
};

export const getRecommendation = async (userId) => {
    return await Recommendation.findOne({ userId }).sort({ createdAt: -1 });
}

export const feedbackRecommendationForTrack = async (recommendationId, trackId, feedback = null) => {
    
    if (!recommendationId) {
        throw new HttpError('El ID de la recomendación es requerido.', 400);
    }
    
    if (!trackId) {
        throw new HttpError('El ID del track es requerido.', 400);
    }
    
    const updateRecommendation = await Recommendation.findOneAndUpdate(
        {
            _id: recommendationId,
            'tracks.id': trackId
        },
        {
            $set: { 'tracks.$.feedback': feedback }
        },
        { new: true }
    );


    if (!updateRecommendation) {
        throw new HttpError('No existe recomendacion para actualizar', 404);
    }

    return true;
};