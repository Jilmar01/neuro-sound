// routes/spotify.routes.js
import express from "express";
import SpotifyWebApi from "spotify-web-api-node";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Inicializar cliente de Spotify
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: "http://127.0.0.1:5000/api/spotify/callback"
});

// ------------------------------------
// LOGIN - Genera URL de autorización
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
// CALLBACK - Recibe ?code y obtiene token
// ------------------------------------
router.get("/callback", async (req, res) => {
    const code = req.query.code;

    try {
        const data = await spotifyApi.authorizationCodeGrant(code);

        const accessToken = data.body.access_token;
        const refreshToken = data.body.refresh_token;

        // Guardar tokens
        spotifyApi.setAccessToken(accessToken);
        spotifyApi.setRefreshToken(refreshToken);

        console.log("Spotify autenticado correctamente ✔️");

        // REDIRIGE AL PLAYER DEL FRONTEND (PUERTO 3000)
        return res.redirect(`http://127.0.0.1:3000//frontend/settings.html?token=${accessToken}`);

    } catch (error) {
        console.error("Error en autenticación:", error);
        return res.send("Error autenticando con Spotify");
    }
});

// Exportar rutas
export default router;
