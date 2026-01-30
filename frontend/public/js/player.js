// ===============================
// AUDIO CORE
// ===============================
const audio = document.getElementById("audio-player");

// ===============================
// UI ELEMENTS
// ===============================
const trackNames = document.querySelectorAll(".ui-track-name");
const trackArtists = document.querySelectorAll(".ui-track-artist");
const trackCovers = document.querySelectorAll(".ui-track-cover");


const playButtons = document.querySelectorAll(".ui-play-btn");
const progressBars = document.querySelectorAll(".ui-track-progress");
const ranges = document.querySelectorAll(".ui-track-range");

const currentTimes = document.querySelectorAll(".ui-current-time");
const totalTimes = document.querySelectorAll(".ui-total-time");

// ===============================
// STATE
// ===============================
let playlist = [];
let currentIndex = 0;
let isPlaying = false;
let initialized = false;

// ===============================
// PLAYLIST LOAD
// ===============================
function loadPlaylist(songs) {
    playlist = songs;
}

// ===============================
// LOAD SONG
// ===============================
function loadSong(index, autoplay = true) {

    if (!playlist[index]) return;

    currentIndex = index;
    const song = playlist[index];

    audio.src = song.uri;
    audio.load();

    updateUI(song);

    if (autoplay) play();
}

// ===============================
// UI UPDATE
// ===============================
function updateUI(song) {

    trackNames.forEach(el => el.textContent = song.title);
   // trackArtists.forEach(el => el.textContent = song.artists.join(", "));
    trackArtists.forEach(el => el.textContent = song.artist);

    trackCovers.forEach(el => {
        el.src = "../public/assets/img/defaultcover.png";
    });
}

// ===============================
// PLAY / PAUSE
// ===============================
function play() {
    audio.play();
    isPlaying = true;
    syncPlayIcons();
}

function pause() {
    audio.pause();
    isPlaying = false;
    syncPlayIcons();
}

function syncPlayIcons() {
    playButtons.forEach(btn => {
        btn.classList.toggle("bi-play-fill", !isPlaying);
        btn.classList.toggle("bi-pause-fill", isPlaying);
    });
}

// ===============================
// NEXT / PREV
// ===============================
function nextSong() {
    loadSong((currentIndex + 1) % playlist.length);
}

function prevSong() {
    loadSong(
        (currentIndex - 1 + playlist.length) % playlist.length
    );
}

// ===============================
// AUTO NEXT
// ===============================
audio.addEventListener("ended", nextSong);

// ===============================
// CLICK SONG CARD
// ===============================
document.addEventListener("click", e => {

    const card = e.target.closest(".song-card");
    if (!card) return;

    const index = Number(card.dataset.index);

    loadPlaylist(window.finalSongs);
    loadSong(index, true);
});

// ===============================
// PLAY BUTTONS
// ===============================
playButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        isPlaying ? pause() : play();
    });
});

// ===============================
// PROGRESS BAR
// ===============================
audio.addEventListener("timeupdate", () => {

    if (!audio.duration) return;

    const percent = (audio.currentTime / audio.duration) * 100;

    progressBars.forEach(bar => {
        bar.style.width = `${percent}%`;
    });

    ranges.forEach(range => {
        range.value = percent;
    });

    currentTimes.forEach(el => {
        el.textContent = formatTime(audio.currentTime);
    });

    totalTimes.forEach(el => {
        el.textContent = formatTime(audio.duration);
    });
});

// ===============================
// SEEK
// ===============================
ranges.forEach(range => {
    range.addEventListener("input", () => {
        if (!audio.duration) return;
        audio.currentTime = (range.value / 100) * audio.duration;
    });
});

// ===============================
// BUTTON HOOKS
// ===============================
document.getElementById("btn-next")?.addEventListener("click", nextSong);
document.getElementById("btnNextMobileFull")?.addEventListener("click", nextSong);

document.getElementById("btnPrevMobileFull")?.addEventListener("click", prevSong);

// ===============================
// UTILS
// ===============================
function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0");
    return `${m}:${s}`;
}

window.addEventListener("playlistReady", e => {
    const songs = e.detail;
    loadPlaylist(songs);
    loadSong(0, false);
});