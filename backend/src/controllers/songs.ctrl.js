import { findSongsByIds, getAllSongs, getSongsPaginatedService } from "../services/songs.service.js"
import { sendError, sendSuccess } from "../utils/response.util.js";
import { getTrackById } from "../services/spotify.service.js";
import { getGenreByArtistId } from "../services/artist.service.js";

export const getSongs = async (req, res) => {
    try {
        const response = await getAllSongs();
        return sendSuccess(res, response, "Lista de canciones obtenida correctamente", 200);
    } catch (error) {
        return sendError(res, error.message || "Error interno del servidor", 500);
    }
}

export const getSongsPaginated = async (req, res) => {
    try {
        const { skip, limit } = req.query;
        const response = await getSongsPaginatedService({ skip, limit });

        let songsWithGenres = [];
        for (const song of response) {
            let genres = [];

            for (const artistId of song.id_artists) {
                const artistGenres = await getGenreByArtistId(artistId);
                
                if (artistGenres && artistGenres.length > 0) {
                    genres = artistGenres;
                    break;
                }
            }

            song.genres = genres;
            songsWithGenres.push(song);
        }

        return sendSuccess(res, songsWithGenres, "Lista de canciones obtenida correctamente", 200);
    } catch (error) {
        return sendError(res, error.message || "Error interno del servidor", 500);
    }
}

export const getSongById = async (req, res) => {
    try {
        const { track_id } = req.body;
        const song = await getTrackById(track_id);
        if (!song) {
            return sendError(res, "Canción no encontrada", 404);
        }
        return sendSuccess(res, song, "Canción obtenida correctamente", 200);
    } catch (error) {
        return sendError(res, error.message || "Error interno del servidor", 500);
    }
}

export const getTracksByIds = async (req, res) => {
    try {
        const { track_ids } = req.body;
        const track = await findSongsByIds(track_ids);
        return sendSuccess(res, track, "Canciones obtenidas correctamente", 200);
    } catch (error) {
        return sendError(res, "Error al obtener las canciones", error.status, error.message);
    }
}