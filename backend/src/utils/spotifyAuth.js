/* Funciones de autenticación para Spotify */
import dotenv from 'dotenv';
dotenv.config();

let accessToken = null;
let tokenExpiresAt = null;

const getAccessToken = async () => {
    if (accessToken && tokenExpiresAt && new Date() < tokenExpiresAt) {
        return accessToken;
    }

    try {
        const body = new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: process.env.SPOTIFY_CLIENT_ID,
            client_secret: process.env.SPOTIFY_CLIENT_SECRET,
        });

        const response = await fetch(
            'https://accounts.spotify.com/api/token',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Spotify token error response:", errorText);
            throw new Error("Failed to obtain Spotify access token");
        }

        const data = await response.json();

        accessToken = data.access_token;
        const expiresIn = data.expires_in;
        tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

        return accessToken;

    } catch (error) {
        console.error('Error obtaining Spotify access token:', error);
        throw error;
    }
};


const getSpotifyToken = async () => {
    if(!accessToken || !tokenExpiresAt || new Date() >= tokenExpiresAt) {
        return await getAccessToken();
    }
    return accessToken;
}   

export { getSpotifyToken };









