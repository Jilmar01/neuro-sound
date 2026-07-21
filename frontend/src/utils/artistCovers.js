/**
 * Utilidad para buscar y almacenar en caché portadas/fotografías de artistas desde iTunes.
 */

const artistImageCache = new Map();
const pendingFetches = new Map();

/**
 * Busca la imagen de un artista en iTunes (iTunes Search API).
 * Intenta primero con entity=musicArtist, y si no hay portada, intenta con entity=song.
 * @param {string} artistName - Nombre del artista.
 * @returns {Promise<string|null>} - URL de la imagen en alta resolución (400x400) o null.
 */
export const fetchArtistImageFromITunes = async (artistName) => {
  if (!artistName || typeof artistName !== 'string') return null;
  const cleanName = artistName.trim();
  if (!cleanName) return null;

  if (artistImageCache.has(cleanName)) {
    return artistImageCache.get(cleanName);
  }

  if (pendingFetches.has(cleanName)) {
    return pendingFetches.get(cleanName);
  }

  const promise = (async () => {
    try {
      // 1. Buscar en iTunes con entity=musicArtist
      const resArtist = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(cleanName)}&entity=musicArtist&limit=1`
      );
      if (resArtist.ok) {
        const data = await resArtist.json();
        if (data?.results && data.results.length > 0 && data.results[0].artworkUrl100) {
          const highRes = data.results[0].artworkUrl100.replace('100x100bb', '400x400bb');
          artistImageCache.set(cleanName, highRes);
          pendingFetches.delete(cleanName);
          return highRes;
        }
      }

      // 2. Fallback: Buscar canción del artista para obtener la carátula del álbum
      const resSong = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(cleanName)}&entity=song&limit=1`
      );
      if (resSong.ok) {
        const dataSong = await resSong.json();
        if (dataSong?.results && dataSong.results.length > 0 && dataSong.results[0].artworkUrl100) {
          const highRes = dataSong.results[0].artworkUrl100.replace('100x100bb', '400x400bb');
          artistImageCache.set(cleanName, highRes);
          pendingFetches.delete(cleanName);
          return highRes;
        }
      }
    } catch (e) {
      console.warn(`[iTunes API] Error obteniendo portada para "${cleanName}":`, e);
    }

    artistImageCache.set(cleanName, null);
    pendingFetches.delete(cleanName);
    return null;
  })();

  pendingFetches.set(cleanName, promise);
  return promise;
};

/**
 * Recibe una lista de objetos artista (o strings) y los enriquece con la propiedad `img` desde iTunes si no la tienen.
 * @param {Array<Object|string>} artistList - Lista de artistas.
 * @returns {Promise<Array<Object>>} - Lista enriquecida con `img`.
 */
export const enrichArtistsWithITunesImages = async (artistList) => {
  if (!Array.isArray(artistList)) return [];

  const promises = artistList.map(async (item) => {
    const artistObj = typeof item === 'string' ? { name: item, id: item } : { ...item };
    if (!artistObj.img && artistObj.name) {
      const imgUrl = await fetchArtistImageFromITunes(artistObj.name);
      if (imgUrl) {
        artistObj.img = imgUrl;
      }
    }
    return artistObj;
  });

  return Promise.all(promises);
};
