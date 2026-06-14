import { useState } from 'react';
import Button from '../common/Button';

const ratings = [
  { val: 1, icon: 'sentiment_very_dissatisfied', label: 'NADA' },
  { val: 2, icon: 'sentiment_dissatisfied', label: 'POCO' },
  { val: 3, icon: 'sentiment_neutral', label: 'REGULAR' },
  { val: 4, icon: 'sentiment_satisfied', label: 'BIEN' },
  { val: 5, icon: 'sentiment_very_satisfied', label: 'PERFECTO' },
];

const FinalSurvey = ({ initialStress = 8, onAction, onNavigate }) => {
  const [q1, setQ1] = useState(3);
  const [q2, setQ2] = useState(3);
  const [q3, setQ3] = useState(null);

  const satisfaction = ((q1 + q2 + (q3 === 'si' ? 5 : q3 === 'no' ? 1 : 0)) / 11 * 100).toFixed(0);

  const renderRating = (value, setter) => (
    <div className="w-100 d-flex justify-content-between my-1">
      {ratings.map((item) => {
        const isActive = value === item.val;
        return (
          <div key={item.val} className="d-flex flex-column align-items-center gap-1" style={{ width: '60px' }}>
            <button type="button" onClick={() => setter(item.val)}
              className={`border-0 d-flex align-items-center justify-content-center rounded-3 transition-all duration-300 focus:outline-none ${isActive ? 'bg-primary bg-opacity-10 border-primary' : 'bg-body-tertiary border-light-subtle'}`}
              style={{
                width: '48px', height: '48px',
                border: isActive ? '2px solid' : '2px solid',
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                cursor: 'pointer',
              }}>
              <span className={`material-symbols-outlined notranslate ${isActive ? 'text-primary' : 'text-secondary'}`}
                style={{ fontSize: '22px', fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
            </button>
            <span className={`text-uppercase fw-bold ${isActive ? 'text-primary' : 'text-secondary'}`}
              style={{ fontSize: '8px', letterSpacing: '0.5px', marginTop: '4px' }}>
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="w-100 py-4 d-flex flex-column align-items-center justify-content-center">
      <main className="w-100 d-flex flex-column align-items-center animate-fade-in-up" style={{ maxWidth: '500px' }}>
        <header className="text-center mb-1">
          <span className="material-symbols-outlined notranslate text-primary" translate="no" style={{ fontSize: '40px' }}>
            rate_review
          </span>
          <h1 className="h5 text-primary fw-bold mb-1">Evaluacion de Sesion</h1>
          <p className="text-secondary small mb-0">
            Cuentanos como fue tu experiencia con esta sintonia terapeutica
          </p>
        </header>

        <div className="w-100 d-flex flex-column gap-3 mt-2">
          <section className="glass-panel p-4 rounded-4 border border-light-subtle shadow-sm">
            <h2 className="text-primary fw-bold mb-3" style={{ fontSize: '14px', lineHeight: '1.4' }}>
              1. Que tan bien entendio el sistema tu estado emocional?
            </h2>
            {renderRating(q1, setQ1)}
          </section>

          <section className="glass-panel p-4 rounded-4 border border-light-subtle shadow-sm">
            <h2 className="text-primary fw-bold mb-3" style={{ fontSize: '14px', lineHeight: '1.4' }}>
              2. Que tanto reflejo la musica tu emocion?
            </h2>
            {renderRating(q2, setQ2)}
          </section>

          <section className="glass-panel p-4 rounded-4 border border-light-subtle shadow-sm">
            <h2 className="text-primary fw-bold mb-3" style={{ fontSize: '14px', lineHeight: '1.4' }}>
              3. Pudiste mantener o cambiar tu estado emocional como deseabas?
            </h2>
            <div className="d-flex flex-column gap-2">
              {[
                { id: 'no', icon: 'cancel', label: 'No logre mi objetivo' },
                { id: 'si', icon: 'check_circle', label: 'Si logre mi objetivo' }
              ].map((option) => {
                const isSelected = q3 === option.id;
                return (
                  <button key={option.id} type="button" onClick={() => setQ3(option.id)}
                    className={`w-100 d-flex align-items-center gap-3 p-3 rounded-3 border text-start fw-medium transition-all duration-200 ${isSelected ? 'bg-primary bg-opacity-10 border-primary' : 'bg-body-tertiary border-light-subtle'}`}
                    style={{ fontSize: '13.5px', cursor: 'pointer' }}>
                    <span className="material-symbols-outlined notranslate"
                      style={{ fontSize: '20px', color: isSelected ? 'var(--bs-primary)' : 'var(--bs-secondary)' }}>
                      {option.icon}
                    </span>
                    <span className={isSelected ? 'text-primary' : 'text-body'}>
                      {option.label}
                    </span>
                    {isSelected && (
                      <span className="ms-auto material-symbols-outlined notranslate fill text-primary" translate="no"
                        style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="d-flex flex-column gap-2 w-100 mt-3">
          <Button
            variant="primary"
            icon="check_circle"
            onClick={() => onAction('finish')}
            className="w-100 py-3 rounded-pill fw-semibold shadow-sm"
            disabled={q3 === null}>
            Finalizar Sesion
          </Button>
          <Button
            variant="outline"
            onClick={() => onAction('new')}
            className="w-100 py-3 rounded-pill fw-semibold">
            Nueva Sintonia
          </Button>
        </div>
      </main>
    </div>
  );
};

export default FinalSurvey;