/* Configuracion principa de express */
import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';

import userRoutes from './routes/user.routes.js';
import authRoutes from './routes/auth.routes.js';

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

/* Ruta para enviar un mensaje de prueba */
app.get('/api/test', (req, res) => {
  res.json({ message: 'API de NeuroSound funcionando correctamente' });
});

export default app;