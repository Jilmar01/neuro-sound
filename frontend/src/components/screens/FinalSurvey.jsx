import { useState } from 'react';
import Button from '../common/Button';

const FinalSurvey = ({
  initialStress = 8,
  onAction,
  onNavigate
}) => {
  const [q1, setQ1] = useState(3);
  const [q2, setQ2] = useState(3);
  const [q3, setQ3] = useState(null); // 'no' | 'si'

  return (
    <div className="w-100 py-3 d-flex flex-column align-items-center justify-content-center">
      <main className="position-relative z-3 w-100 d-flex flex-column gap-3 px-3 animate-fade-in-up" style={{ maxWidth: '550px' }}>
        {/* Header */}
        <header className="text-center mb-1">
          <h1 className="h5 text-dark fw-bold mb-1">
            Evaluación de Sesión
          </h1>
          <p className="text-muted small mb-0">
            Cuéntanos cómo fue tu experiencia con esta sintonía terapéutica.
          </p>
        </header>

        {/* Pregunta 1 */}
        <section className="d-flex flex-column gap-3 w-100 bg-white bg-opacity-75 backdrop-blur-sm p-4 rounded-4 border border-light-subtle shadow-sm">
          <h2 className="text-dark fw-bold mb-1" style={{ fontSize: '14.5px', lineHeight: '1.4' }}>
            1. ¿Qué tan bien entendió el sistema tu estado emocional?
          </h2>
          
          <div className="w-100 d-flex justify-content-between my-2">
            {[
              { val: 1, label: 'NADA' },
              { val: 2, label: 'POCO' },
              { val: 3, label: 'REGULAR' },
              { val: 4, label: 'BIEN' },
              { val: 5, label: 'PERFECTO' }
            ].map((item) => {
              const isActive = q1 === item.val;
              return (
                <div key={item.val} className="d-flex flex-column align-items-center gap-1" style={{ width: '64px' }}>
                  <button
                    type="button"
                    onClick={() => setQ1(item.val)}
                    className={`rounded-circle border transition-all duration-300 d-flex align-items-center justify-content-center focus:outline-none fw-bold ${
                      isActive 
                        ? 'bg-primary text-white border-0 shadow' 
                        : 'bg-white text-secondary border-secondary border-opacity-25 hover:bg-light'
                    }`}
                    style={{ 
                      width: '42px', 
                      height: '42px', 
                      fontSize: '14px',
                      transform: isActive ? 'scale(1.12)' : 'scale(1)'
                    }}
                  >
                    {item.val}
                  </button>
                  <span className="text-muted text-uppercase" style={{ fontSize: '8px', fontWeight: '700', letterSpacing: '0.3px', marginTop: '4px' }}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Pregunta 2 */}
        <section className="d-flex flex-column gap-3 w-100 bg-white bg-opacity-75 backdrop-blur-sm p-4 rounded-4 border border-light-subtle shadow-sm">
          <h2 className="text-dark fw-bold mb-1" style={{ fontSize: '14.5px', lineHeight: '1.4' }}>
            2. ¿Qué tanto reflejó la música tu emoción?
          </h2>
          
          <div className="w-100 d-flex justify-content-between my-2">
            {[
              { val: 1, label: 'NADA' },
              { val: 2, label: 'POCO' },
              { val: 3, label: 'REGULAR' },
              { val: 4, label: 'BIEN' },
              { val: 5, label: 'PERFECTO' }
            ].map((item) => {
              const isActive = q2 === item.val;
              return (
                <div key={item.val} className="d-flex flex-column align-items-center gap-1" style={{ width: '64px' }}>
                  <button
                    type="button"
                    onClick={() => setQ2(item.val)}
                    className={`rounded-circle border transition-all duration-300 d-flex align-items-center justify-content-center focus:outline-none fw-bold ${
                      isActive 
                        ? 'bg-primary text-white border-0 shadow' 
                        : 'bg-white text-secondary border-secondary border-opacity-25 hover:bg-light'
                    }`}
                    style={{ 
                      width: '42px', 
                      height: '42px', 
                      fontSize: '14px',
                      transform: isActive ? 'scale(1.12)' : 'scale(1)'
                    }}
                  >
                    {item.val}
                  </button>
                  <span className="text-muted text-uppercase" style={{ fontSize: '8px', fontWeight: '700', letterSpacing: '0.3px', marginTop: '4px' }}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Pregunta 3 */}
        <section className="d-flex flex-column gap-3 w-100 bg-white bg-opacity-75 backdrop-blur-sm p-4 rounded-4 border border-light-subtle shadow-sm">
          <h2 className="text-dark fw-bold mb-1" style={{ fontSize: '14.5px', lineHeight: '1.4' }}>
            3. ¿Pudiste mantener o cambiar tu estado emocional como deseabas?
          </h2>
          
          <div className="d-flex flex-column gap-2">
            {[
              { id: 'no', label: 'No logré mi objetivo' },
              { id: 'si', label: 'Sí logré mi objetivo' }
            ].map((option) => {
              const isSelected = q3 === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setQ3(option.id)}
                  className={`w-100 d-flex align-items-center gap-3 p-3 rounded-3 border text-start transition-all duration-200 ${
                    isSelected
                      ? 'bg-primary-subtle border-primary text-primary-emphasis'
                      : 'bg-white border-light-subtle text-secondary hover:bg-light'
                  }`}
                  style={{ fontSize: '13.5px', fontWeight: '500' }}
                >
                  <span className={`material-symbols-outlined fs-5 ${isSelected ? 'text-primary' : 'text-muted'}`}>
                    {isSelected ? 'radio_button_checked' : 'radio_button_unchecked'}
                  </span>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Action buttons */}
        <div className="d-flex flex-column gap-2 w-100 mt-2">
          <Button
            variant="secondary"
            icon="check_circle"
            onClick={() => onAction('finish')}
            className="w-100 py-3 text-uppercase tracking-wider"
            disabled={q3 === null}
          >
            Finalizar Sesión
          </Button>

          <Button
            variant="outline"
            onClick={() => onAction('new')}
            className="w-100 py-3 text-uppercase tracking-wider"
          >
            Nueva Sintonía
          </Button>
        </div>
      </main>
    </div>
  );
};

export default FinalSurvey;
