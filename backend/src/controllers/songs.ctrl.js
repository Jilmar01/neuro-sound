import { findSongsByIds, getAllSongs } from "../services/songs.service.js"
import { sendError, sendSuccess } from "../utils/response.util.js";
import { getTrackById } from "../services/spotify.service.js";

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