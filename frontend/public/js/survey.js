
import { fetchRequest } from "./utils/fetch.js";
import { getUser } from "./utils/auth.js";

async function initSurvey() {

    const response = await getUser();

    if (!response?.success || !response?.data) {
        window.location.replace("./login.html");
        return;
    }
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");

    if (response.data.form && mode !== "repeat") {
        window.location.replace("./home.html");
        return;
    }

    document.getElementById("btnConsent")?.addEventListener("click", handleConsent);

    document.getElementById("btnNext2")?.addEventListener("click", () => nextSection(2));
    document.getElementById("btnBack2")?.addEventListener("click", () => previousSection(2));

    document.getElementById("btnNext3")?.addEventListener("click", () => validateAndNext(3));
    document.getElementById("btnBack3")?.addEventListener("click", () => previousSection(3));

    document.getElementById("btnNext4")?.addEventListener("click", () => validateAndNext(4));
    document.getElementById("btnBack4")?.addEventListener("click", () => previousSection(4));

    document.getElementById("btnBack5")?.addEventListener("click", () => previousSection(5));
    const buttonSend = document.getElementById("btnSend");
    buttonSend?.addEventListener("click", validateAndSend);

    // Global variables
    let currentEmotion = "";
    let currentSection = 1;
    const totalSections = 5;

    // Emotion to frequency mapping
    const EMOTION_FREQUENCIES = {
        tristeza: [110, 174, 210],
        calma: [285, 396, 417],
        felicidad: [440, 528, 639],
        ira: [741, 852, 963]
    };

    const emotionMap = {
        'T': 'tristeza',
        'C': 'calma',
        'F': 'felicidad',
        'I': 'ira'
    };

    const emotionLabels = {
        tristeza: { text: "Feel sad", icon: "😢" },
        calma: { text: "Feel calm", icon: "😌" },
        felicidad: { text: "Feel happy", icon: "😊" },
        molestia: { text: "Release annoyance", icon: "😠" }
    };

    // Update progress bar
    function updateProgress() {
        const progress = (currentSection / totalSections) * 100;
        document.getElementById('progressBar').style.width = progress + '%';
    }

    // Emotion selection handling
    const emotionOptions = document.querySelectorAll('.emotion-option');
    const emotionInput = document.getElementById('currentEmotion');

    emotionOptions.forEach(option => {
        option.addEventListener('click', function () {
            emotionOptions.forEach(opt => {
                opt.classList.remove('option-invalid')
                opt.classList.remove('selected')
            });
            this.classList.add('selected');
            currentEmotion = this.dataset.value;
            emotionInput.value = currentEmotion;
            emotionInput.classList.remove('is-invalid');
            emotionInput.classList.add('is-valid');

            const feedback = document.getElementById('part-two');
            feedback.classList.remove('valid-feedback');
            feedback.classList.add('invalid-feedback');
            // Update emotional goal options
            updateEmotionalGoals();

            // Load audio files for this emotion
            putSoundEmotion();
        });
    });

    // Intensity slider handling
    const intensitySlider = document.getElementById('emotionIntensity');
    const intensityVal = document.getElementById('intensityVal');

    intensitySlider.addEventListener('input', function () {
        intensityVal.textContent = this.value;
    });

    // Genre handling
    const genreCards = document.querySelectorAll('.genre-card');
    genreCards.forEach(card => {

        const checkbox = card.querySelector('.genreCheck');

        card.addEventListener('click', function (e) {
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
            }

            if (checkbox.checked) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }

            genreCards.forEach(card => {
                card.classList.remove('option-invalid');
            });

            const feedback = document.getElementById('genreError')
            feedback.classList.remove('valid-feedback');
            feedback.classList.add('invalid-feedback');

        });

        checkbox.addEventListener('change', function () {
            if (this.checked) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });
    });

    // Real-time validation for selects
    const selects = document.querySelectorAll('.form-select');
    selects.forEach(select => {
        select.addEventListener('change', function () {

            if (this.value) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');

            } else {
                this.classList.remove('is-valid');
                this.classList.add('is-invalid');
            }
        });
    });

    // Initialize audio player controls
    handleSingleAudioPlay();
    updateProgress();


    // Update emotional goal options based on selected emotion
    function updateEmotionalGoals() {
        const goalSelect = document.getElementById("emotionalGoal");

        goalSelect.innerHTML =
            '<option value="">Select a goal...</option>';

        if (!currentEmotion) return;

        // 🔄 mantenerme como estoy
        const stayIntentId = emotionToIntentId[currentEmotion];

        const stayOption = document.createElement("option");
        stayOption.value = stayIntentId;
        stayOption.textContent = "🔄 Stay how I feel";
        goalSelect.appendChild(stayOption);

        // restantes emociones
        Object.entries(intentMap).forEach(([intentId, emotion]) => {

            if (emotion === currentEmotion) return;

            const opt = document.createElement("option");
            opt.value = intentId;
            opt.textContent =
                `${emotionLabels[emotion].icon} ${emotionLabels[emotion].text}`;

            goalSelect.appendChild(opt);
        });
    }

    function getEmotionCodeFromFileName(fileName) {
        const regex = /_([TCFI])\.wav$/;
        const match = fileName.match(regex);

        if (match) {
            return emotionMap[match[1]];
        }

        return null;
    }

    // Load audio files based on selected emotion
    function putSoundEmotion() {
        if (!currentEmotion) return;

        console.log("Selected emotion:", currentEmotion);

        const audioPlayers = [
            document.getElementById("audio1"),
            document.getElementById("audio2"),
            document.getElementById("audio3")
        ];

        if (!audioPlayers[0]) return;

        const availableAudios = [
            "../public/assets/frecuences/tone_110hz_20s_T.wav",
            "../public/assets/frecuences/tone_174hz_20s_T.wav",
            "../public/assets/frecuences/tone_210hz_20s_T.wav",

            "../public/assets/frecuences/tone_285hz_20s_C.wav",
            "../public/assets/frecuences/tone_396hz_20s_C.wav",
            "../public/assets/frecuences/tone_417hz_20s_C.wav",

            "../public/assets/frecuences/tone_440hz_20s_F.wav",
            "../public/assets/frecuences/tone_528hz_20s_F.wav",
            "../public/assets/frecuences/tone_639hz_20s_F.wav",

            "../public/assets/frecuences/tone_741hz_20s_I.wav",
            "../public/assets/frecuences/tone_852hz_20s_I.wav",
            "../public/assets/frecuences/tone_963hz_20s_I.wav"
        ];

        const matchingAudios = availableAudios.filter(audioPath => {
            const emotionWord = getEmotionCodeFromFileName(audioPath);
            return emotionWord === currentEmotion;
        });

        if (matchingAudios.length === 0) {
            console.warn("No audio files for:", currentEmotion);
            return;
        }

        audioPlayers.forEach((audioElement, index) => {
            if (matchingAudios[index]) {
                audioElement.src = matchingAudios[index];
                audioElement.load();
            }
        });
    }

    // Handle single audio play at a time
    function handleSingleAudioPlay() {
        const audioPlayers = document.querySelectorAll("audio");
        audioPlayers.forEach(player => {
            player.removeEventListener('play', pauseOtherAudios);
            player.addEventListener('play', pauseOtherAudios);
        });
    }

    function pauseOtherAudios(event) {
        const currentPlayingAudio = event.target;
        const allAudios = document.querySelectorAll("audio");
        allAudios.forEach(audio => {
            if (audio !== currentPlayingAudio) {
                audio.pause();
            }
        });
    }

    // Navigation functions
    function handleConsent() {
        const val = document.getElementById("consent").value;
        const consentSelect = document.getElementById("consent");
        const partOneError = document.getElementById("part-one");

        if (!val) {
            consentSelect.classList.add('is-invalid');
            partOneError.classList.add('invalid-feedback');
            return;
        }

        if (val === "No") {
            // Cambiara  una alerta personalizada
            alert("Consent is required to continue.");
            return;
        }

        consentSelect.classList.remove('is-invalid');
        consentSelect.classList.add('is-valid');
        partOneError.classList.remove('valid-feedback');
        partOneError.classList.add('invalid-feedback');
        nextSection(1);
    }

    function nextSection(current) {
        // Validate current section before proceeding
        if (current === 2 && !currentEmotion) {
            document.getElementById('currentEmotion').classList.add('is-invalid');
            const feeback = document.getElementById('part-two');
            feeback.classList.remove('invalid-feedback');
            feeback.classList.add('valid-feedback');
            const emotionOptions = document.querySelectorAll('.emotion-option');
            emotionOptions.forEach(option => {
                option.classList.add('option-invalid');
            });
            return;
        }

        document.getElementById("section" + current).style.display = "none";
        document.getElementById("section" + current).classList.remove("active");

        currentSection = current + 1;
        const next = document.getElementById("section" + currentSection);
        if (next) {
            next.style.display = "block";
            next.classList.add("active");
            updateProgress();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function previousSection(current) {
        document.getElementById("section" + current).style.display = "none";
        document.getElementById("section" + current).classList.remove("active");

        currentSection = current - 1;
        const prev = document.getElementById("section" + currentSection);
        if (prev) {
            prev.style.display = "block";
            prev.classList.add("active");
            updateProgress();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // Validation function for sections with multiple fields
    function validateAndNext(sectionNumber) {
        let isValid = true;

        if (sectionNumber === 3) {
            // Validate tone ratings
            const likedTone = document.getElementById('likedTone');
            const dislikedTone = document.getElementById('dislikedTone');

            [likedTone, dislikedTone].forEach(field => {
                if (!field.value) {
                    field.classList.add('is-invalid');
                    isValid = false;
                } else {
                    field.classList.remove('is-invalid');
                    field.classList.add('is-valid');
                }
            });

            if (!isValid) {
                alert("Please complete all tone ratings.");
                return;
            }
        }

        if (sectionNumber === 4) {
            // Validate at least one genre selected
            const genres = document.querySelectorAll('.genreCheck:checked');
            const genreError = document.getElementById('genreError');
            const tempoPref = document.getElementById('tempoPref');
            const genreOptinos = document.querySelectorAll('.genre-card');

            if (genres.length === 0) {
                genreError.classList.remove('invalid-feedback');
                genreError.classList.add('valid-feedback');
                genreOptinos.forEach(option => {
                    option.classList.add('option-invalid');
                });
                isValid = false;
            } else {
                genreError.classList.add('invalid_feedback');
            }

            if (!tempoPref.value) {
                tempoPref.classList.add('is-invalid');
                isValid = false;
            } else {
                tempoPref.classList.remove('is-invalid');
                tempoPref.classList.add('is-valid');
            }

            if (!isValid) {
                alert("Please complete all required fields.");
                return;
            }
        }

        nextSection(sectionNumber);
    }

    // Final validation and data submission
    async function validateAndSend() {
        const emotionalGoal = document.getElementById('emotionalGoal');

        if (!emotionalGoal.value) {
            emotionalGoal.classList.add('is-invalid');
            alert("Please select your musical goal.");
            return;
        }

        emotionalGoal.classList.remove('is-invalid');
        emotionalGoal.classList.add('is-valid');

        await sendData();
    }

    const intentMap = {
        1: "tristeza",
        2: "calma",
        3: "felicidad",
        4: "molestia"
    };

    const emotionToIntentId = {
        tristeza: 1,
        calma: 2,
        felicidad: 3,
        molestia: 4
    };

    // Send data to backend
    async function sendData() {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("⚠️ Error: Session not started.");
            // window.location.href = "index.html"; // Uncomment in production
            return;
        }

        const selectedEmotion = document.getElementById("currentEmotion").value;
        const frequenciesToSend = EMOTION_FREQUENCIES[selectedEmotion] || [];

        const genres = Array.from(
            document.querySelectorAll('.genreCheck:checked')
        ).map(x => x.value);

        const rawArtists = document.getElementById("currentArtist").value;
        const artistArray = rawArtists
            .split(',')
            .map(artist => artist.trim())
            .filter(artist => artist !== "");

        const body = {
            emotion: selectedEmotion,
            intensity: Number(document.getElementById("emotionIntensity").value),

            tones: {
                group: frequenciesToSend,
                favorite: document.getElementById("likedTone").value,
                least_favorite: document.getElementById("dislikedTone").value
            },

            genres: genres,
            artist_interest: artistArray,
            tempo_preference: document.getElementById("tempoPref").value,
            intent: Number(document.getElementById("emotionalGoal").value),
            consent: document.getElementById("consent").value === "Si"
        };

        buttonSend.disabled = true;
        buttonSend.textContent = "Sending..."

        try {
            const response = await fetchRequest(
                "api/survey/register",
                "POST",
                body,
                true
            );

            if (!response.success) {
                throw new Error(response.data.message);
            } else {
                window.location.replace("./result.html");
            }

        } catch (error) {
            console.error("Error saving:", error);
            alert("Error saving: " + error.message);
        }
    }


}


initSurvey();