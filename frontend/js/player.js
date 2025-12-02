let accessToken = null;

async function getAccessToken() {
    const res = await fetch("http://localhost:3000/api/spotify/token");
    const data = await res.json();
    return data.token;
}


window.onSpotifyWebPlaybackSDKReady = async () => {
    accessToken = await getAccessToken();

    const player = new Spotify.Player({
        name: "Mi Reproductor Personal",
        getOAuthToken: cb => cb(accessToken),
        volume: 0.8
    });

    // Debug
    player.addListener("ready", ({ device_id }) => {
        document.getElementById("player-status").innerText =
            "Player listo. Device ID: " + device_id;
        console.log("Device ID:", device_id);
    });

    player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID fuera de línea", device_id);
    });

    player.addListener("initialization_error", ({ message }) => console.error(message));
    player.addListener("authentication_error", ({ message }) => console.error(message));
    player.addListener("account_error", ({ message }) => console.error(message));

    player.connect();
};
