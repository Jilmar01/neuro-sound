import React, { useState } from 'react';
import Button from '../common/Button';
import Slider from '../common/Slider';

const InitialSurvey = ({ onSubmit }) => {
  const [ansiedad, setAnsiedad] = useState(3);
  const [estres, setEstres] = useState(2);
  const [tristeza, setTristeza] = useState(1);

  const labels = {
    ansiedad: ["Baja", "Leve", "Moderada", "Alta", "Severa"],
    estres: ["Nulo", "Leve", "Moderado", "Alto", "Severo"],
    tristeza: ["Nula", "Leve", "Moderada", "Alta", "Severa"]
  };

  const nodesConfig = {
    ansiedad: [
      { value: 1, icon: 'sentiment_satisfied' },
      { value: 2, icon: 'sentiment_neutral' },
      { value: 3, icon: 'sentiment_dissatisfied' },
      { value: 4, icon: 'sentiment_very_dissatisfied' },
      { value: 5, icon: 'sick' }
    ],
    estres: [
      { value: 1, icon: 'spa' },
      { value: 2, icon: 'airwave' },
      { value: 3, icon: 'bolt' },
      { value: 4, icon: 'crisis_alert' },
      { value: 5, icon: 'warning' }
    ],
    tristeza: [
      { value: 1, icon: 'wb_sunny' },
      { value: 2, icon: 'partly_cloudy_day' },
      { value: 3, icon: 'cloud' },
      { value: 4, icon: 'rainy' },
      { value: 5, icon: 'storm' }
    ]
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ansiedad,
      estres,
      tristeza,
      emotion: labels.ansiedad[ansiedad - 1].toLowerCase(), // extract a base emotion for search query fallback
    });
  };

  return (
    <div className="w-100 py-2 d-flex flex-column align-items-center justify-content-center">
      <main className="w-full max-w-[600px] d-flex flex-column align-items-center p-3 animate-fade-in-up">
        {/* Header */}
        <header className="text-center mb-3 w-100">
          <h2 className="h4 text-dark mb-1 fw-bold">
            ¿Cómo te sientes en este momento?
          </h2>
          <p className="text-muted small mb-0">
            Para personalizar tu experiencia, selecciona la intensidad en cada escala.
          </p>
        </header>

        {/* Likert Scales Form */}
        <form onSubmit={handleSubmit} className="w-100 d-flex flex-column gap-3">
          {/* Metric: Ansiedad */}
          <div className="d-flex flex-column bg-white bg-opacity-75 backdrop-blur-sm rounded-4 p-3 border border-light-subtle shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="fw-bold text-dark mb-0">Ansiedad</label>
              <span className="small text-secondary italic">
                {labels.ansiedad[ansiedad - 1]}
              </span>
            </div>
            <Slider
              mode="likert"
              value={ansiedad}
              onChange={setAnsiedad}
              nodes={nodesConfig.ansiedad}
              ariaLabel="Ansiedad"
            />
            <div className="d-flex justify-content-between mt-1 px-2 text-secondary" style={{ fontSize: '10px' }}>
              <span>Baja</span>
              <span>Alta</span>
            </div>
          </div>

          {/* Metric: Estrés */}
          <div className="d-flex flex-column bg-white bg-opacity-75 backdrop-blur-sm rounded-4 p-3 border border-light-subtle shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="fw-bold text-dark mb-0">Estrés</label>
              <span className="small text-secondary italic">
                {labels.estres[estres - 1]}
              </span>
            </div>
            <Slider
              mode="likert"
              value={estres}
              onChange={setEstres}
              nodes={nodesConfig.estres}
              ariaLabel="Estrés"
            />
            <div className="d-flex justify-content-between mt-1 px-2 text-secondary" style={{ fontSize: '10px' }}>
              <span>Relajado</span>
              <span>Tenso</span>
            </div>
          </div>

          {/* Metric: Tristeza */}
          <div className="d-flex flex-column bg-white bg-opacity-75 backdrop-blur-sm rounded-4 p-3 border border-light-subtle shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="fw-bold text-dark mb-0">Tristeza</label>
              <span className="small text-secondary italic">
                {labels.tristeza[tristeza - 1]}
              </span>
            </div>
            <Slider
              mode="likert"
              value={tristeza}
              onChange={setTristeza}
              nodes={nodesConfig.tristeza}
              ariaLabel="Tristeza"
            />
            <div className="d-flex justify-content-between mt-1 px-2 text-secondary" style={{ fontSize: '10px' }}>
              <span>Despejado</span>
              <span>Nublado</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-3 d-flex justify-content-center w-100">
            <Button
              type="submit"
              variant="secondary"
              icon="arrow_forward"
              className="w-100 py-3 shadow-sm"
            >
              Continuar
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default InitialSurvey;
