import spotifyApi from "../config/spotify.config.js";

export const loginSpotify = (req, res) => {
    const scopes = [
        "user-read-private",
        "user-read-email",
        "user-read-playback-state",
        "user-modify-playback-state"
    ];

    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, "state123");
    res.redirect(authorizeURL);
};

export const callbackSpotify = async (req, res) => {
    const code = req.query.code;

    try {
        const data = await spotifyApi.authorizationCodeGrant(code);

        spotifyApi.setAccessToken(data.body.access_token);
        spotifyApi.setRefreshToken(data.body.refresh_token);

        res.send("Autenticación de Spotify completada ✔️");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error en autenticación");
    }
};

export const getUserData = async (req, res) => {
    try {
        const me = await spotifyApi.getMe();
        res.json(me.body);
    } catch (error) {
        res.status(500).json({ error: "No se pudo obtener datos" });
    }
};
