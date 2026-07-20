import React, { useState } from 'react';
import Button from '../common/Button';

const DataTreatmentScreen = ({ onAccept, onDecline }) => {
  const [consent, setConsent] = useState('yes');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (consent === 'yes') {
      onAccept();
    } else {
      onDecline();
    }
  };

  return (
    <div className="min-vh-100 position-relative d-flex flex-column align-items-center justify-content-center w-100 bg-surface p-4 text-center">
      <div className="ambient-glow" />
      <div className="ambient-glow-bottom" />

      <main className="position-relative z-3 w-100 d-flex flex-column align-items-center justify-content-center glass-panel p-5 rounded-4 shadow-sm border border-light-subtle animate-fade-in-up" style={{ maxWidth: '500px' }}>
        <div className="mb-4 d-flex flex-column align-items-center w-100">
          <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center mb-3 shadow-sm border border-primary border-opacity-25" style={{ width: '80px', height: '80px' }}>
            <span className="material-symbols-outlined notranslate text-primary" translate="no" style={{ fontSize: '36px' }}>
              shield_person
            </span>
          </div>
          <h1 className="h3 text-primary fw-bold mb-1">1. Consentimiento</h1>
        </div>

        <form onSubmit={handleSubmit} className="w-100 d-flex flex-column align-items-stretch gap-4 text-start">
          <div>
            <label className="text-secondary fw-semibold mb-4 d-block text-center fs-5 px-2" style={{ lineHeight: '1.5' }}>
              ¿Acepta que sus respuestas se utilicen para personalizar su experiencia musical?
            </label>
            
            <div className="d-flex gap-3 justify-content-center mb-2">
              <button
                type="button"
                className={`flex-grow-1 py-3.5 px-4 rounded-3 border fw-bold fs-6 transition-all d-flex align-items-center justify-content-center gap-2 option-btn ${
                  consent === 'yes'
                    ? 'border-primary bg-primary bg-opacity-10 text-primary shadow-sm'
                    : 'border-light-subtle bg-white text-secondary'
                }`}
                onClick={() => setConsent('yes')}
                style={{ minHeight: '56px' }}
              >
                {consent === 'yes' && (
                  <span className="material-symbols-outlined notranslate filled" translate="no" style={{ fontSize: '20px' }}>
                    check_circle
                  </span>
                )}
                Sí
              </button>

              <button
                type="button"
                className={`flex-grow-1 py-3.5 px-4 rounded-3 border fw-bold fs-6 transition-all d-flex align-items-center justify-content-center gap-2 option-btn ${
                  consent === 'no'
                    ? 'border-danger bg-danger bg-opacity-10 text-danger shadow-sm'
                    : 'border-light-subtle bg-white text-secondary'
                }`}
                onClick={() => setConsent('no')}
                style={{ minHeight: '56px' }}
              >
                {consent === 'no' && (
                  <span className="material-symbols-outlined notranslate filled" translate="no" style={{ fontSize: '20px' }}>
                    cancel
                  </span>
                )}
                No
              </button>
            </div>
          </div>

          <div className="mt-3">
            <Button
              type="submit"
              className="w-100 py-3 fw-bold fs-6 rounded-3 shadow-sm btn-primary-siguiente"
            >
              Siguiente
            </Button>
          </div>
        </form>

        <p className="text-muted small mt-4 mb-0 text-center" style={{ fontSize: '12px' }}>
          Este sistema usará tus datos de forma académica; nada de este entorno seguro se expondrá públicamente.
        </p>
      </main>

      <style>{`
        .option-btn {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
          border-width: 2px !important;
        }
        .option-btn:hover {
          transform: translateY(-1px);
        }
        .option-btn:active {
          transform: translateY(1px);
        }
        .btn-primary-siguiente {
          transition: transform 0.2s ease, background-color 0.2s ease;
        }
        .btn-primary-siguiente:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
};

export default DataTreatmentScreen;
