import { generateHybridPlaylist } from "./Engine/NECv2.js";
import { API_SERVER_MUSIC, fetchRequest } from "./utils/fetch.js";

let iae = '';
let home = '';
let resultIAE = null;
let flag = false;

/* Canciones - Home */
async function getSongs(track_id) {
    try {
        const response = await fetchRequest(
            "api/songs/track",
            "POST",
            { track_id },
            true
        );
        return response;
    } catch (error) {
        console.error("Error cargando canción", error);
        return null;
    }
}

async function getSongsBD(track_ids) {
    try {
        const response = await fetchRequest(
            "api/songs/tracks",
            "POST",
            { track_ids },
        );
        return response;
    } catch (error) {
        console.error("Error cargando canción", error);
        return null;
    }
}

async function getSongsServer(songsRequested) {
    try {
        const domainUrl = API_SERVER_MUSIC;

        const response = await fetch(`${domainUrl}get-songs`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ songsRequested })
        });
        return response.json();
    } catch (error) {
        console.error("Error cargando canciónes", error);
        return null;
    }

}

async function recommendation() {
    try {
        let response = await fetchRequest(
            'api/recommend/latest',
            'GET',
            null,
            true
        );

        
        
        let data;

        console.log(response);
        
        
        if (response.success) {
            console.log("2. Entra", response);
            data = response.data;
        } else {
            response = await fetchRequest(
                'api/recommend/generate',
                'GET',
                null,
                true
            );
            console.log("3. Entra", response)
            
            data = response.data;
        }

        console.log(data);
        
        
        return data;
    } catch (error) {
        console.error('Error al obtener la recomendacion', error);
    }
}

async function setSongs() {

    //data-artist="${song.artists.join(", ")}"

    const recomendation = await recommendation();
    const playlist = recomendation.result;

    window.finalSongs = playlist;

    window.dispatchEvent(
        new CustomEvent("playlistReady", {
            detail: playlist
        })
    );

    playlist.forEach((song, index) => {

        home += `
            <div class="col-12 mt-0">
                <div 
                    class="song-card glass-panel d-flex align-items-center gap-3"
                    data-index="${index}"
                    data-title="${song.title}"
                    data-artist="${song.artist}"
                    data-url="${song.uri}"
                    style="cursor:pointer"
                >

                    <img
                        src="../public/assets/img/defaultcover.png"
                        class="song-img"
                    />

                    <div class="flex-grow-1 overflow-hidden">
                        <div class="song-title text-truncate">
                            ${song.title}
                        </div>
                        <div class="song-artist text-truncate">
                            ${song.artist}
                        </div>
                    </div>

                    <i class="bi bi-play-circle-fill song-play"></i>

                </div>
            </div>
        `;
    })
}

/* Satisfaccion - IAE */
async function getIAE() {
    try {
        const response = await fetchRequest(
            `api/iae-survey/get-register`,
            'GET',
            null,
            true
        );
        return response;
    } catch (error) {

    }
}

async function setIAE() {
    const response = await getIAE();

    if (!response.success) {
        iae = `
            <div class="survey-container">
                        <div class="logo-section mb-3">
                            <h4 class="subtitle text-center">Evalúa tu experiencia musical</h4>
                        </div>

                        <form id="satisfactionForm">
                            <!-- Grid de preguntas M1 y M2 -->
                            <div class="questions-grid">
                                <!-- Pregunta 1: Claridad emocional (M1) -->
                                <div class="question-section">
                            
                                    <p class="question-description">
                                        1. ¿Qué tan bien entendió el sistema tu estado emocional?
                                    </p>
                                    <div class="scale-container" id="m1-scale">
                                        <div class="scale-option">
                                            <input type="radio" name="m1" id="m1-1" value="1">
                                            <label for="m1-1" class="scale-label">
                                                <span class="scale-number">1</span>
                                                <span class="scale-text">Nada</span>
                                            </label>
                                        </div>
                                        <div class="scale-option">
                                            <input type="radio" name="m1" id="m1-2" value="2">
                                            <label for="m1-2" class="scale-label">
                                                <span class="scale-number">2</span>
                                                <span class="scale-text">Poco</span>
                                            </label>
                                        </div>
                                        <div class="scale-option">
                                            <input type="radio" name="m1" id="m1-3" value="3">
                                            <label for="m1-3" class="scale-label">
                                                <span class="scale-number">3</span>
                                                <span class="scale-text">Regular</span>
                                            </label>
                                        </div>
                                        <div class="scale-option">
                                            <input type="radio" name="m1" id="m1-4" value="4">
                                            <label for="m1-4" class="scale-label">
                                                <span class="scale-number">4</span>
                                                <span class="scale-text">Bien</span>
                                            </label>
                                        </div>
                                        <div class="scale-option">
                                            <input type="radio" name="m1" id="m1-5" value="5">
                                            <label for="m1-5" class="scale-label">
                                                <span class="scale-number">5</span>
                                                <span class="scale-text">Perfecto</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div class="error-message" id="m1-error">
                                        Por favor, selecciona una opción para continuar
                                    </div>
                                </div>

                                <!-- Pregunta 2: Adecuación musical (M2) -->
                                <div class="question-section">
                                    
                                    <p class="question-description">
                                        2. ¿Qué tanto reflejó la música tu emoción?
                                    </p>
                                    <div class="scale-container" id="m2-scale">
                                        <div class="scale-option">
                                            <input type="radio" name="m2" id="m2-1" value="1">
                                            <label for="m2-1" class="scale-label">
                                                <span class="scale-number">1</span>
                                                <span class="scale-text">Nada</span>
                                            </label>
                                        </div>
                                        <div class="scale-option">
                                            <input type="radio" name="m2" id="m2-2" value="2">
                                            <label for="m2-2" class="scale-label">
                                                <span class="scale-number">2</span>
                                                <span class="scale-text">Poco</span>
                                            </label>
                                        </div>
                                        <div class="scale-option">
                                            <input type="radio" name="m2" id="m2-3" value="3">
                                            <label for="m2-3" class="scale-label">
                                                <span class="scale-number">3</span>
                                                <span class="scale-text">Regular</span>
                                            </label>
                                        </div>
                                        <div class="scale-option">
                                            <input type="radio" name="m2" id="m2-4" value="4">
                                            <label for="m2-4" class="scale-label">
                                                <span class="scale-number">4</span>
                                                <span class="scale-text">Bien</span>
                                            </label>
                                        </div>
                                        <div class="scale-option">
                                            <input type="radio" name="m2" id="m2-5" value="5">
                                            <label for="m2-5" class="scale-label">
                                                <span class="scale-number">5</span>
                                                <span class="scale-text">Perfecto</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div class="error-message" id="m2-error">
                                        Por favor, selecciona una opción para continuar
                                    </div>
                                </div>
                            </div>

                            <!-- Pregunta 3: Logro del objetivo emocional (M3) -->
                            <div class="question-section">

                                <p class="question-description">
                                    3. ¿Pudiste mantener o cambiar tu estado emocional como deseabas?
                                </p>

                                <div class="radio-container">

                                    <label class="radio-option">
                                        <input type="radio" name="m3" value="0">
                                        <span class="custom-radio"></span>
                                        No logré mi objetivo
                                    </label>

                                    <label class="radio-option">
                                        <input type="radio" name="m3" value="1">
                                        <span class="custom-radio"></span>
                                        Sí logré mi objetivo
                                    </label>

                                </div>

                                <div class="error-message" id="m3-error">
                                    Este campo es requerido
                                </div>

                            </div>

                            <button type="submit" class="submit-btn">
                                <i class="bi bi-check-circle"></i>
                                Enviar Evaluación
                            </button>
                        </form>

                        <!-- Resultado -->
                        <div class="result-card" id="resultCard" style="display: none;">
                            <div class="result-icon" id="resultIcon"></div>
                            <div class="result-title" id="resultTitle"></div>
                            <div class="result-description text-white" id="resultDescription"></div>
                            <div class="result-iae text-white" id="resultIAE"></div>
                            <p class="text-white" style="font-size: 14px; margin-top: 16px;">
                                ¡Gracias por tu retroalimentación! Nos ayuda a mejorar tu experiencia musical.
                            </p>
                        </div>
                    </div>
        `
        console.log("1", resultIAE, flag);
        flag = false;
        return;
    } else {
        iae = `
            <div class="result-card" id="resultCard">
                <div class="result-icon" id="resultIcon"></div>
                <div class="result-title" id="resultTitle">Resultados</div>
                <div class="result-description text-white" id="resultDescription"></div>
                <div class="result-iae text-white" id="resultIAE"></div>
                <p class="text-white" style="font-size: 14px; margin-top: 16px;">
                    ¡Gracias por tu retroalimentación! Nos ayuda a mejorar tu experiencia musical.
                </p>
            </div>
        `
        const { M1, M2, M3 } = response.data;
        resultIAE = calculateIAE(M1, M2, M3);
        flag = true;

        console.log("1", resultIAE, flag);

    }
}

window.cargarVista = async function (vista) {
    const appContent = document.getElementById("app-content");

    // Mostrar loader
    appContent.innerHTML = `
                <div class="text-white p-4 text-center">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </div>
            `;

    try {

        switch (vista) {
            case 'home':
                appContent.innerHTML = home;
                break;
            case 'iae':
                appContent.innerHTML = iae;

                requestAnimationFrame(() => {

                    if (flag && document.getElementById('resultCard')) {
                        showResult(resultIAE);
                    } else {
                        initIAELogic();
                    }
                });
                break;
            default:
                appContent.innerHTML = `<div class="text-white p-4 text-center">
                        <i class="bi bi-exclamation-triangle fs-1 mb-3"></i>
                        <p>Content Available Soon</p>
                    </div>`

        }


        /*if (vista === 'satisfaction') {
            // Verificar si ya completó la encuesta
            const surveyCompleted = localStorage.getItem('neurosound_survey_completed');
            const surveyData = localStorage.getItem('neurosound_survey_data');

            if (surveyCompleted === 'true' && surveyData) {
                // Mostrar mensaje de encuesta completada
                panel.innerHTML = contentTemplates.alreadyCompleted;

                // Mostrar el resultado previo
                const data = JSON.parse(surveyData);
                const previousIAE = document.getElementById('previousIAE');
                if (previousIAE && data.iae) {
                    previousIAE.innerHTML = `<strong>Tu IAE anterior:</strong> ${data.iae.toFixed(2)}`;
                }
            } else {
                // Mostrar formulario de encuesta
                panel.innerHTML = contentTemplates.satisfaction;
                initializeSurveyForm();
            }
        } else {
            // Cargar otras vistas desde archivos
            const response = await fetch(`../views/home/${vista}.html`);
            if (!response.ok) throw new Error('Error al cargar la vista');
            const html = await response.text();
            panel.innerHTML = html;
        }*/
        showMiniPlayer(vista)
        activarNavbar(vista);
    } catch (error) {
        console.error('Error cargando vista:', error);
        appContent.innerHTML = `
                    <div class="text-white p-4 text-center">
                        <i class="bi bi-exclamation-triangle fs-1 mb-3"></i>
                        <p>Content Available Soon</p>
                    </div>
                `;
    }
};

function showMiniPlayer(vista) {
    const miniPlayer = document.getElementById('mobile-player');

    if (vista !== 'home') {
        miniPlayer.style.display = 'none';
    } else {
        miniPlayer.style.display = 'flex';
    }
}

function activarNavbar(vista) {
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });
    const desktopNav = document.getElementById(`nav-${vista}`);
    if (desktopNav) desktopNav.classList.add('active');

    document.querySelectorAll('.nav-link-mobile').forEach(item => {
        item.classList.remove('active');
    });
    const mobileNav = document.getElementById(`mobile-nav-${vista}`);
    if (mobileNav) mobileNav.classList.add('active');
}

async function initApp() {
    await setIAE();
    await setSongs();
    cargarVista('home');
}

async function iaeRegister(data) {
    try {
        const response = await fetchRequest(
            'api/iae-survey/register',
            'POST',
            data,
            true
        );
        return response;
    } catch (error) {
        console.error("Error al guardar la encuesta", error);
        return null;
    }
}

export function initIAELogic() {

    const form = document.getElementById("satisfactionForm");

    form.addEventListener("submit", async e => {
        e.preventDefault();

        // Limpiar errores previos
        document.querySelectorAll('.error-message').forEach(el => {
            el.style.display = 'none';
        });
        document.querySelectorAll('.scale-container, .toggle-container, .star-rating-container').forEach(el => {
            el.style.borderColor = '';
        });

        // Validar M1
        const m1 = document.querySelector('input[name="m1"]:checked');
        if (!m1) {
            showError('m1');
            return;
        }

        // Validar M2
        const m2 = document.querySelector('input[name="m2"]:checked');
        if (!m2) {
            showError('m2');
            return;
        }

        // Obtener M3
        const m3 = document.querySelector('input[name="m3"]:checked');
        if (!m3) {
            showError('m3');
            return;
        }

        const M1 = Number(m1.value);
        const M2 = Number(m2.value)
        const M3 = Number(m3.value)

        const satisfaction = calculateIAE(M1, M2, M3);

        const dataIAE = {
            M1,
            M2,
            M3,
            satisfaction
        }


        const survey = await iaeRegister(dataIAE);

        if (!survey.success) {
            alert('Error al enviar la encuesta intentelo mas tarde');
        }

        setIAE();
        showResult(satisfaction);

    });



    function showError(field) {
        const errorEl = document.getElementById(`${field}-error`);
        const containerEl = document.getElementById(`${field}-scale`) ||
            document.querySelector('.toggle-container') ||
            document.getElementById('ux-rating');

        if (errorEl) errorEl.style.display = 'block';
        if (containerEl) containerEl.style.borderColor = '#ef4444';

        // Scroll suave al error
        containerEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }


}

// Calcular IAE
function calculateIAE(m1, m2, m3) {
    const iae = (m1 + m2 + (m3 * 5)) / 3;
    return iae;
}

// Mostrar resultado
function showResult(iae) {
    const form = document.getElementById('satisfactionForm');
    const resultCard = document.getElementById('resultCard');

    if (!resultCard) return;

    if (form) {
        form.style.display = 'none';
    }

    resultCard.style.display = 'block';

    const resultTitle = document.getElementById('resultTitle');
    const resultDescription = document.getElementById('resultDescription');
    const resultIAE = document.getElementById('resultIAE');

    if (iae >= 4) {
        resultTitle.textContent = '¡Excelente experiencia!';
        resultDescription.textContent =
            'Tu experiencia musical fue excepcional. El sistema funcionó perfectamente para tus necesidades.';

    } else if (iae >= 3) {
        resultTitle.textContent = 'Buena experiencia';
        resultDescription.textContent =
            'Tu experiencia fue positiva. Seguiremos mejorando para ofrecerte lo mejor.';

    } else {
        resultTitle.textContent = 'Necesitamos mejorar';
        resultDescription.textContent =
            'Lamentamos que la experiencia no haya sido la mejor. Tu feedback es muy valioso.';
    }

    resultIAE.innerHTML = `<strong>Tu IAE:</strong> ${iae.toFixed(2)} / 5.00`;

    // Scroll suave al resultado
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

initApp();