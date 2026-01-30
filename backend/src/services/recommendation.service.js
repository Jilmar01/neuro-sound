import Recommendation from "../models/recommendation.model.js"
import { HttpError } from "../utils/httpError.js";

export const saveRecommendation = async (userId, surveyId, result) => {
    if (!result) {
        throw new HttpError('Datos incompletos para registrar la recomendación', 400);
    }

    const recommendation = new Recommendation({ userId, surveyId, result });
    return await recommendation.save();
}

export const getRecommendationBySurvey = async (userId, surveyId) => {
  return await Recommendation.findOne({ userId, surveyId });
};

export const getRecommendation = async (userId) => {
    return await Recommendation.findOne({ userId }).sort({ createdAt: -1 });
}