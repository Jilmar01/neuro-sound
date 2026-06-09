import { getRecommendationBySurvey, saveRecommendation } from '../services/recommendation.service.js';
import { generateHybridPlaylist } from '../services/recommendationEngine/NECv2.js';
import { getRecommendationEngine } from '../services/engine.service.js';
import { getProfileUser } from '../services/survey.service.js';
import { HttpError } from '../utils/httpError.js';
import { sendError, sendSuccess } from '../utils/response.util.js';

/**
* Genera una recomendacion de canciones
*/
export const recommendMusic = async (req, res) => {
    try {
        const userId = req.user?._id;

        const survey = await getProfileUser(userId);
        const surveyId = survey._id;

        // Consume el motor de recomendación para obtener las canciones recomendadas
        const recommend = await getRecommendationEngine(survey);
        const track_Ids = recommend.recomendacionGenerada;
        
        const recommendation = await saveRecommendation(userId, surveyId, track_Ids);
        
        return sendSuccess(res, recommendation, 'Recomendaciones generadas correctamente', 200);

    } catch (error) {
        return sendError(res, 'Error al obtener las canciones', error.status, error.message);
    }
};

/**
 * Obtiene la recomendacion de canciones
 */
export const getRecommendation = async (req, res) => {
    try {
        const userId = req.user?._id;

        const survey = await getProfileUser(userId);

        const recommendation = await getRecommendationBySurvey(userId, survey._id);

        return sendSuccess(res, recommendation, 'Recomendación obtenida correctamente', 200);
   
    } catch (error) {
        return sendError(res, 'Error al obtener la recomendacion previa', error.status, error.message);
    }
}

export const saveRecommendationBySurvey = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { surveyId, result } = req.body;

        const recommendation = await saveRecommendation(userId, surveyId, result);
        
        if(!recommendation) {
            throw new HttpError('Error al generar la recomendacion de canciones', 400);
        }
        return sendSuccess(res, recommendation, 'Recomendación guardada correctamente', 200);
    } catch (error) {
        return sendError(res, 'Error al guardar la recomendacion', error.status, error.message);
    }
}
