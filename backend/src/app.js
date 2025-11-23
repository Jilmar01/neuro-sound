/* Configuracion principa de express */
import express from 'express';
import cors from 'cors';

const app = express();

/* Middlewares */
app.use(cors());

/* Ruta para enviar un mensaje de prueba */
app.get('/api/test', (req, res) => {
  res.json({ message: 'API de NeuroSound funcionando correctamente' });
});

export default app;