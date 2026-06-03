import { getMostPopularArtists, getArtists } from "../services/artist.service.js";
import { sendError, sendSuccess } from "../utils/response.util.js";

/*
* Obtiene los artistas más populares, con un límite opcional
*/
export const getPopularArtists = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const artists = await getMostPopularArtists(limit);

        return sendSuccess(res, artists, 'Artistas más populares obtenidos', 200);
    } catch (error) {
        return sendError(res, error.message, 500);
    }
}

/**
 * Busca artistas por nombre o género, con paginación y limite opcionales
 */
export const searchArtists = async (req, res) => {
    try {
        const {page = 1, limit = 15, search = '', genre = ''} = req.query;

        const artists = await getArtists({
            page: parseInt(page),
            limit: parseInt(limit),
            search,
            genre
        });

        return sendSuccess(res, artists, 'Artistas encontrados', 200);
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};
