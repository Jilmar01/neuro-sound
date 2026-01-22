import { findSong, getAllSongs } from "../services/songs.service.js"
import { sendError, sendSuccess } from "../utils/response.util.js";

export const getSongs = async (req, res) => {
    try {
        const response = await getAllSongs();
        return sendSuccess(res, response, "Lista de canciones obtenida correctamente", 200);
    } catch (error) {
        return sendError(res, error.message || "Error interno del servidor", 500);
    }
}

export const getSongById = async (req, res) => {
    try {
        const { id } = req.body;
        const song = await findSong("track_id", id);
        if (!song) {
            return sendError(res, "Canción no encontrada", 404);
        }   
        return sendSuccess(res, song, "Canción obtenida correctamente", 200);
    } catch (error) {
        return sendError(res, error.message || "Error interno del servidor", 500);
    }
}
