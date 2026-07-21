import { useState, useEffect } from 'react';
import { extractColorFromCover } from '../utils/colorExtractor.js';

/**
 * Hook para extraer los colores dominantes de la carátula activa
 * @param {string} coverUrl - URL de la carátula de la canción
 * @returns {Object|null} - Tokens de tema o null si no se ha podido extraer
 */
export const useCoverColor = (coverUrl) => {
  const [coverTheme, setCoverTheme] = useState(null);

  useEffect(() => {
    let active = true;
    if (!coverUrl) {
      Promise.resolve().then(() => {
        if (active) setCoverTheme(null);
      });
      return;
    }

    extractColorFromCover(coverUrl).then((tokens) => {
      if (active) {
        setCoverTheme(tokens);
      }
    });

    return () => {
      active = false;
    };
  }, [coverUrl]);

  return coverTheme;
};

export default useCoverColor;
