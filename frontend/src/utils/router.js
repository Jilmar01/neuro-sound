/* ======================================================
   ROUTER.JS
   Maneja la navegación sin recargar la página (SPA)
   ====================================================== */
import {obtenerRecomendaciones, setOnContainer} from "/js/recomendations.js"
import {apiCall} from "/js/refactored/fetch.js"

// 1. DEFINICIÓN DE LAS VISTAS (HTML EN STRING)
const VISTAS = {
    
    // --- VISTA HOME (EXPLORAR) ---
    home: `
        <h2 class="mb-3">Explorar</h2>
        <div class="row g-3" id="mainPanel">
            <div class="text-center mt-5">
                <div class="spinner-border text-light" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
            </div>
        </div>
        <div id="spotifySearchResults" class="mt-4"></div>
    `,
    charts:`
        <iframe src="chartsiframe.html" class="w-100 h-100 border-0" style="display: block;"></iframe>
    `,

    // --- VISTA SETTINGS ---
    settings: `
        <h1 class="mb-4 fs-5 fw-bold text-white">Configuración de Cuenta</h1>
        <div class="row g-4">
            
            <div class="col-12 col-lg-7">
                <div class="glass-panel p-4 h-100" style="background: rgba(255,255,255,0.05);">
                    <h5 class="mb-4 border-bottom border-light border-opacity-25 pb-2">
                        <i class="bi bi-person-badge me-2"></i>Información Personal
                    </h5>
                    
                    <div class="row align-items-center mb-4">
                        <div class="col-auto">
                            <div class="position-relative d-inline-block">
                                <div id="avatarContainer" style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; overflow: hidden; background-size: cover; background-position: center;">
                                    <i id="defaultAvatarIcon" class="bi bi-person-fill fs-1"></i>
                                </div>
                                <input type="file" id="avatarUpload" accept="image/*" style="display: none;" onchange="previewImage(event)">
                            </div>
                        </div>
                        <div class="col">
                            <h4 id="profileNameDisplay" class="mb-0">Usuario</h4>
                            <span class="text-white-50 small">Miembro de Neuro-Sound</span>
                        </div>
                    </div>

                    <form class="row g-3">
                        <div class="col-md-6">
                            <label class="small text-white-50">Nombre</label>
                            <input type="text" id="inputName" class="form-control form-control-glass" readonly placeholder="Tu nombre">
                        </div>
                        <div class="col-md-6">
                            <label class="small text-white-50">Apellido</label>
                            <input type="text" id="inputLastName" class="form-control form-control-glass" readonly placeholder="Tu apellido">
                        </div>
                        <div class="col-12">
                            <label class="small text-white-50">Email</label>
                            <input type="email" id="inputEmail" class="form-control form-control-glass" readonly value="cargando...">
                            <div class="form-text text-white-50 small" style="font-size: 0.7em;">
                                * El email no se puede cambiar por seguridad.
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <div class="col-12 col-lg-5">
                <div class="glass-panel p-4 h-100" style="background: rgba(255,255,255,0.05);">
                    <h5 class="mb-4 border-bottom border-light border-opacity-25 pb-2">
                        <i class="bi bi-link-45deg me-2"></i>Integraciones
                    </h5>
                    
                    <div class="p-3 rounded mb-3" style="background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1);">
                        <div class="d-flex align-items-center justify-content-between mb-3">
                            <div class="d-flex align-items-center gap-3">
                                <i class="bi bi-spotify text-success" style="font-size: 2.5rem;"></i>
                                <div>
                                    <h6 class="m-0 fw-bold">Spotify</h6>
                                    <span class="small text-white-50" id="spotify-status-text">Verificando...</span>
                                </div>
                            </div>
                            <div id="status-indicator" style="width: 10px; height: 10px; background-color: #6c757d; border-radius: 50%; box-shadow: none;"></div>
                        </div>
                        
                        <button class="btn btn-spotify w-100 justify-content-center" id="btn-spotify-connect" onclick="toggleSpotify()">
                            <i class="bi bi-spotify"></i><span> Conectar Spotify</span>
                        </button>
                    </div>
                    <p><small>Debes tener una cuenta premium para utilizar correctamente la api</small></p>
                </div>
            </div>
        </div>
    `,
    
    // --- VISTA IAE (ENCUESTA DE SATISFACCIÓN) ---
    iae: `
        <style>
            /* ESTILOS ESPECÍFICOS PARA LA ENCUESTA IAE */
            .survey-container { max-width: 600px; margin: 0 auto; padding-bottom: 80px; }
            .subtitle { font-weight: 300; margin-bottom: 30px; color: rgba(255,255,255,0.9); }
            
            .question-section {
                background: rgba(255, 255, 255, 0.05);
                backdrop-filter: blur(10px);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 20px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .question-description { font-size: 1.1rem; margin-bottom: 20px; font-weight: 500; }
            
            /* ESCALA 1-5 */
            .scale-container { display: flex; justify-content: space-between; padding: 0 10px; }
            .scale-option { text-align: center; position: relative; width: 18%; }
            .scale-option input[type="radio"] { opacity: 0; position: absolute; width: 100%; height: 100%; cursor: pointer; z-index: 2; margin: 0; }
            
            .scale-label {
                display: flex;
                flex-direction: column;
                align-items: center;
                transition: all 0.3s ease;
                opacity: 0.6;
            }
            .scale-number {
                width: 40px; height: 40px;
                border-radius: 50%;
                background: rgba(255,255,255,0.1);
                display: flex; align-items: center; justify-content: center;
                font-size: 1.2rem; font-weight: bold;
                margin-bottom: 8px;
                border: 2px solid transparent;
            }
            .scale-text { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; }

            /* ESTADOS ACTIVOS ESCALA */
            .scale-option input:checked + .scale-label { opacity: 1; transform: scale(1.1); }
            .scale-option input:checked + .scale-label .scale-number {
                background: var(--bs-info); color: #000; box-shadow: 0 0 15px rgba(13, 202, 240, 0.5);
            }

            /* PREGUNTA 3 (RADIO BUTTONS) */
            .radio-container { display: flex; flex-direction: column; gap: 12px; }
            .radio-option {
                position: relative;
                display: flex; align-items: center;
                padding: 12px 16px;
                background: rgba(255,255,255,0.03);
                border-radius: 8px;
                cursor: pointer;
                transition: background 0.2s;
            }
            .radio-option:hover { background: rgba(255,255,255,0.08); }
            .radio-option input { opacity: 0; position: absolute; }
            
            .custom-radio {
                width: 20px; height: 20px;
                border: 2px solid rgba(255,255,255,0.5);
                border-radius: 50%;
                margin-right: 12px;
                position: relative;
            }
            .radio-option input:checked ~ .custom-radio { border-color: var(--bs-info); }
            .radio-option input:checked ~ .custom-radio::after {
                content: ''; position: absolute;
                top: 50%; left: 50%; transform: translate(-50%, -50%);
                width: 10px; height: 10px;
                background: var(--bs-info); border-radius: 50%;
            }

            /* BOTÓN ENVIAR */
            .submit-btn {
                width: 100%; padding: 15px;
                background: linear-gradient(45deg, #0dcaf0, #0d6efd);
                border: none; border-radius: 50px;
                color: white; font-size: 1.1rem; font-weight: bold;
                margin-top: 10px;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(13, 202, 240, 0.4); }

            /* ERRORES */
            .error-message {
                display: none; color: #ff6b6b; font-size: 0.85rem;
                margin-top: 8px; padding-left: 5px; border-left: 2px solid #ff6b6b;
            }

            /* RESULTADO */
            .result-card {
                background: rgba(255, 255, 255, 0.05);
                backdrop-filter: blur(15px);
                border-radius: 16px;
                padding: 30px;
                text-align: center;
                border: 1px solid rgba(255,255,255,0.1);
                animation: fadeIn 0.5s ease-out;
            }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        </style>

        <div class="survey-container fade-in">
            <div class="logo-section mb-3">
                <h4 class="subtitle text-center">Evalúa tu experiencia musical</h4>
            </div>

            <form id="satisfactionForm">
                <div class="questions-grid">
                    
                    <div class="question-section">
                        <p class="question-description">1. ¿Qué tan bien entendió el sistema tu estado emocional?</p>
                        <div class="scale-container" id="m1-scale">
                            ${[1,2,3,4,5].map(i => `
                                <div class="scale-option">
                                    <input type="radio" name="m1" id="m1-${i}" value="${i}">
                                    <label for="m1-${i}" class="scale-label">
                                        <span class="scale-number">${i}</span>
                                        <span class="scale-text">${['Nada','Poco','Regular','Bien','Perfecto'][i-1]}</span>
                                    </label>
                                </div>`).join('')}
                        </div>
                        <div class="error-message" id="m1-error">Por favor, selecciona una opción.</div>
                    </div>

                    <div class="question-section">
                        <p class="question-description">2. ¿Qué tanto reflejó la música tu emoción?</p>
                        <div class="scale-container" id="m2-scale">
                            ${[1,2,3,4,5].map(i => `
                                <div class="scale-option">
                                    <input type="radio" name="m2" id="m2-${i}" value="${i}">
                                    <label for="m2-${i}" class="scale-label">
                                        <span class="scale-number">${i}</span>
                                        <span class="scale-text">${['Nada','Poco','Regular','Bien','Perfecto'][i-1]}</span>
                                    </label>
                                </div>`).join('')}
                        </div>
                        <div class="error-message" id="m2-error">Por favor, selecciona una opción.</div>
                    </div>

                    <div class="question-section">
                        <p class="question-description">3. ¿Pudiste mantener o cambiar tu estado emocional como deseabas?</p>
                        <div class="radio-container">
                            <label class="radio-option">
                                <input type="radio" name="m3" value="0">
                                <span class="custom-radio"></span> No logré mi objetivo
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="m3" value="1">
                                <span class="custom-radio"></span> Sí logré mi objetivo
                            </label>
                        </div>
                        <div class="error-message" id="m3-error">Este campo es requerido.</div>
                    </div>
                </div>

                <button type="submit" class="submit-btn">
                    <i class="bi bi-check-circle me-2"></i>Enviar Evaluación
                </button>
            </form>

            <div class="result-card" id="resultCard" style="display: none;">
                <div class="result-icon" id="resultIcon"></div>
                <div class="result-title" id="resultTitle"></div>
                <div class="result-description mt-2 text-white-50" id="resultDescription"></div>
                <div class="result-iae" id="resultIAE"></div>
                <p class="text-white small mt-4">¡Gracias por tu retroalimentación! Nos ayuda a mejorar.</p>
                <button class="btn btn-outline-light mt-3 rounded-pill px-4" onclick="cargarVista('home')">Volver al Inicio</button>
            </div>
        </div>
    `
};

// 2. FUNCIÓN PRINCIPAL DE NAVEGACIÓN
export async function cargarVista(nombreVista) {
    const contenedor = document.getElementById('app-content');
    if (!VISTAS[nombreVista]) return;

    // 1. Inyectar HTML
    contenedor.innerHTML = VISTAS[nombreVista];

    // 2. ACTUALIZAR EL MENÚ (SIDEBAR) 🎨
    actualizarMenu(nombreVista);

    // 3. Lógica específica
    if (nombreVista === 'home') {
        if(typeof obtenerRecomendaciones === 'function') {
            const canciones = await obtenerRecomendaciones();
            if (typeof setOnContainer === 'function') setOnContainer(canciones);
        }
        if(typeof initSpotifySearch === 'function') initSpotifySearch();
    }

    if (nombreVista === 'settings') {
        if(typeof initSettingsView === 'function') initSettingsView();
    }
    
    // 👇 AQUÍ CONECTAMOS LA LÓGICA DE LA ENCUESTA
    if (nombreVista === 'iae') {
        initIAEForm();
    }

    if (nombreVista === 'charts') {
        initChartsLogic();
    }
}

// ==========================================
// 🧠 LÓGICA DE LA ENCUESTA IAE (Integrada)
// ==========================================
// ... imports ...

function initIAEForm() {
    console.log("🚀 Inicializando Encuesta IAE...");
    const form = document.getElementById('satisfactionForm');
    if (!form) return;

    // A. Limpieza de errores
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const errorDiv = document.getElementById(`${e.target.name}-error`);
            if (errorDiv) errorDiv.style.display = 'none';
        });
    });

    // B. Envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // 1. Obtener valores DOM
        const m1Input = document.querySelector('input[name="m1"]:checked');
        const m2Input = document.querySelector('input[name="m2"]:checked');
        const m3Input = document.querySelector('input[name="m3"]:checked');

        // 2. Validación
        let isValid = true;
        if (!m1Input) { document.getElementById('m1-error').style.display = 'block'; isValid = false; }
        if (!m2Input) { document.getElementById('m2-error').style.display = 'block'; isValid = false; }
        if (!m3Input) { document.getElementById('m3-error').style.display = 'block'; isValid = false; }

        if (!isValid) return;

        // 3. Obtener valores numéricos
        const v1 = parseInt(m1Input.value); // 1 a 5
        const v2 = parseInt(m2Input.value); // 1 a 5
        const v3 = parseInt(m3Input.value); // 0 o 1

        // 4. Calcular Satisfaction (Lógica deducida de tu ejemplo)
        // Si M3 es 1 (logró objetivo), cuenta como 5 puntos. Si es 0, cuenta como 1 punto.
        const v3Score = (v3 === 1) ? 5 : 1; 
        const satisfactionScore = (v1 + v2 + v3Score) / 3;

        // Score porcentual para la vista visual (0-100%)
        const visualScore = (satisfactionScore / 5) * 100;

        // 5. Mostrar Resultado Visual (UI)
        const resultCard = document.getElementById('resultCard');
        
        // Determinar textos e iconos
        let icon = '', title = '', desc = '', colorClass = '';
        if (visualScore >= 80) {
            icon = '<i class="bi bi-emoji-laughing-fill" style="color: #4CAF50; font-size: 3rem;"></i>';
            title = '¡Excelente Sincronización!';
            desc = 'El sistema entendió perfectamente tu estado.';
            colorClass = 'text-success';
        } else if (visualScore >= 50) {
            icon = '<i class="bi bi-emoji-smile-fill" style="color: #FFC107; font-size: 3rem;"></i>';
            title = 'Experiencia Positiva';
            desc = 'La música fue adecuada, aunque podemos mejorar.';
            colorClass = 'text-warning';
        } else {
            icon = '<i class="bi bi-emoji-frown-fill" style="color: #F44336; font-size: 3rem;"></i>';
            title = 'Necesitamos Mejorar';
            desc = 'La música no se alineó con lo que sentías.';
            colorClass = 'text-danger';
        }

        if (v3 === 0) desc += ' <br><small>(Nota: No lograste tu objetivo emocional).</small>';

        // Pintar en pantalla
        document.getElementById('resultIcon').innerHTML = icon;
        document.getElementById('resultTitle').innerHTML = `<h3 class="${colorClass} fw-bold">${title}</h3>`;
        document.getElementById('resultDescription').innerHTML = desc;
        document.getElementById('resultIAE').innerHTML = `
            <div class="mt-3 p-3 rounded d-inline-block" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2)">
                <h1 class="mb-0 fw-bold text-white">${Math.round(visualScore)}%</h1>
                <small class="text-white-50">Satisfacción: ${satisfactionScore.toFixed(2)}</small>
            </div>
        `;

        form.style.display = 'none';
        resultCard.style.display = 'block';
        
        // 6. PREPARAR PAYLOAD (Estructura Correcta)
        const payload = {
            "M1": v1,
            "M2": v2,
            "M3": v3,
            "satisfaction": satisfactionScore
        };

        // Enviar al Backend
        sendIAEToBackend(payload);
    });
}

// 👇 FUNCIÓN FETCH CORREGIDA
async function sendIAEToBackend(data) {
    console.log("📤 Enviando IAE al backend:", data);
    try {
        // Asegúrate que 'neuro' es la key correcta en tu fetch.js y la ruta empieza con /
        const response = await apiCall('neuro', '/api/iae-survey/get-register', 'POST', data);
        console.log("✅ IAE guardado con éxito:", response);
    } catch (error) {
        console.error("❌ Error al guardar IAE:", error);
    }
}

// --- FUNCIÓN PARA PINTAR EL BOTÓN ACTIVO ---
function actualizarMenu(vista) {
    // 1. Desktop Sidebar
    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
    const botonDesktop = document.getElementById(`nav-${vista}`); 
    if (botonDesktop) botonDesktop.classList.add('active');

    // 2. Mobile Navbar
    document.querySelectorAll('.nav-link-mobile').forEach(item => {
        item.classList.remove('text-info', 'fw-bold'); 
        item.classList.add('text-white'); 
    });
    const botonMobile = document.getElementById(`mobile-nav-${vista}`);
    if (botonMobile) {
        botonMobile.classList.remove('text-white');
        botonMobile.classList.add('text-info', 'fw-bold');
    }
}

// --- CHARTS LOGIC ---
function initChartsLogic() {
    const canvas = document.getElementById('genreChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (window.myGenreChart) window.myGenreChart.destroy();

    window.myGenreChart = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: ['Lo-fi', 'Pop', 'Rock', 'Reggae', 'Rap'],
            datasets: [{
                label: 'Nivel',
                data: [5, 3, 2, 2.5, 1.5],
                backgroundColor: [
                    'rgba(77, 182, 172, 0.7)', 
                    'rgba(84, 110, 122, 0.7)', 
                    'rgba(141, 110, 99, 0.7)', 
                    'rgba(255, 241, 118, 0.7)', 
                    'rgba(255, 204, 128, 0.7)'
                ],
                borderWidth: 1,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    ticks: { display: false, backdropColor: 'transparent' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    pointLabels: {
                        display: true,
                        centerPointLabels: true,
                        font: { size: 11, weight: 'bold' },
                        color: 'white'
                    }
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    // 1. VERIFICAR SI VENIMOS DE SPOTIFY (TOKEN EN URL)
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const finalToken = accessToken || urlParams.get('token');

    if (finalToken) {
        console.log("🚨 Router: Tokens detectados. Guardando y limpiando...");
        localStorage.setItem('spotifyToken', finalToken);
        if (refreshToken) localStorage.setItem('spotifyRefreshToken', refreshToken);
        localStorage.setItem('postLoginRedirect', 'settings'); 

        window.location.href = window.location.origin + window.location.pathname;
        return; 
    }

    // 2. VERIFICAR REDIRECCIÓN POST-LOGIN
    const redirectView = localStorage.getItem('postLoginRedirect');
    
    if (redirectView) {
        console.log(`↪️ Volviendo a ${redirectView} después del login...`);
        localStorage.removeItem('postLoginRedirect'); 
        cargarVista(redirectView);
    } else {
        cargarVista('home');
    }
});
window.cargarVista = cargarVista;