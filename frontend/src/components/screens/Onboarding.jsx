import React from 'react';
import Button from '../common/Button';

const Onboarding = ({ onLogin }) => {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center w-full bg-surface">
      {/* Ambient Background Effects */}
      <div className="ambient-glow" />
      <div className="ambient-glow-bottom" />
      
      <main className="relative z-10 w-full max-w-[1024px] px-container-padding-mobile md:px-container-padding-desktop flex flex-col items-center justify-center text-center">
        {/* Logo Section */}
        <div className="mb-gutter md:mb-section-gap d-flex flex-column align-items-center animate-fade-in-up">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-circle bg-light d-flex align-items-center justify-content-center mb-3 shadow-sm border border-light-subtle">
            <span className="material-symbols-outlined text-primary opacity-80 text-[64px] md:text-[96px]" style={{ fontVariationSettings: "'FILL' 0" }}>
              headphones
            </span>
          </div>
          <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-primary tracking-tight">
            NeuroSound
          </h1>
        </div>

        {/* Value Proposition */}
        <div className="max-w-2xl mx-auto mb-section-gap animate-fade-in-up">
          <p className="font-headline-md text-headline-md text-on-surface-variant font-light">
            Tu sintonía personal para el bienestar emocional.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-sm flex flex-col gap-gutter animate-fade-in-up">
          {/* Primary Action */}
          <Button 
            variant="primary" 
            icon="play_circle" 
            onClick={() => onLogin('spotify')}
          >
            Iniciar Sesión con Spotify
          </Button>
          
          {/* Secondary Action */}
          <Button 
            variant="outline" 
            onClick={() => onLogin('guest')}
          >
            Entrar como Invitado
          </Button>
        </div>
      </main>

      <footer className="absolute bottom-8 left-0 w-full text-center z-10 opacity-60">
        <p className="font-label-sm text-label-sm text-on-surface-variant">
          Al continuar, aceptas nuestros términos de servicio.
        </p>
      </footer>
    </div>
  );
};

export default Onboarding;
