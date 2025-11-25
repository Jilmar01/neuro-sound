/* Configuracion principa de express */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

/* Conexion a la base de datos */
connectDB();

const app = express();

/* Middlewares */
app.use(cors());
dotenv.config();

/* Ruta para enviar un mensaje de prueba */
app.get('/api/test', (req, res) => {
  res.json({ message: 'API de NeuroSound funcionando correctamente' });
});

export default app;