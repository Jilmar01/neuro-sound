import React from 'react';

const Button = ({
  children,
  onClick,
  variant = 'primary',
  icon,
  className = '',
  type = 'button',
  disabled = false,
  ...props
}) => {
  const baseStyles = 'group relative d-flex align-items-center justify-content-center gap-3 py-4 px-8 rounded-pill font-label-sm text-label-sm transition-all duration-300 active:scale-[0.98] outline-none disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-on-surface text-surface hover:scale-[1.02] shadow-[0_16px_32px_-12px_rgba(0,0,0,0.1)] hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.15)]',
    secondary: 'bg-primary text-on-primary hover:opacity-90 hover:shadow-[0_8px_24px_rgba(82,96,105,0.25)] hover:scale-[1.02]',
    container: 'bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed hover:shadow-[0_12px_32px_rgba(212,230,229,0.4)] hover:scale-[1.02]',
    outline: 'text-primary border border-outline-variant hover:bg-surface-variant/50 hover:border-primary',
    text: 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && (
        <span 
          className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110" 
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      )}
      <span>{children}</span>
      {variant === 'primary' && (
        <div className="absolute inset-0 rounded-pill border border-surface/10 group-hover:border-surface/30 transition-colors duration-300" />
      )}
    </button>
  );
};

export default Button;
