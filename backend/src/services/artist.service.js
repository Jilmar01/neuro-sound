import Artist from '../models/artist.model.js';
import { HttpError } from '../utils/httpError.js';

/**
 * Obtiene los artistas más populares 
 * 
 * @param {int} limit - Número máximo de artistas a devolver (opcional, por defecto 10)
 * @returns - Array de artistas ordenados por popularidad
 */
export const getMostPopularArtists = async (limit) => {
    return await Artist.find()
        .sort({ popularity: -1 })
        .limit(limit);
}

/**
 * Busca artistas por nombre o género, con paginación y límite opcionales
 * 
 * @param {int} page - Número de página
 * @param {int} limit - Número máximo de artistas por página
 * @param {string} search - Texto de búsqueda
 * @param {string} genre - Género de búsqueda
 * @returns {Object} - Objeto con los artistas encontrados y la información de paginación
 */
export const getArtists = async ({page, limit, search, genre}) => {

    const filter = {};

    if (search) {
        filter.name = {
            $regex: search,
            $options: 'i'
        };
    }

    if (genre) {
        filter.genres = {
            $regex: genre,
            $options: 'i'
        };
    }

    const skip = (page - 1) * limit;

    const [artists, total] = await Promise.all([
        Artist.find(filter)
            .sort({ popularity: -1 })
            .skip(skip)
            .limit(limit),
        Artist.countDocuments(filter)
    ]);

    return {
        artists,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

export const getGenreByArtistId = async (artistId) => {
    const artist = await Artist.findOne({ id: artistId });
    console.log("Artista encontrado:", artist);
    if (!artist) {
        throw new HttpError('No se encontró el artista', 404);
    }

    return artist.genres;
};