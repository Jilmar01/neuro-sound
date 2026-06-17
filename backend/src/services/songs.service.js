import Song from '../models/song.model.js';
import { HttpError } from '../utils/httpError.js';
import { getDomain } from './music.server.service.js';

export const getSongsCloud = async (artists, genres, limit) => {
    try {
        const domainArr = await getDomain("NeuroSound Music Server");
        const domain = domainArr[0].domainUrl;

        const reponse = await fetch(`${domain}api/songs/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ artists, genres, limit })
        });

        return await reponse.json();
    } catch (error) {
        throw new HttpError(error, 500);
    }
}

export const analizeSongs = async (title, artists) => {
    try {
        const domainArr = await getDomain("NeuroSound Music Server");
        const domain = domainArr[0].domainUrl;
        const reponse = await fetch(`${domain}api/songs/analyze-audio`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ titulo: title, artista: artists })
        });
        return await reponse.json();
    } catch (error) {
        throw new HttpError(error, 500);
    }
}

export const getAllSongs = async () => {
    const songs = await Song.find().lean();
    return songs;
}

export const getSongsPaginatedService = async ({ skip = 0, limit = 1000 } = {}) => {

    const songs = await Song.find()
        .skip(Number(skip))
        .limit(Number(limit))
        .lean();

    return songs;
};

export const findSongsByIds = async (track_ids = []) => {
    if (!Array.isArray(track_ids)) {
        throw new HttpError('Track_ids must be an array', 400);
    }
    return Song.find({
        id: { $in: track_ids }
    });
};

export const findSong = async (key, value) => {
    const song = await Song.findOne({ [key]: value });
    return song;
};