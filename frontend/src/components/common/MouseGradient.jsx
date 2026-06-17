import { useState, useCallback, useRef, useEffect } from 'react';

export default function MouseGradient({ colorRgb = '43, 75, 113' }) {
  const [pos, setPos] = useState({ x: -9999, y: -9999 });
  const rafRef = useRef(null);
  const latestRef = useRef({ x: -9999, y: -9999 });
  const containerRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const el = containerRef.current?.parentElement;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    latestRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      setPos(latestRef.current);
      rafRef.current = null;
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current?.parentElement;
    if (!el) return;
    el.addEventListener('mousemove', handleMouseMove);
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove]);

  return (
    <div
      ref={containerRef}
      className="mouse-gradient"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        // Patrón de puntos usando radial-gradient
        backgroundImage: `radial-gradient(rgba(${colorRgb}, 0.4) 1.5px, transparent 1.5px)`,
        backgroundSize: '24px 24px', // Separación entre puntos
        // Máscara radial que revela los puntos solo cerca del ratón
        WebkitMaskImage: `radial-gradient(circle 350px at ${pos.x}px ${pos.y}px, black 10%, transparent 100%)`,
        maskImage: `radial-gradient(circle 350px at ${pos.x}px ${pos.y}px, black 10%, transparent 100%)`
      }}
    />
  );
}
