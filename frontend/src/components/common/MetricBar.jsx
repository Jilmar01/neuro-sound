import React from 'react';

const MetricBar = ({
  label,
  valueText,
  percentage,
  variant = 'primary',
  animate = false,
}) => {
  const barColors = {
    primary: 'bg-primary-container',
    secondary: 'bg-secondary-fixed',
    tertiary: 'bg-tertiary-container',
    accent: 'bg-primary',
    gray: 'bg-outline-variant opacity-60',
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
        <span>{label}</span>
        <span>{valueText}</span>
      </div>
      <div className="w-full h-3 bg-light rounded-pill overflow-hidden border border-light-subtle">
        <div 
          className={`h-full rounded-pill ${barColors[variant]} ${animate ? 'bar-animate' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default MetricBar;
