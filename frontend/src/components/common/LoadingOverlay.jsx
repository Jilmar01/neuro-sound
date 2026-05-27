import React, { useEffect, useState } from 'react';

const LoadingOverlay = ({ 
  isLoading, 
  message = "Afinando las frecuencias para ti..." 
}) => {
  const [shouldRender, setShouldRender] = useState(isLoading);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setShouldRender(true);
      // Wait for next tick to animate opacity
      setTimeout(() => setOpacity(100), 50);
    } else {
      setOpacity(0);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 1000); // match transition duration
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
