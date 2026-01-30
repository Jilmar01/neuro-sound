import { generateHybridPlaylist } from "./Engine/NECv2.js";
import { getUser, isAuthenticated } from "./utils/auth.js";
import { API_BASE_URL, fetchRequest } from "./utils/fetch.js";

const btnNewRecommendation = document.querySelectorAll('.btn-newRecommendation');
const confirmRepeatBtn = document.getElementById("confirmRepeatSurveyBtn");

const repeatSurveyModal = new bootstrap.Modal(
    document.getElementById("repeatSurveyModal")
);

btnNewRecommendation.forEach(btn => {
    btn.addEventListener("click", () => {
        repeatSurveyModal.show();
    });
})

confirmRepeatBtn.addEventListener("click", () => {
    window.location.replace("./survey.html?mode=repeat");
});

function isSpotifyLogged() {
    return !!localStorage.getItem("spotify_access");
}

async function initHome() {

    const isAuth = isAuthenticated();

    if (!isAuth) {
        // User must be logged in to access home.html
        window.location.replace("./login.html");
        return;
    }

    // Verify user data and check survey completion
    const response = await getUser();

    if (!response?.success || !response?.data) {
        localStorage.clear();
        window.location.replace("./login.html");
        return;
    }

    if (!response.data.form) {
        window.location.replace("./survey.html");
        return;
    }

    // User is authenticated and completed survey
    showAuthenticatedUI();


    /*const buttonSpotifyAuth = document.getElementById("btnSpotifyLogin");
    if (buttonSpotifyAuth) {
        buttonSpotifyAuth.addEventListener("click", spotifyAuth);
    }

    handleSpotifyTokens();

    document.addEventListener("click", e => {
        const card = e.target.closest(".song-card");
        if (!card) return;

        if (!isSpotifyLogged()) {
            document.getElementById("modalCover").src = card.dataset.cover;
            document.getElementById("modalTitle").innerText = card.dataset.title;
            document.getElementById("modalArtist").innerText = card.dataset.artist;
            const modal = new bootstrap.Modal(
                document.getElementById("spotifyModal")
            );
            modal.show();
        }
    });*/

    //window.location.href = window.location.origin + window.location.pathname;
}

initHome();

function showAuthenticatedUI() {
    // Show sidebar and authenticated navigation
    const sidebar = document.querySelector('.sidebar-container');
    if (sidebar) sidebar.style.display = 'flex';

    const mobileNav = document.querySelector('.mobile-navbar');
    if (mobileNav) mobileNav.style.display = 'flex';
}

function spotifyAuth() {
    window.location.href = `${API_BASE_URL}api/spotify/login`;
}


function handleSpotifyTokens() {
    const params = new URLSearchParams(window.location.search);

    const access = params.get("access_token");
    const refresh = params.get("refresh_token");

    if (access && refresh) {
        localStorage.setItem("spotify_access", access);
        localStorage.setItem("spotify_refresh", refresh);

        window.history.replaceState({}, "", "/Mejora-Neuro-Sound/views/home.html");
    }
}


