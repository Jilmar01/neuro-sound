/* Servicio para interactuar con la API Web de Spotify */
import { getSpotifyToken } from "../utils/spotifyAuth.js";

const url_spotify = 'https://api.spotify.com/v1/';

/**
 * Buscar una canion por su id en Spotify.
 * 
 * @param {*} trackId - ID de la canción a buscar
 * @returns - Datos de la canción encontrada
 */
export const getTrackById = async (trackId) => {
  try {
    const token = await getSpotifyToken();
    const response = await fetch(`${url_spotify}tracks/${trackId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error(`Spotify API ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching track from Spotify:', error.message || error);
    throw error;
  }
};

/**
 * Buscar por parametros en Spotify.
 * 
 * @param {*} params - Parámetros de búsqueda
 * @returns - Lista de canciones que coinciden con los parámetros proporcionados
 */
export const searchTracks = async (query, type = 'track', limit = 10) => {
  try {
    const token = await getSpotifyToken();
    const response = await fetch(`${url_spotify}search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error(`Spotify API ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching tracks on Spotify:', error.message || error);
    throw error;
  }
};

/**
 * Busca un artista en Spotify por su nombre.
 * 
 * @param {*} artistName - Nombre del artista a buscar
 * @returns - Lista de artistas que coinciden con el nombre proporcionado
 */
export const searchArtist = async (artistName) => {
  try {
    const token = await getSpotifyToken();
    const response = await fetch(`${url_spotify}search?q=${encodeURIComponent(artistName)}&type=artist`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error(`Spotify API ${response.status}`);
    const data = await response.json();
    return data.artists.items;
  } catch (error) {
    console.error('Error searching for artist on Spotify:', error.message || error);
    throw error;
  }
};

/**
 * Aproxima una frecuencia a parámetros de Spotify y devuelve canciones cercanas.
 * @param {number} freq Frecuencia deseada (ej: 432, 40, 10)
 */
export async function getTracksByApproxFrequency(freq) {

  const profile = mapFrequencyToFeatures(freq);

  // 1. Búsqueda inicial amplia
  const query = "ambient OR meditation OR focus OR chill";
  const searchUrl = `${url_spotify}search?q=${encodeURIComponent(query)}&type=track&limit=15`;

  // 1. Búsqueda inicial
  const token = await getSpotifyToken();
  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!searchRes.ok) throw new Error(`Spotify API ${searchRes.status}`);
  const searchData = await searchRes.json();

  const trackIds = (searchData.tracks?.items || []).map(t => t.id).join(",");
  if (!trackIds) return [];

  // 2. Obtener audio features
  const featuresUrl = `${url_spotify}audio-features?ids=${trackIds}`;
  const featuresRes = await fetch(featuresUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!featuresRes.ok) throw new Error(`Spotify API ${featuresRes.status}`);
  const featuresData = await featuresRes.json();
  const features = featuresData.audio_features || [];


  // 3. Calcular afinidad (distancia)
  const scored = features.map(f => {
    const score =
      Math.abs((f.energy ?? 0) - profile.energy) +
      Math.abs((f.acousticness ?? 0) - profile.acousticness) +
      Math.abs((f.valence ?? 0) - profile.valence) +
      Math.abs((f.tempo ?? 0) - profile.tempo);

    return { id: f.id, score };
  });

  scored.sort((a, b) => a.score - b.score);

  return scored.slice(0, 10).map(s => s.id);
}

/**
 * Mapea una frecuencia a un perfil aproximado de audio features de Spotify
 */
function mapFrequencyToFeatures(freq) {

  if (freq <= 12) { // Ondas Alfa
    return {
      energy: 0.2,
      acousticness: 0.8,
      valence: 0.3,
      tempo: 60
    };
  }

  if (freq <= 30) { // Ondas Beta
    return {
      energy: 0.7,
      acousticness: 0.2,
      valence: 0.5,
      tempo: 120
    };
  }

  if (freq <= 70) { // Relajación profunda
    return {
      energy: 0.3,
      acousticness: 0.9,
      valence: 0.4,
      tempo: 70
    };
  }

  if (freq <= 200) { // Enfoque
    return {
      energy: 0.6,
      acousticness: 0.2,
      valence: 0.5,
      tempo: 100
    };
  }

  if (freq === 432) { // 432 Hz
    return {
      energy: 0.4,
      acousticness: 0.7,
      valence: 0.6,
      tempo: 95
    };
  }

  // Default
  return {
    energy: 0.5,
    acousticness: 0.5,
    valence: 0.5,
    tempo: 90
  };
}

/* Buscar informacion de una cancion */
const getAudioFeatures = async (trackIds) => {
  try {
    const token = await getSpotifyToken();
    const response = await fetch(`${url_spotify}audio-features?ids=${trackIds}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      }
    });
    if (!response.ok) throw new Error(`Spotify API ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error leyendo audio-features:", error.message || error);
    throw error;
  }
};

export async function getTrackData(trackId) {
    const token = await getSpotifyToken();
    const response = await fetch(`${url_spotify}/tracks/${trackId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    const result = await response.json();

    return {
        name: result.name,
        artist: result.artists[0].name,
        duration_ms: result.duration_ms
    };
}