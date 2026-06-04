import express from "express";
import SpotifyWebApi from "spotify-web-api-node";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// 1. CONFIGURACIÓN DEL CLIENTE
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: "http://neuro-sound.onrender.com/api/spotify/callback" 
});

// ------------------------------------
// 1. LOGIN
// ------------------------------------
router.get("/login", (req, res) => {
    const scopes = [
        "streaming",
        "user-read-email",
        "user-read-private",
        "user-read-playback-state",
        "user-modify-playback-state",
        "playlist-read-private",
        "user-read-currently-playing"
    ];
    // Agregamos show_dialog: true para forzar que pida login si es necesario (opcional)
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, "state123");
    return res.redirect(authorizeURL);
});

// ------------------------------------
// 2. CALLBACK (CORREGIDO)
// ------------------------------------
router.get("/callback", async (req, res) => {
    const code = req.query.code;

    if (!code) return res.status(400).send("Error: No code provided");

    try {
        const data = await spotifyApi.authorizationCodeGrant(code);
        const accessToken = data.body.access_token;
        const refreshToken = data.body.refresh_token;

        // 👇 CAMBIO IMPORTANTE 👇
        // Enviamos AMBOS tokens al frontend.
        // El frontend debe guardar el refreshToken en localStorage para usarlo en 1 hora.
        const frontendUrl = `http://127.0.0.1:5173/home?access_token=${accessToken}&refresh_token=${refreshToken}`;
        
        return res.redirect(frontendUrl);

    } catch (error) {
        console.error("Error en autenticación:", error);
        return res.redirect(`https://neuro-sound.web.app/home.html?error=auth_failed`);
    }
});

// ------------------------------------
// 3. REFRESH TOKEN (NUEVO)
// ------------------------------------
// Esta es la ruta que llamará tu 'api.js' cuando reciba un 401
router.post("/refresh", async (req, res) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
        return res.status(400).json({ error: "Falta el refresh token" });
    }

    try {
        // Configuramos el refresh token en la instancia
        spotifyApi.setRefreshToken(refresh_token);

        // Spotify nos da un nuevo access token
        const data = await spotifyApi.refreshAccessToken();
        
        const newAccessToken = data.body.access_token;
        
        // A veces Spotify rota el refresh token también, si viene nuevo, lo enviamos
        // si no, enviamos el mismo que recibimos.
        const newRefreshToken = data.body.refresh_token || refresh_token;

        console.log("🔄 Token de Spotify renovado exitosamente");

        res.json({
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
            expires_in: data.body.expires_in
        });

    } catch (error) {
        console.error("❌ Error renovando token:", error);
        res.status(400).json({ error: "No se pudo renovar el token", details: error });
    }
});

export default router;
