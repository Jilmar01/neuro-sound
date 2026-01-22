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

const analizeSongs = async (title, artists) => {
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

export const findSong = async (key, value) => {
    const song = await Song.findOne({ [key]: value });
    return song;
}

export const saveSongs = async (songs = []) => {
    if (!Array.isArray(songs)) {
        throw new HttpError("Songs must be an array", 400);
    }

    const uniqueSongs = songs.filter(
        (song, index, self) =>
            index === self.findIndex(s => s.track_id === song.track_id)
    );

    const operations = uniqueSongs.map(song => ({
        updateOne: {
            filter: { track_id: song.track_id },
            update: { $set: song },
            upsert: true
        }
    }));

    const result = await Song.bulkWrite(operations);

    return {
        inserted: result.upsertedCount,
        updated: result.modifiedCount
    };
};

export const verifyAndSaveSongs = async (artists, genres, limit) => {

    const cloudData = await getSongsCloud(artists, genres, limit);

    cloudData.tracks = cloudData.tracks.map(track => {

        let firstArtist = "";

        if (typeof track.artista === "string") {
            firstArtist = track.artista.split(",")[0].trim();
        }

        return {
            ...track,
            onlyArtist: firstArtist
        };
    });

    let newSongs = [];

    for (const song of cloudData.tracks) {

        const exists = await findSong("track_id", song.track_id);

        if (!exists) {
            newSongs.push(song);
        }
    }

    if (newSongs.length === 0) {
        return {
            inserted: 0,
            updated: 0,
            total: 0
        };
    }

    const mappedSongs = [];

    for (const song of newSongs) {

        const full_analysis = await analizeSongs(
            song.titulo,
            song.onlyArtist
        );

        const full = full_analysis.analysis;

        const mappedSong = {
            track_id: song.track_id,
            name: song.titulo,
            artists: Array.isArray(song.artista)
                ? song.artista
                : [song.artista],

            genre: song.genero?.[0] || "unknown",

            bpm: full.bpm,
            energy: full.energy,

            key: full.key,
            camelot: full.camelot,

            timbre: full.timbre,
            drop_time: full.drop_time,

            danceability: full.danceability / 100,
            vocal_presence: full.vocal_presence / 100,

            freq_class: full.freq_class,

            duration: song.duration ?? null,
            popularity: song.popularity ?? null,

            tags: [
                song.genero?.[0],
                full.freq_class,
                full.camelot
            ].filter(Boolean)
        };

        mappedSongs.push(mappedSong);
    }

    const saveResult = await saveSongs(mappedSongs);

    return {
        inserted: saveResult.inserted,
        updated: saveResult.updated,
        total: mappedSongs.length
    };
};

