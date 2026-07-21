import React, { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Componente de cuadrícula de bolitas alineadas en Perspectiva 3D.
 * Cobertura 100% total de la pantalla (sin bordes ni partes blancas).
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
          // Simulación armónica si no hay nodo analizador directo (Spotify / HTML5 stream)
          const time = Date.now() * 0.003;
          targetBass = Math.sin(time * 2.2) * 0.35 + 0.5;
          targetMid = Math.cos(time * 1.8 + 1) * 0.3 + 0.45;
          targetTreble = Math.sin(time * 3.2 + 2) * 0.25 + 0.4;
        }
      } else {
        // En reposo, desciende a 0 para que la cuadrícula 3D vuelva a estar plana
        targetBass = 0;
        targetMid = 0;
        targetTreble = 0;
      }

      // Transición suave (Lerp)
      smoothBass += (targetBass - smoothBass) * 0.12;
      smoothMid += (targetMid - smoothMid) * 0.12;
      smoothTreble += (targetTreble - smoothTreble) * 0.12;

      ctx.clearRect(0, 0, width, height);

      // Proyección 3D de alta densidad que cubre el 100% de la pantalla
      const fov = 750;
      const cameraZ = 450;
      const centerX = width / 2;
      const centerY = height * 0.5;

      // Inclinación suave en 3D
      const rotX = -48 * Math.PI / 180;
      const rotY = 8 * Math.PI / 180;

      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);

      // Dimensiones ampliadas de la matriz para garantizar cobertura completa en todas las esquinas
      const step = 38;
      const cols = Math.max(70, Math.ceil(width / 16));
      const rows = Math.max(65, Math.ceil(height / 16));
      const time = Date.now() * 0.002;

      const mouseX = latestMouseRef.current.x;
      const mouseY = latestMouseRef.current.y;
      const maxMouseDist = 320;

      const pointsToRender = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const localX = (c - cols / 2) * step;
          const localY = (r - rows / 2) * step;

          // Salto hacia arriba (+Y) impulsado por el audio
          const yBounce = -Math.abs(Math.sin(r * 0.28 - time * 3.8)) * (smoothBass * 140 + smoothMid * 70) - (smoothBass * 25);
          const zWave = Math.sin(c * 0.25 + r * 0.25 - time * 3) * (smoothBass * 45 + smoothMid * 25);
          const zJitter = Math.sin(c * 1.5 + r * 1.5 + time * 5) * (smoothTreble * 20);

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

          // Margen de tolerancia para incluir puntos que cubran las esquinas extremas de la pantalla
          if (screenX < -100 || screenX > width + 100 || screenY < -100 || screenY > height + 100) {
            continue;
          }

          // Interacción con el ratón
          const distToMouse = Math.hypot(screenX - mouseX, screenY - mouseY);
          let mouseFactor = 0;
          if (distToMouse < maxMouseDist) {
            mouseFactor = Math.pow(1 - distToMouse / maxMouseDist, 1.6);
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

      // Ordenar por Z-Depth de atrás hacia adelante
      pointsToRender.sort((a, b) => b.zDepth - a.zDepth);

      // Renderizar las bolitas proyectadas
      pointsToRender.forEach((pt) => {
        const { screenX, screenY, scale, mouseFactor, c, r } = pt;

        let radius = (1.5 + smoothBass * 2.2 + Math.sin(time * 2 + c + r) * 0.4) * Math.min(1.8, Math.max(0.4, scale));
        let alpha = (0.14 + smoothBass * 0.22) * Math.min(1.4, Math.max(0.35, scale));

        if (mouseFactor > 0) {
          alpha = Math.min(0.9, alpha + mouseFactor * 0.7);
          radius += mouseFactor * 2.5;
        }

        ctx.beginPath();
        ctx.arc(screenX, screenY, Math.max(0.7, radius), 0, 2 * Math.PI);
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
