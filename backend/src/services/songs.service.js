import Song from '../models/song.model.js';
import { HttpError } from '../utils/httpError.js';

export const getAllSongs = async () => {
    const songs = await Song.find().lean();
    return songs;
}

export const findSongsByIds = async (track_ids = []) => {
    if (!Array.isArray(track_ids)) {
        throw new HttpError('Track_ids must be an array', 400);
    }
    return Song.find({
        track_id: { $in: track_ids }
    });
};

export const findSong = async (key, value) => {
    const song = await Song.findOne({ [key]: value });
    return song;
}