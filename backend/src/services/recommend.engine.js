// services/recommend.engine.js
// Motor de recomendación para NeuroSound – versión ES Modules con funciones flecha

export const EMOTION_FREQUENCIES = {
    tristeza: [110, 174, 210],
    calma: [285, 396, 417],
    felicidad: [440, 528, 639],
    ira: [741, 852, 963]
};

export const TEMPO_RANGES = {
    "muy lentas y solemnes": { min: 20, max: 60 },
    "lentas y tranquilas": { min: 60, max: 80 },
    "ritmo moderado": { min: 80, max: 120 },
    "rápidas y animadas": { min: 120, max: 180 },
    "muy rápidas e intensas": { min: 180, max: 240 }
};

export const INTENT_TAGS = {
    1: ["calm", "neutral", "soft"],
    2: ["happy", "uplift", "positive"],
    3: ["relax", "calm", "ambient"],
    4: ["energy", "motivation", "high_bpm"],
    5: ["focus", "study", "deep", "minimal"]
};

export const DEFAULT_WEIGHTS = {
    genre: 0.25,
    bpm: 0.20,
    energy: 0.15,
    intent: 0.15,
    artist: 0.20,
    tags: 0.05,
    tone: 0.10,
    penalties: {
        leastFavoriteTone: 0.30,
        molestias: 0.15
    }
};

// Utils
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const safeLower = s => (s && typeof s === 'string') ? s.toLowerCase() : s;

// INTERPRET TEMPO
export const interpretTempoPreference = (text = '') => {
    const t = safeLower(text);
    for (const key of Object.keys(TEMPO_RANGES)) {
        if (t.includes(key.split(' ')[0]) || t.includes(key)) return TEMPO_RANGES[key];
    }
    if (t.includes('lenta') || t.includes('tranquil')) return TEMPO_RANGES['lentas y tranquilas'];
    if (t.includes('muy lenta')) return TEMPO_RANGES['muy lentas y solemnes'];
    if (t.includes('rapida') || t.includes('rápida')) return TEMPO_RANGES['rápidas y animadas'];
    if (t.includes('moderado')) return TEMPO_RANGES['ritmo moderado'];
    return { min: 50, max: 110 };
};

// INTENSITY → ENERGY TARGET
export const intensityToEnergyTarget = (intensity = 3) => {
    const i = clamp(Number(intensity) || 3, 1, 5);
    return Math.round(((i - 1) / 4) * (8 - 2) + 2);
};

// SCORES
export const genreScore = (songGenre, preferredGenres = []) => {
    if (!songGenre || !preferredGenres.length) return 0;
    return preferredGenres.includes(safeLower(songGenre)) ? 1 : 0;
};

export const artistScore = (song, artistInterest) => {
    if (!artistInterest) return 0;
    const ai = safeLower(artistInterest);
    const artists = song.artists || (song.artist ? [safeLower(song.artist)] : []);
    return artists.includes(ai) ? 1 : 0;
};

export const tagsScore = (songTags = [], targetTags = []) => {
    if (!songTags.length || !targetTags.length) return 0;
    const sTags = songTags.map(t => safeLower(t));
    const matches = targetTags.reduce(
        (acc, t) => acc + (sTags.includes(safeLower(t)) ? 1 : 0), 0
    );
    return clamp(matches / targetTags.length, 0, 1);
};

export const bpmScore = (songBpm, range) => {
    if (!songBpm || !range) return 0.5;
    const { min, max } = range;
    if (songBpm >= min && songBpm <= max) return 1;
    const center = (min + max) / 2;
    const dist = Math.abs(songBpm - center);
    return clamp(1 - dist / 80, 0, 1);
};

export const energyScore = (songEnergy, surveyIntensity) => {
    const target = intensityToEnergyTarget(surveyIntensity);
    if (songEnergy == null) return 0.5;
    const diff = Math.abs(songEnergy - target);
    return clamp(1 - diff / 10, 0, 1);
};

// TONE COMPATIBILITY
export const toneCompatibility = (song, survey) => {
    if (!survey?.tones?.group) return 0.5;
    const prefGroup = survey.tones.group;
    const prefAvg = prefGroup.reduce((a, b) => a + b, 0) / prefGroup.length;

    if (typeof song.timbre === 'number') {
        return clamp(1 - Math.abs(song.timbre - prefAvg) / Math.max(500, prefAvg), 0, 1);
    }

    if (song.freq_class && typeof song.freq_class === 'string') {
        const fc = song.freq_class.toLowerCase();
        const map = [
            { key: 'bajos', center: 110 },
            { key: 'medios-bajos', center: 200 },
            { key: 'medios', center: 500 },
            { key: 'medios-altos', center: 2000 },
            { key: 'altos', center: 6000 },
            { key: 'calidez', center: 200 }
        ];
        for (const m of map) {
            if (fc.includes(m.key)) {
                return clamp(1 - Math.abs(m.center - prefAvg) / Math.max(2000, prefAvg), 0, 1);
            }
        }
    }

    return 0.5;
};

// PENALTIES
export const tonePenalties = (song, survey, penalties) => {
    if (!survey?.tones) return 0;
    let penalty = 0;

    if (song.dominantFreq) {
        const least = survey.tones.least_favorite;
        if (least && typeof least === 'string' && least.startsWith('tone')) {
            const idx = Number(least.replace(/\D/g, '')) - 1;
            const lf = survey.tones.group[idx];
            if (lf && Math.abs(song.dominantFreq - lf) < 10) {
                penalty += penalties.leastFavoriteTone;
            }
        }
    }

    if (survey.tones.molestias) {
        const group = survey.tones.group;
        group.forEach((toneFreq, idx) => {
            const key = `tone${idx + 1}`;
            const level = survey.tones.molestias[key] || 0;
            const songFreq = song.dominantFreq || song.timbre;
            if (songFreq && level > 0 && Math.abs(songFreq - toneFreq) < 20) {
                penalty += penalties.molestias * (level / 2);
            }
        });
    }

    return clamp(penalty, 0, 1);
};

// BUILD MONGO FILTER
export const buildMongoFilterFromSurvey = (survey, opts = {}) => {
    const tempoRange = interpretTempoPreference(survey.tempo_preference);
    const genres = (survey.genres || []).map(g => safeLower(g));

    const energyTarget = intensityToEnergyTarget(survey.intensity);

    const filter = {
        $and: [
            { bpm: { $gte: tempoRange.min - 20, $lte: tempoRange.max + 30 } },
            { energy: { $gte: energyTarget - 3, $lte: energyTarget + 3 } },
            {
                $or: [
                    { genre: { $in: genres } },
                    { tags: { $in: genres.concat(['relax', 'calm', 'chill', 'soft', 'instrumental']) } },
                ]
            }
        ]
    };

    return filter;
};

export const normalizeArtistInterest = (artist_interest) => {
    if (!artist_interest) return null;

    // Si viene un string → lo convertimos a array
    if (typeof artist_interest === "string") {
        const cleaned = artist_interest.trim();
        return cleaned ? [cleaned] : null;
    }

    // Si viene un array → validamos que no esté vacío
    if (Array.isArray(artist_interest) && artist_interest.length > 0) {
        return artist_interest;
    }

    return null; // array vacío o dato inválido → no filtrar artistas
};


// MAIN RECOMMENDER
export const getRecommendationsFromSongs = (survey, songs = [], options = {}) => {
    const weights = { ...DEFAULT_WEIGHTS, ...(options.weights || {}) };
    const tempoRange = interpretTempoPreference(survey.tempo_preference);

    const preferredGenres = (survey.genres || []).map(g => safeLower(g));
    const intentTags = INTENT_TAGS[survey.intent] || [];
    const minScoreThreshold = options.minScore || 0;

    const scored = songs.map(song => {
        const s = { ...song };
        if (s.genre) s.genre = safeLower(s.genre);
        s.artists = (s.artists || (s.artist ? [safeLower(s.artist)] : []));

        const comp = {
            genre: genreScore(s.genre, preferredGenres),
            artist: artistScore(s, survey.artist_interest),
            tags: tagsScore(s.tags || [], intentTags),
            bpm: bpmScore(s.bpm, tempoRange),
            energy: energyScore(s.energy, survey.intensity),
            tone: toneCompatibility(s, survey)
        };

        let raw = 0;
        raw += comp.genre * weights.genre;
        raw += comp.bpm * weights.bpm;
        raw += comp.energy * weights.energy;
        raw += comp.artist * weights.artist;
        raw += comp.tags * weights.tags;
        raw += comp.tone * weights.tone;

        raw += tagsScore(s.recommendedFor || [], intentTags) * weights.intent;


        const penalty = tonePenalties(s, survey, weights.penalties);
        raw = clamp(raw - penalty, 0, 1);

        const score = Math.round(raw * 100);

        const reasons = [];
        if (comp.genre) reasons.push(`Genero coincide: ${s.genre}`);
        const matchedTag = intentTags.find(tag => s.recommendedFor?.includes(tag));
        if (matchedTag) {
            reasons.push(`Adecuada para: ${matchedTag}`);
        }
        if (comp.bpm > 0.9) reasons.push(`BPM dentro de tu preferencia (${s.bpm} BPM)`);
        else reasons.push(`BPM: ${s.bpm} (ajustada)`);
        reasons.push(`Similitud energía: ${comp.energy * 100 | 0}%`);
        if (comp.artist) reasons.push(`Artista de interés: ${survey.artist_interest}`);
        if (comp.tags) reasons.push(`Tags compatibles: ${comp.tags * 100 | 0}%`);
        if (comp.tone > 0.7) reasons.push(`Alta compatibilidad psicoacústica`);
        if (penalty > 0) reasons.push(`Penalización por molestias: ${penalty * 100 | 0}%`);

        return {
            song: s,
            score,
            reasons,
            components: comp
        };
    });

    const filtered = scored
        .filter(r => r.score >= minScoreThreshold)
        .sort((a, b) => b.score - a.score);

    return {
        filters: {
            genres: preferredGenres,
            bpmRange: tempoRange,
            energyTarget: intensityToEnergyTarget(survey.intensity),
            intent: survey.intent
        },
        total: filtered.length,
        songs: filtered.map(r => ({
            _id: r.song._id,
            name: r.song.name,
            artists: r.song.artists,
            genre: r.song.genre,
            bpm: r.song.bpm,
            energy: r.song.energy,
            tags: r.song.tags,
            recommendedFor: r.song.recommendedFor,
            score: r.score,
            reasons: r.reasons
        }))
    };
};
