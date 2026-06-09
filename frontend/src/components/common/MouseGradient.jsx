import { useState, useCallback, useRef, useEffect } from 'react';

function getThemeRgb() {
  try {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--bs-primary-rgb')
      .trim() || '108, 117, 125';
  } catch (_) {
    return '108, 117, 125';
  }
}

export default function MouseGradient() {
  const [pos, setPos] = useState({ x: -9999, y: -9999 });
  const [rgb, setRgb] = useState(() => getThemeRgb());
  const rafRef = useRef(null);
  const latestRef = useRef({ x: -9999, y: -9999 });
  const containerRef = useRef(null);

  useEffect(() => {
    setRgb(getThemeRgb());
    const obs = new MutationObserver(() => setRgb(getThemeRgb()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    return () => obs.disconnect();
  }, []);

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
        background: `
          radial-gradient(900px at ${pos.x}px ${pos.y}px, rgba(${rgb}, 0.15) 0%, transparent 60%),
          radial-gradient(600px at ${pos.x * 0.7}px ${pos.y * 0.7}px, rgba(${rgb}, 0.08) 0%, transparent 50%)
        `,
      }}
    />
  );
}
