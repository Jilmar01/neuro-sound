import React, { useState } from 'react';
import Button from '../common/Button';
import MetricBar from '../common/MetricBar';

const FinalSurvey = ({ 
  initialStress = 8, 
  onAction,
  onNavigate 
}) => {
  const [postStress, setPostStress] = useState(4); // 1 = Tenso, 5 = Relajado



  // Math Inversion: postStress scale is 1 (Tenso) to 5 (Relajado)
  // Stress level = 6 - postStress. On 10-scale: (6 - postStress) * 2
  const finalStressLevel = (6 - postStress) * 2;
  const calculatedReduction = Math.round(((initialStress - finalStressLevel) / initialStress) * 100);

  return (
    <div className="w-100 py-3 d-flex flex-column align-items-center justify-content-center">
      <main className="relative z-10 w-full max-w-[500px] flex flex-col gap-4 px-3 animate-fade-in-up">
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-surface tracking-tight font-semibold">
            ¿Cómo te sientes ahora?
          </h1>
          <p className="text-sm text-on-surface-variant">
            Evalúa tu estado tras la sintonía.
          </p>
        </header>

        {/* Likert Scale Card */}
        <section className="flex flex-col gap-6 w-full bg-surface-container-lowest p-6 rounded-xl shadow-[0_16px_32px_-12px_rgba(0,0,0,0.01)] border border-surface-container-low">
          <div className="flex justify-between items-center px-1 text-on-surface-variant">
            <span className="material-symbols-outlined text-2xl">sentiment_dissatisfied</span>
            <span className="material-symbols-outlined text-2xl">sentiment_satisfied</span>
          </div>

          <div className="relative w-full h-12 flex items-center">
            {/* Track background */}
            <div className="absolute w-full h-1.5 bg-surface-container rounded-full top-1/2 -translate-y-1/2 z-0" />
            
            {/* Track Fill */}
            <div 
              className="absolute h-1.5 bg-primary rounded-full top-1/2 -translate-y-1/2 scale-track-fill z-0"
              style={{ width: `${((postStress - 1) / 4) * 100}%` }}
            />

            {/* Nodes */}
            <div className="relative z-10 w-full flex justify-between">
              {[1, 2, 3, 4, 5].map((lvl) => {
                const isActive = postStress === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setPostStress(lvl)}
                    className={`w-10 h-10 rounded-circle border-0 transition-all duration-300 d-flex align-items-center justify-center focus:outline-none ${
                      isActive 
                        ? 'bg-primary text-white shadow scale-105' 
                        : 'bg-light text-secondary hover-bg-secondary hover-text-white'
                    }`}
                    aria-label={`Nivel ${lvl}`}
                  >
                    {isActive && (
                      <span className="material-symbols-outlined icon-fill text-xs">circle</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="flex justify-between text-on-surface-variant font-label-sm text-[11px] px-1">
            <span>Tenso</span>
            <span>Relajado</span>
          </div>
        </section>

        {/* Results Card */}
        <section className="flex flex-col gap-5 w-full bg-surface-container-low p-6 rounded-xl relative overflow-hidden animate-glow border border-surface-container">
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary-container rounded-full blur-2xl opacity-30 mix-blend-multiply" />
          
          <div className="relative z-10 text-center">
            <h2 className="font-headline-md text-headline-md text-primary font-semibold">
              {calculatedReduction > 0 
                ? `Tu estrés bajó un ${calculatedReduction}%` 
                : 'Mantienes tu nivel de relajación'}
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">
              Excelente progreso en esta sesión.
            </p>
          </div>

          <div className="relative z-10 flex flex-col gap-4 w-full mt-2">
            {/* Bar Before */}
            <MetricBar
              label="Antes"
              valueText={`Nivel ${initialStress}`}
              percentage={initialStress * 10}
              variant="gray"
            />
            {/* Bar After */}
            <MetricBar
              label="Ahora"
              valueText={`Nivel ${finalStressLevel}`}
              percentage={finalStressLevel * 10}
              variant="accent"
              animate={true}
            />
          </div>
        </section>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 w-full mt-2">
          <Button
            variant="secondary"
            icon="check_circle"
            onClick={() => onAction('finish')}
            className="w-full uppercase tracking-widest py-3"
          >
            Finalizar Sesión
          </Button>

          <Button
            variant="outline"
            onClick={() => onAction('new')}
            className="w-full uppercase tracking-widest py-3"
          >
            Nueva Sintonía
          </Button>
        </div>
      </main>
    </div>
  );
};

export default FinalSurvey;
