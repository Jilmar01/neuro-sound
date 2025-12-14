/* Configuracion principa de express */
import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';

import userRoutes from './routes/user.routes.js';
import authRoutes from './routes/auth.routes.js';
import surveyRoutes from './routes/survey.routes.js'
import recommendRoutes from './routes/recommend.routes.js'
import spotifyRoutes from './routes/spotify.routes.js';

const app = express();

/* Middlewares */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

dotenv.config();

/* Rutas */
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/survey', surveyRoutes);
app.use('/api/recommend', recommendRoutes);
app.use('/api/spotify', spotifyRoutes);

/* Ruta para enviar un mensaje de prueba */
app.get('/api/test', (req, res) => {
  res.send('<h1>API de NeuroSound funcionando correctamente</h1>')
});

export default app;
