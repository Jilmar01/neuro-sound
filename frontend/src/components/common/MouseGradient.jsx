import React, { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Componente de cuadrícula de bolitas alineadas en Perspectiva 3D.
 * Configuración Suave y Ambiental (No distrae, movimiento fluido y sutil al ritmo de la música).
 *
 * @param {Object} props
 * @param {string} [props.colorRgb='43, 75, 113'] - Color RGB de los puntos.
 * @param {AnalyserNode|null} [props.analyserNode=null] - Nodo analizador Web Audio API.
 * @param {boolean} [props.isPlaying=false] - Indica si hay música en reproducción.
 */
export default function MouseGradient({
  colorRgb = '43, 75, 113',
  analyserNode = null,
  isPlaying = false
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const latestMouseRef = useRef({ x: -9999, y: -9999 });

  const handleMouseMove = useCallback((e) => {
    const el = containerRef.current?.parentElement || containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    latestMouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current?.parentElement || containerRef.current;
    if (!el) return;
    el.addEventListener('mousemove', handleMouseMove);
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  // Bucle de renderizado Canvas en 3D
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const updateCanvasSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    let bufferLength = 128;
    let dataArray = new Uint8Array(bufferLength);
    if (analyserNode) {
      bufferLength = analyserNode.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
    }

    let smoothBass = 0;
    let smoothMid = 0;
    let smoothTreble = 0;

    const render = () => {
      animRef.current = requestAnimationFrame(render);

      const width = canvas.width;
      const height = canvas.height;
      if (!width || !height) return;

      let targetBass = 0;
      let targetMid = 0;
      let targetTreble = 0;

      if (isPlaying) {
        if (analyserNode && dataArray) {
          analyserNode.getByteFrequencyData(dataArray);

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
          // Simulación armónica suave si no hay nodo analizador directo (Spotify / HTML5 stream)
          const time = Date.now() * 0.0015;
          targetBass = Math.sin(time * 1.5) * 0.2 + 0.35;
          targetMid = Math.cos(time * 1.2 + 1) * 0.2 + 0.3;
          targetTreble = Math.sin(time * 2.0 + 2) * 0.15 + 0.25;
        }
      } else {
        // En reposo, desciende suavemente a 0 para mantener la calma ambiental
        targetBass = 0;
        targetMid = 0;
        targetTreble = 0;
      }

      // Transición ultra-suave y orgánica (Lerp suave de 0.04)
      smoothBass += (targetBass - smoothBass) * 0.04;
      smoothMid += (targetMid - smoothMid) * 0.04;
      smoothTreble += (targetTreble - smoothTreble) * 0.04;

      ctx.clearRect(0, 0, width, height);

      // Proyección 3D ambiental de baja intensidad
      const fov = 750;
      const cameraZ = 450;
      const centerX = width / 2;
      const centerY = height * 0.5;

      // Inclinación 3D armónica
      const rotX = -45 * Math.PI / 180;
      const rotY = 6 * Math.PI / 180;

      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);

      const step = 40; // Espaciado elegante entre puntos
      const cols = Math.max(65, Math.ceil(width / 18));
      const rows = Math.max(60, Math.ceil(height / 18));
      const time = Date.now() * 0.0012; // Velocidad relajada y sin aceleraciones agresivas

      const mouseX = latestMouseRef.current.x;
      const mouseY = latestMouseRef.current.y;
      const maxMouseDist = 280;

      const pointsToRender = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const localX = (c - cols / 2) * step;
          const localY = (r - rows / 2) * step;

          // Movimiento de respiración suave (Ondulación sutil de max 22px en lugar de saltos bruscos)
          const yBounce = -Math.abs(Math.sin(r * 0.2 - time * 2.2)) * (smoothBass * 22 + smoothMid * 12);
          const zWave = Math.sin(c * 0.18 + r * 0.18 - time * 2.0) * (smoothBass * 14 + smoothMid * 8);
          const zJitter = Math.sin(c * 1.2 + r * 1.2 + time * 3) * (smoothTreble * 4);

          const curX = localX;
          const curY = localY + yBounce;
          const curZ = zWave + zJitter;

          // Rotación 3D en Y (Yaw)
          const x1 = curX * cosY - curZ * sinY;
          const z1 = curX * sinY + curZ * cosY;

          // Rotación 3D en X (Pitch)
          const y2 = curY * cosX - z1 * sinX;
          const z2 = curY * sinX + z1 * cosX;

          const pZ = z2 + cameraZ;
          if (pZ < 10) continue;

          const scale = fov / pZ;
          const screenX = centerX + x1 * scale;
          const screenY = centerY + y2 * scale;

          if (screenX < -80 || screenX > width + 80 || screenY < -80 || screenY > height + 80) {
            continue;
          }

          // Interacción suave con el ratón
          const distToMouse = Math.hypot(screenX - mouseX, screenY - mouseY);
          let mouseFactor = 0;
          if (distToMouse < maxMouseDist) {
            mouseFactor = Math.pow(1 - distToMouse / maxMouseDist, 1.8);
          }

          pointsToRender.push({
            screenX,
            screenY,
            zDepth: z2,
            scale,
            mouseFactor,
            c, r
          });
        }
      }

      // Ordenar por profundidad Z
      pointsToRender.sort((a, b) => b.zDepth - a.zDepth);

      // Renderizar los puntos con opacidad translúcida y suave
      pointsToRender.forEach((pt) => {
        const { screenX, screenY, scale, mouseFactor, c, r } = pt;

        // Tamaño pequeño y sutil
        let radius = (1.2 + smoothBass * 0.6 + Math.sin(time * 1.5 + c + r) * 0.3) * Math.min(1.5, Math.max(0.4, scale));
        // Opacidad ambiental baja (0.06 base) para no distorsionar ni distraer la vista
        let alpha = (0.06 + smoothBass * 0.08) * Math.min(1.3, Math.max(0.3, scale));

        if (mouseFactor > 0) {
          alpha = Math.min(0.6, alpha + mouseFactor * 0.45);
          radius += mouseFactor * 1.5;
        }

        ctx.beginPath();
        ctx.arc(screenX, screenY, Math.max(0.6, radius), 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(${colorRgb}, ${alpha})`;
        ctx.fill();
      });
    };

    render();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [colorRgb, analyserNode, isPlaying]);

  return (
    <div
      ref={containerRef}
      className="mouse-gradient"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
    </div>
  );
}
