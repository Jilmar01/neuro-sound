/**
 * Módulo para extracción de color dominante desde carátulas de álbumes (HTML5 Canvas)
 */

const colorCache = new Map();

/**
 * Convierte RGB a HSL
 */
export const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

/**
 * Convierte HSL a RGB string "r, g, b"
 */
export const hslToRgbString = (h, s, l) => {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return `${Math.round(255 * f(0))}, ${Math.round(255 * f(8))}, ${Math.round(255 * f(4))}`;
};

/**
 * Extrae los colores dominantes de una URL de imagen usando un Canvas oculto.
 * @param {string} imageUrl - URL de la carátula
 * @returns {Promise<Object|null>} - Tokens del tema extraído
 */
export const extractColorFromCover = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return Promise.resolve(null);
  const cleanUrl = imageUrl.trim();
  if (!cleanUrl) return Promise.resolve(null);

  if (colorCache.has(cleanUrl)) {
    return Promise.resolve(colorCache.get(cleanUrl));
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    const timer = setTimeout(() => {
      resolve(null);
    }, 3000);

    img.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        canvas.width = 40;
        canvas.height = 40;
        ctx.drawImage(img, 0, 0, 40, 40);

        const imageData = ctx.getImageData(0, 0, 40, 40);
        const data = imageData.data;

        let totalR = 0;
        let totalG = 0;
        let totalB = 0;
        let count = 0;

        let maxSat = -1;
        let dominantHsl = null;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a < 128) continue; // Ignorar transparente

          const hsl = rgbToHsl(r, g, b);

          // Ignorar píxeles casi negros (l < 10) o casi blancos (l > 92) para evitar tono neutro estéril
          if (hsl.l < 10 || hsl.l > 92) continue;

          totalR += r;
          totalG += g;
          totalB += b;
          count++;

          if (hsl.s > maxSat && hsl.l >= 20 && hsl.l <= 80) {
            maxSat = hsl.s;
            dominantHsl = hsl;
          }
        }

        let targetHsl = dominantHsl;
        if (!targetHsl && count > 0) {
          const avgR = Math.round(totalR / count);
          const avgG = Math.round(totalG / count);
          const avgB = Math.round(totalB / count);
          targetHsl = rgbToHsl(avgR, avgG, avgB);
        }

        if (!targetHsl) {
          resolve(null);
          return;
        }

        const hue = targetHsl.h;
        const saturation = Math.max(targetHsl.s, 45);
        const lightness = Math.min(Math.max(targetHsl.l, 35), 55);

        const primaryRgb = hslToRgbString(hue, saturation, lightness);
        const themeTokens = {
          primary: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
          primaryRgb: primaryRgb,
          bgSubtle: `hsl(${hue}, ${Math.round(saturation * 0.4)}%, 96%)`,
          borderSubtle: `hsl(${hue}, ${Math.round(saturation * 0.5)}%, 86%)`,
          glow1: `hsla(${hue}, ${saturation}%, ${lightness}%, 0.35)`,
          glow2: `hsla(${hue}, ${saturation}%, ${lightness}%, 0.15)`,
          hue,
          saturation,
          lightness,
        };

        colorCache.set(cleanUrl, themeTokens);
        resolve(themeTokens);
      } catch (err) {
        console.warn('[colorExtractor] Lectura de carátula limitada por origen/CORS:', err.message);
        resolve(null);
      }
    };

    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };

    img.src = cleanUrl;
  });
};
