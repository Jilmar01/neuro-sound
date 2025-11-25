/* Conexion a la base de datos MongoDB */
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME,
            user: process.env.DB_USER,
            pass: process.env.DB_PASSWORD,
        });
        console.log('MongoDB conectado exitosamente');
    } catch (error) {
        console.error('MongoDB error de conexion:', error);
        process.exit(1);
    }
};

export default connectDB;