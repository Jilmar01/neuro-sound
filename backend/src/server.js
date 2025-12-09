import express from "express";
import cors from "cors";
import connectDB from "./config/database.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js"; // si ya lo tienes
import spotifyRoutes from "./routes/spotify.routes.js";

const app = express();

// Conectar BD
connectDB();

// CORS CORRECTO para cookies
app.use(
    cors({
        origin: ["http://127.0.0.1:3000", "http://127.0.0.1:3000"], 
        credentials: true
    })
);

app.use(express.json());

// Rutas
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes); // login/logout
app.use("/api/spotify", spotifyRoutes); // rutas de Spotify
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://127.0.0.1:${PORT}`);
});

app.get("/", (req, res) => {
    res.send(`Backend funcionando ✔ Puerto ${PORT}`);
});
