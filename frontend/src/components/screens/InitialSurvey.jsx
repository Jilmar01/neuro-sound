import React, { useState } from 'react';
import Button from '../common/Button';
import Slider from '../common/Slider';

/**
 * Encuesta inicial adaptada con escala Likert de Triste a Feliz,
 * y encuesta de cómo se quisiera sentir el usuario.
 * 
 * @param {Object} props - Propiedades del componente.
 * @param {(data: Object) => void} props.onSubmit - Callback con datos de encuesta mapeados.
 * @returns {JSX.Element}
 */
const InitialSurvey = ({ onSubmit, hideFrequencies = false, initialData = null }) => {
  const [comoSiente, setComoSiente] = useState(() => initialData?.comoSiente ?? 3);
  const [comoQuiere, setComoQuiere] = useState(() => initialData?.comoQuiere ?? 5);
  const frequency = initialData?.volume ?? 200;
  const [hasConsented, setHasConsented] = useState(() => {
    if (hideFrequencies) return true;
    return localStorage.getItem('dataConsent') === 'true';
  });

  const labels = {
    sientes: ["Triste", "Algo Triste", "Neutral", "Algo Feliz", "Feliz"],
    quieres: ["Triste", "Algo Triste", "Neutral", "Algo Feliz", "Feliz"]
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

  /**
   * Envía los datos de la encuesta mapeados al formato del Backend
   * para asegurar la compatibilidad sin romper la lógica del generador.
   * @param {React.FormEvent} e - Evento de submit.
   * @returns {void}
   */
  /**
   * Procesa la sumisión de los datos.
   */
  const triggerSubmit = (sienteVal, quiereVal) => {
    // Mapear comoSiente (1-5, de triste a feliz) a tristeza (5-1, de alta a baja)
    const tristezaMapped = Math.max(1, 6 - sienteVal);
    
    // La brecha (gap) emocional indica el nivel de frustración/estrés
    const gap = Math.abs(quiereVal - sienteVal);
    
    // Mapeamos a las variables esperadas por el backend
    const estresMapped = Math.max(1, Math.min(5, Math.round(tristezaMapped * 0.7 + gap * 0.5)));
    const ansiedadMapped = Math.max(1, Math.min(5, Math.round(tristezaMapped * 0.6 + gap * 0.6)));

    // Determinamos la emoción terapéutica de destino
    let targetEmotion = 'calma';
    if (sienteVal <= 2) {
      targetEmotion = 'zen'; // Triste/bajo -> Terapia profunda reconstructora
    } else if (sienteVal === 3) {
      targetEmotion = 'calma'; // Neutral -> Calma y estabilidad cerebral
    } else {
      targetEmotion = 'relajacion'; // Alegre/alto -> Relajación y flow positivo
    }

    onSubmit({
      ansiedad: ansiedadMapped,
      estres: estresMapped,
      tristeza: tristezaMapped,
      volume: frequency, // Pasamos la frecuencia Hawkins (0-1000) en el parámetro "volume"
      comoSiente: sienteVal,
      comoQuiere: quiereVal,
      emotion: targetEmotion,
    });
  };

  /**
   * Envía los datos de la encuesta mapeados al formato del Backend
   * para asegurar la compatibilidad sin romper la lógica del generador.
   * @param {React.FormEvent} e - Evento de submit.
   * @returns {void}
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    triggerSubmit(comoSiente, comoQuiere);
  };

  /**
   * Maneja el cambio de la emoción deseada. Si hideFrequencies es true,
   * envía la encuesta automáticamente.
   */
  const handleComoQuiereChange = (val) => {
    setComoQuiere(val);
    if (hideFrequencies) {
      console.log("⚡ Auto-submitting survey with selection:", val);
      triggerSubmit(comoSiente, val);
    }
  };



  if (!hasConsented) {
    return (
      <div className="w-100 d-flex flex-column align-items-center justify-content-center vh-100 text-center">
        <main className="w-100 max-w-[500px] d-flex flex-column align-items-center p-4 bg-white bg-opacity-75 backdrop-blur-sm rounded-4 border border-light-subtle shadow-sm animate-fade-in-up" style={{ maxWidth: '500px' }}>
          <span className="material-symbols-outlined notranslate text-primary mb-3" translate="no" style={{ fontSize: '50px' }}>
            privacy_tip
          </span>
          <h2 className="h4 text-dark mb-3 fw-bold">Privacidad y Uso de Datos</h2>
          <p className="text-muted small mb-4 text-start" style={{ lineHeight: '1.6' }}>
            Para ofrecerte una experiencia musical adaptada a tu estado emocional y frecuencia de conciencia, necesitamos recolectar tus respuestas en las encuestas de calibración. <br/><br/>
            ¿Estás de acuerdo en que utilicemos estos datos <strong>única y exclusivamente para el funcionamiento de la aplicación</strong> y la personalización de tu perfil?
          </p>
          <div className="d-flex flex-column flex-sm-row gap-3 w-100 mt-2">
            <Button
              type="button"
              variant="outline-secondary"
              className="w-100 py-2 rounded-pill fw-semibold"
              onClick={() => {
                // Si no acepta, no puede avanzar. Lo redirigimos o cerramos sesión.
                localStorage.clear();
                window.location.href = '/login';
              }}
            >
              No, cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              className="w-100 py-2 rounded-pill fw-semibold"
              onClick={() => {
                localStorage.setItem('dataConsent', 'true');
                setHasConsented(true);
              }}
            >
              Sí, acepto
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="w-100 py-2 d-flex flex-column align-items-center justify-content-center">
      <main className="w-full max-w-[600px] d-flex flex-column align-items-center p-3 animate-fade-in-up">
        {/* Encabezado */}
        <header className="text-center mb-3 w-100">
          <h2 className="h4 text-dark mb-1 fw-bold">
            Autoevaluación Emocional
          </h2>
          <p className="text-muted small mb-0">
            Responde las preguntas para que sincronicemos tu música con las frecuencias de la conciencia.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="w-100 d-flex flex-column gap-3">
          {/* Escala 1: ¿Cómo te sientes? */}
          <div className="d-flex flex-column bg-white bg-opacity-75 backdrop-blur-sm rounded-4 p-3 border border-light-subtle shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="fw-bold text-dark mb-0">¿Cómo te sientes en este momento?</label>
              <span className="small text-secondary italic fw-semibold text-primary">
                {labels.sientes[comoSiente - 1]}
              </span>
            </div>
            <Slider
              mode="likert"
              value={comoSiente}
              onChange={setComoSiente}
              nodes={nodesConfig.sientes}
              ariaLabel="Cómo te sientes en este momento"
            />
            <div className="d-flex justify-content-between mt-1 px-2 text-secondary fw-semibold" style={{ fontSize: '11px' }}>
              <span>Triste</span>
              <span>Feliz</span>
            </div>
          </div>

          {/* Escala 2: ¿Cómo te quisieras sentir? */}
          <div className="d-flex flex-column bg-white bg-opacity-75 backdrop-blur-sm rounded-4 p-3 border border-light-subtle shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="fw-bold text-dark mb-0">¿Cómo te quisieras sentir?</label>
              <span className="small text-secondary italic fw-semibold text-primary">
                {labels.quieres[comoQuiere - 1]}
              </span>
            </div>
            <Slider
              mode="likert"
              value={comoQuiere}
              onChange={handleComoQuiereChange}
              nodes={nodesConfig.quieres}
              ariaLabel="Cómo te quisieras sentir"
            />
            <div className="d-flex justify-content-between mt-1 px-2 text-secondary fw-semibold" style={{ fontSize: '11px' }}>
              <span>Triste</span>
              <span>Feliz</span>
            </div>
          </div>



          {/* Botón de envío */}
          <div className="mt-2 d-flex justify-content-center w-100">
            <Button
              type="submit"
              variant="secondary"
              icon="arrow_forward"
              className="w-100 py-3 shadow-sm rounded-pill fw-semibold"
            >
              {hideFrequencies ? "Guardar y Continuar" : "Continuar y Sintonizar"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default InitialSurvey;
