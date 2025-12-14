import app from './app.js';
import connectDB from './config/database.js';
import dotenv from 'dotenv';

dotenv.config();

/* Puerto por defecto */
const PORT = process.env.PORT || 5000;

/* Arranque del servidor */
const startServer = async () => {
  try {
    await connectDB();
    console.log('Base de datos conectada');

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor en producción escuchando en el puerto ${PORT}`);
    });

    /* Manejo de errores no controlados */
    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Rejection:', err);
      server.close(() => process.exit(1));
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM recibido. Cerrando servidor...');
      server.close(() => {
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
