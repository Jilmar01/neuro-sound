import React, { useState } from 'react';
import Button from '../common/Button';
import Slider from '../common/Slider';

const InitialSurvey = ({ onSubmit, hideFrequencies = false, initialData = null }) => {
  const [comoSiente, setComoSiente] = useState(() => initialData?.comoSiente ?? 3);
  const [comoQuiere, setComoQuiere] = useState(() => initialData?.comoQuiere ?? 5);
  const frequency = initialData?.volume ?? 200;

  const labels = {
    sientes: ['Triste', 'Algo Triste', 'Neutral', 'Algo Feliz', 'Feliz'],
    quieres: ['Triste', 'Algo Triste', 'Neutral', 'Algo Feliz', 'Feliz']
  };

  const nodesConfig = {
    sientes: [
      { value: 1, icon: 'sentiment_very_dissatisfied' },
      { value: 2, icon: 'sentiment_dissatisfied' },
      { value: 3, icon: 'sentiment_neutral' },
      { value: 4, icon: 'sentiment_satisfied' },
      { value: 5, icon: 'sentiment_very_satisfied' }
    ],
    quieres: [
      { value: 1, icon: 'sentiment_very_dissatisfied' },
      { value: 2, icon: 'sentiment_dissatisfied' },
      { value: 3, icon: 'sentiment_neutral' },
      { value: 4, icon: 'sentiment_satisfied' },
      { value: 5, icon: 'sentiment_very_satisfied' }
    ]
  };

  const triggerSubmit = (sienteVal, quiereVal) => {
    const tristezaMapped = Math.max(1, 6 - sienteVal);
    const gap = Math.abs(quiereVal - sienteVal);
    const estresMapped = Math.max(1, Math.min(5, Math.round(tristezaMapped * 0.7 + gap * 0.5)));
    const ansiedadMapped = Math.max(1, Math.min(5, Math.round(tristezaMapped * 0.6 + gap * 0.6)));

    let targetEmotion = 'calma';
    if (sienteVal <= 2) targetEmotion = 'zen';
    else if (sienteVal === 3) targetEmotion = 'calma';
    else targetEmotion = 'relajacion';

    onSubmit({
      ansiedad: ansiedadMapped,
      estres: estresMapped,
      tristeza: tristezaMapped,
      volume: frequency,
      comoSiente: sienteVal,
      comoQuiere: quiereVal,
      emotion: targetEmotion,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    triggerSubmit(comoSiente, comoQuiere);
  };

  const handleComoQuiereChange = (val) => {
    setComoQuiere(val);
    if (hideFrequencies) triggerSubmit(comoSiente, val);
  };

  return (
    <div className="w-100 py-4 d-flex flex-column align-items-center justify-content-center">
      <main className="w-100 d-flex flex-column align-items-center animate-fade-in-up" style={{ maxWidth: '560px' }}>
        <header className="text-center mb-4 w-100">
          <span className="material-symbols-outlined notranslate text-primary" translate="no" style={{ fontSize: '40px' }}>
            mood
          </span>
          <h2 className="h4 text-primary fw-bold mb-1">
            Autoevaluacion Emocional
          </h2>
          <p className="text-secondary small mb-0">
            Responde para sincronizar tu musica con tus emociones
          </p>
        </header>

        <form onSubmit={handleSubmit} className="w-100 d-flex flex-column gap-4">
          <div className="glass-panel p-4 rounded-4 border border-light-subtle shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <label className="fw-bold text-primary mb-0" style={{ fontSize: '15px' }}>Como te sientes?</label>
              <span className="badge bg-primary text-white rounded-pill fw-semibold" style={{ fontSize: '11px' }}>
                {labels.sientes[comoSiente - 1]}
              </span>
            </div>
            <Slider
              mode="likert"
              value={comoSiente}
              onChange={setComoSiente}
              nodes={nodesConfig.sientes}
              ariaLabel="Como te sientes en este momento"
            />
            <div className="d-flex justify-content-between mt-1 px-1 text-secondary" style={{ fontSize: '10px', fontWeight: 600 }}>
              <span>Triste</span>
              <span>Feliz</span>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-4 border border-light-subtle shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <label className="fw-bold text-primary mb-0" style={{ fontSize: '15px' }}>Como te quisieras sentir?</label>
              <span className="badge bg-primary text-white rounded-pill fw-semibold" style={{ fontSize: '11px' }}>
                {labels.quieres[comoQuiere - 1]}
              </span>
            </div>
            <Slider
              mode="likert"
              value={comoQuiere}
              onChange={handleComoQuiereChange}
              nodes={nodesConfig.quieres}
              ariaLabel="Como te quisieras sentir"
            />
            <div className="d-flex justify-content-between mt-1 px-1 text-secondary" style={{ fontSize: '10px', fontWeight: 600 }}>
              <span>Triste</span>
              <span>Feliz</span>
            </div>
          </div>

          <div className="mt-2 d-flex justify-content-center w-100">
            <Button
              type="submit"
              variant="primary"
              icon="arrow_forward"
              className="w-100 py-3 rounded-pill fw-semibold shadow-sm"
            >
              {hideFrequencies ? 'Guardar y Continuar' : 'Continuar y Sintonizar'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default InitialSurvey;