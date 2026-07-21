import React, { useEffect, useRef } from 'react';

/**
 * Componente de fondo con esferas/orbes circulares ("bolitas") reactivas al audio en tiempo real.
 * Renderiza orbes en un Canvas HTML5 que reaccionan a graves, medios y agudos de la música.
 *
 * @param {Object} props
 * @param {AnalyserNode|null} props.analyserNode - Nodo de análisis Web Audio.
 * @param {boolean} props.isPlaying - Indica si la música está sonando.
 * @param {string} [props.colorRgb='13, 110, 253'] - Color RGB primario extraído de la portada.
 */
const BackgroundOrbs = ({ analyserNode = null, isPlaying = false, colorRgb = '13, 110, 253' }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Definición de las bolitas del fondo (Orbes ambientales flotantes)
    const numOrbs = 8;
    const orbs = [
      // Orbe gigante superior izquierdo (Graves)
      { xRatio: 0.15, yRatio: 0.2, baseRadius: 220, freqBand: 'bass', vx: 0.2, vy: 0.15, phase: 0 },
      // Orbe gigante inferior derecho (Medios)
      { xRatio: 0.85, yRatio: 0.8, baseRadius: 190, freqBand: 'mid', vx: -0.25, vy: -0.2, phase: Math.PI / 2 },
      // Orbes intermedios distribuidos (Graves, Medios, Agudos)
      { xRatio: 0.7, yRatio: 0.25, baseRadius: 110, freqBand: 'treble', vx: 0.35, vy: -0.2, phase: Math.PI },
      { xRatio: 0.3, yRatio: 0.75, baseRadius: 130, freqBand: 'bass', vx: -0.3, vy: 0.25, phase: Math.PI * 1.5 },
      { xRatio: 0.5, yRatio: 0.45, baseRadius: 90, freqBand: 'mid', vx: 0.4, vy: 0.3, phase: 0.5 },
      { xRatio: 0.1, yRatio: 0.85, baseRadius: 85, freqBand: 'treble', vx: 0.25, vy: -0.35, phase: 2.2 },
      { xRatio: 0.9, yRatio: 0.15, baseRadius: 75, freqBand: 'bass', vx: -0.4, vy: 0.2, phase: 4.1 },
      { xRatio: 0.4, yRatio: 0.1, baseRadius: 65, freqBand: 'mid', vx: 0.18, vy: -0.15, phase: 1.8 }
    ];

    let bufferLength = 128;
    let dataArray = new Uint8Array(bufferLength);
    if (analyserNode) {
      bufferLength = analyserNode.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
    }

    // Energías filtradas para suavizar las transiciones
    let smoothBass = 0;
    let smoothMid = 0;
    let smoothTreble = 0;

    const render = () => {
      animRef.current = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;

      let targetBass = 0;
      let targetMid = 0;
      let targetTreble = 0;

      if (isPlaying) {
        if (analyserNode && dataArray) {
          analyserNode.getByteFrequencyData(dataArray);
          
          // Dividir la banda de frecuencias
          const bassBins = Math.floor(bufferLength * 0.15);
          const midBins = Math.floor(bufferLength * 0.5);

          let bSum = 0, mSum = 0, tSum = 0;
          for (let i = 0; i < bufferLength; i++) {
            const val = dataArray[i];
            if (i < bassBins) bSum += val;
            else if (i < midBins) mSum += val;
            else tSum += val;
          }

          targetBass = bSum / (bassBins * 255);
          targetMid = mSum / ((midBins - bassBins) * 255);
          targetTreble = tSum / ((bufferLength - midBins) * 255);
        } else {
          // Simulación armónica si no hay nodo analyser directo (ej. Spotify / HTML audio)
          const time = Date.now() * 0.0025;
          targetBass = Math.sin(time * 2) * 0.25 + 0.45;
          targetMid = Math.cos(time * 1.7 + 1) * 0.25 + 0.4;
          targetTreble = Math.sin(time * 3 + 2) * 0.2 + 0.35;
        }
      } else {
        // En pausa, decae suavemente hacia reposo
        targetBass = 0.05;
        targetMid = 0.05;
        targetTreble = 0.05;
      }

      // Interpolación exponencial (Lerp) para movimiento fluido sin tirones
      smoothBass += (targetBass - smoothBass) * 0.12;
      smoothMid += (targetMid - smoothMid) * 0.12;
      smoothTreble += (targetTreble - smoothTreble) * 0.12;

      ctx.clearRect(0, 0, width, height);

      const time = Date.now() * 0.001;

      // Dibujar cada bolita reactiva
      orbs.forEach((orb) => {
        // Asignar energía según la banda configurada
        let energy = smoothMid;
        if (orb.freqBand === 'bass') energy = smoothBass;
        if (orb.freqBand === 'treble') energy = smoothTreble;

        // Actualizar posición flotante
        orb.xRatio += (orb.vx * 0.0004) + Math.cos(time + orb.phase) * 0.0003 * (1 + energy * 2);
        orb.yRatio += (orb.vy * 0.0004) + Math.sin(time * 0.8 + orb.phase) * 0.0003 * (1 + energy * 2);

        // Rebotar suavemente en los bordes del canvas
        if (orb.xRatio < -0.1) orb.xRatio = 1.1;
        if (orb.xRatio > 1.1) orb.xRatio = -0.1;
        if (orb.yRatio < -0.1) orb.yRatio = 1.1;
        if (orb.yRatio > 1.1) orb.yRatio = -0.1;

        const posX = orb.xRatio * width;
        const posY = orb.yRatio * height;

        // Calcular radio pulsante dinámico con la música
        const pulseFactor = 1 + energy * 0.55 + Math.sin(time * 1.5 + orb.phase) * 0.08;
        const currentRadius = orb.baseRadius * pulseFactor;

        // Opacidad reactiva (más brillante con picos de música)
        const alpha = Math.min(0.35, 0.12 + energy * 0.28);

        // Gradiente radial para un look brillante y difuminado ("ambient orb")
        const gradient = ctx.createRadialGradient(
          posX, posY, 0,
          posX, posY, currentRadius
        );
        gradient.addColorStop(0, `rgba(${colorRgb}, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(${colorRgb}, ${alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(${colorRgb}, 0)`);

        ctx.beginPath();
        ctx.arc(posX, posY, currentRadius, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();
      });
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [analyserNode, isPlaying, colorRgb]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        filter: 'blur(30px)', // Aporta suavidad y profundidad atmosférica
        opacity: 0.85
      }}
    />
  );
};

export default React.memo(BackgroundOrbs);
