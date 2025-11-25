/* Arranque del servidor */
import app from './app.js';
import connectDB from './config/database.js';

/* Conexion a la base de datos */
connectDB();

const PORT = process.env.PORT || 5500;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo http://localhost:${PORT}`);
});