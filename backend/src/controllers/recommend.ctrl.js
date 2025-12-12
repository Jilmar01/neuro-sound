import Song from '../models/song.model.js'
import { buildMongoFilterFromSurvey, getRecommendationsFromSongs } from '../services/recommend.engine.js';
import { getProfileUser } from '../services/survey.service.js';
import { sendError, sendSuccess } from '../utils/response.util.js';

export const recommendMusic = async (req, res) => {
    try {
        const userId = req.user?._id;

        // Obtener encuesta del usuario
        const survey = await getProfileUser(userId);

        if (!survey) {
            return sendError(res, 'No existe encuesta asociada al usuario', 404);
        }

        // 1. Crear filtro dinámico
        const mongoFilter = buildMongoFilterFromSurvey(survey);

        // 2. Buscar canciones candidatas
        const candidates = await Song.find(mongoFilter)
            .limit(300)
            .lean();

        // 3. Motor de recomendación
        const results = getRecommendationsFromSongs(survey, candidates, {
            minScore: 10
        });

        // 4. Respuesta estandarizada
        return sendSuccess(res, results, 'Recomendaciones generadas correctamente', 200);

    } catch (error) {
        return sendError(res, 'Error al obtener las canciones', 500, error.message);
    }
};
