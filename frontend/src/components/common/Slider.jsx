import React from 'react';

/**
 * Slider reutilizable con modo rango o Likert.
 * @param {Object} props - Propiedades del componente.
 * @param {number} props.value - Valor actual.
 * @param {(value: number) => void} props.onChange - Callback al cambiar valor.
 * @param {number} [props.min] - Valor minimo (modo rango).
 * @param {number} [props.max] - Valor maximo (modo rango).
 * @param {"range"|"likert"} [props.mode] - Modo del slider.
 * @param {Array} [props.nodes] - Nodos Likert con value/icon.
 * @param {string} [props.ariaLabel] - Etiqueta ARIA.
 * @returns {JSX.Element}
 */
const Slider = ({
  value,
  onChange,
  min = 0,
  max = 100,
  mode = 'range',
  nodes = [],
  ariaLabel = 'Slider',
}) => {
  if (mode === 'likert') {
    // Modo Likert: puntos discretos con iconos.
    // Calcula el porcentaje del track lleno.
    // El valor va de 1 a nodes.length.
    const percentage = ((value - 1) / (nodes.length - 1)) * 100;

    return (
      <div className="relative w-full h-16 flex items-center">
        {/* Fondo de pista */}
        <div className="absolute w-full h-2 bg-surface-container-high rounded-full top-1/2 -translate-y-1/2 z-0" />

        {/* Relleno de pista */}
        <div
          className="absolute h-2 bg-primary-container rounded-full top-1/2 -translate-y-1/2 scale-track-fill z-0"
          style={{ width: `${percentage}%` }}
        />

        {/* Nodos */}
        <div className="relative w-full flex justify-between items-center z-10 px-2">
          {nodes.map((node) => {
            const isActive = value === node.value;
            return (
              <button
                key={node.value}
                type="button"
                onClick={() => onChange(node.value)}
                className={`scale-node w-12 h-12 rounded-circle border-0 d-flex align-items-center justify-content-center cursor-pointer transition-all duration-300 focus:outline-none ${isActive
                    ? 'active bg-primary text-white shadow'
                    : 'bg-light text-secondary hover-bg-secondary hover-text-white'
                  }`}
                data-value={node.value}
                aria-label={`Nivel ${node.value}`}
              >
                <span
                  className={`material-symbols-outlined notranslate text-2xl ${isActive ? 'filled' : ''}`}
                  translate="no"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {node.icon}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Modo rango (slider estandar de audio)
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="slider-wrapper w-full">
      <input
        aria-label={ariaLabel}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-8 cursor-pointer"
      />
      <div
        className="slider-fill"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default Slider;
