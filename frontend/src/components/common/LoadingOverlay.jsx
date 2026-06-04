import React, { useEffect, useState } from 'react';

/**
 * Overlay de carga con animacion y mensaje.
 * @param {Object} props - Propiedades del componente.
 * @param {boolean} props.isLoading - Controla si se muestra.
 * @param {string} [props.message] - Texto a mostrar.
 * @returns {JSX.Element|null}
 */
const LoadingOverlay = ({
  isLoading,
  message = "Afinando las frecuencias para ti..."
}) => {
  const [shouldRender, setShouldRender] = useState(isLoading);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setShouldRender(true);
      // Espera al siguiente tick para animar la opacidad.
      setTimeout(() => setOpacity(100), 50);
    } else {
      setOpacity(0);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 1000); // coincide con la duracion de la transicion
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-surface/95 backdrop-blur-2xl transition-opacity duration-1000`}
      style={{ opacity: opacity / 100 }}
    >
      <div className="w-16 h-16 rounded-full border-2 border-primary-container border-t-primary animate-spin mb-8" />
      <p className="font-body-lg text-body-lg text-on-surface-variant animate-pulse">
        {message}
      </p>
    </div>
  );
};

export default LoadingOverlay;
