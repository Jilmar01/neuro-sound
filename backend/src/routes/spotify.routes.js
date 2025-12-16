// routes/spotify.routes.js
import express from "express";
import SpotifyWebApi from "spotify-web-api-node";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// 1. CONFIGURACIÓN DEL CLIENTE
// Aquí usamos la URL de RENDER porque es la que está autorizada en el Dashboard de Spotify.
// El backend de Render es quien recibe el código de Spotify.
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: "https://neuro-sound.onrender.com/api/spotify/callback" 
});

// ------------------------------------
// LOGIN
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
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, "state123");
    return res.redirect(authorizeURL);
});

// ------------------------------------
// CALLBACK
// ------------------------------------
router.get("/callback", async (req, res) => {
    const code = req.query.code;

    if (!code) return res.status(400).send("Error: No code provided");

    try {
        // Render canjea el código por el token
        const data = await spotifyApi.authorizationCodeGrant(code);
        const accessToken = data.body.access_token;
        const refreshToken = data.body.refresh_token;

        // (Opcional) Guardar en memoria del backend
        spotifyApi.setAccessToken(accessToken);
        spotifyApi.setRefreshToken(refreshToken);

        console.log("✅ Spotify autenticado en el servidor.");

        // 👇 AQUÍ ESTÁ LA CLAVE 👇
        // El servidor (en la nube) le dice a tu navegador: 
        // "Vete a tu localhost con este token".
        
        // Usamos la ruta exacta que me pediste:
        return res.redirect(`https://neuro-sound.web.app/settings.html?token=${accessToken}`);

    } catch (error) {
        console.error("Error en autenticación:", error);
        // En caso de error, también te devolvemos a local
        return res.redirect(`https://neuro-sound.web.app/settings.html?error=auth_failed`);
    }
});

export default router;
