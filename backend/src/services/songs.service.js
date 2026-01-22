import Song from '../models/song.model.js';

export const getAllSongs = async () => {
    const songs = await Song.find().lean();
    return songs;
}

export const findSong = async (key, value) => {
    const song = await Song.findOne({ [key]: value });
    return song;
}


