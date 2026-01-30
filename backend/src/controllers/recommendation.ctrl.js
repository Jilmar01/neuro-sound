import { getRecommendationBySurvey, saveRecommendation } from '../services/recommendation.service.js';
import { generateHybridPlaylist } from '../services/recommendationEngine/NECv2.js';
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
        if (!survey) {
            throw new HttpError('No existe encuesta asociada al usuario', 404);
        }
        const surveyId = survey._id;

        const recommend = await generateHybridPlaylist(survey);
        if (!recommend) {
            console.log("Entra al tratar de generar recomendacion");
            throw new HttpError('Error al generar la recomendacion de canciones', 400);
        }
        console.log(recommend);

        const recommendation = await saveRecommendation(userId, surveyId, recommend);
        
        if(!recommendation) {
            console.log("Entra al tratar de guardar la recomendacion");
            
            throw new HttpError('Error al generar la recomendacion de canciones', 400);
        }

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
        if (!survey) {
            throw new HttpError('No existe encuesta asociada al usuario', 404);
        }

        const recommendation = await getRecommendationBySurvey(userId, survey._id);
        if (!recommendation) {
            throw new HttpError('No existe recomendación para esta encuesta', 404);
        }

        return sendSuccess(res, recommendation, 'Recomendación obtenida correctamente', 200);
   
    } catch (error) {
        return sendError(res, 'Error al obtener la recomendacion previa', error.status, error.error);
    }
}