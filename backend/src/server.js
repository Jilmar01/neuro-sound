import express from "express";
import cors from "cors";
import connectDB from "./config/database.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js"; // si ya lo tienes

const app = express();

// Conectar BD
connectDB();

// CORS CORRECTO para cookies
app.use(
    cors({
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"], 
        credentials: true
    })
);

app.use(express.json());

// Rutas
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes); // login/logout

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
