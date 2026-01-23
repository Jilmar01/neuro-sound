/* ======================================================
   ROUTER.JS
   Maneja la navegación sin recargar la página (SPA)
   ====================================================== */

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

    // --- VISTA SETTINGS (TU DISEÑO EXACTO) ---
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
                                <!--button class="btn btn-sm btn-light rounded-circle position-absolute d-flex align-items-center justify-content-center p-0" 
                                        style="width: 28px; height: 28px; bottom: -2px; right: -2px; border: 2px solid #6c5ce7; z-index: 10;"
                                        onclick="document.getElementById('avatarUpload').click();">
                                    <i class="bi bi-pencil-fill text-dark" style="font-size: 0.7rem;"></i>
                                </button-->
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
                        <div class="col-12 mt-4 text-end">
                            <!--button type="button" class="btn btn-light rounded-pill px-4 fw-bold text-primary">Guardar Cambios</button-->
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
    `
};

// 2. FUNCIÓN PRINCIPAL DE NAVEGACIÓN
/* js/router.js */

// ... (Tus vistas VISTAS se quedan igual) ...

async function cargarVista(nombreVista) {
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
        if(typeof initSpotifySearch === 'function') {
            initSpotifySearch();
        }
    }

    if (nombreVista === 'settings') {
        if(typeof initSettingsView === 'function') initSettingsView();
    }
    if (nombreVista === 'charts') {
        initChartsLogic();
    }
    
}

// --- NUEVA FUNCIÓN PARA PINTAR EL BOTÓN ACTIVO ---
function actualizarMenu(vista) {
    // ==========================================
    // 1. LÓGICA DE ESCRITORIO (Sidebar)
    // ==========================================
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });

    const idBotonDesktop = `nav-${vista}`; 
    const botonDesktop = document.getElementById(idBotonDesktop);

    if (botonDesktop) {
        botonDesktop.classList.add('active');
    }

    // ==========================================
    // 2. LÓGICA MÓVIL (Navbar inferior)
    // ==========================================
    
    // A. Reseteamos TODOS los botones móviles a blanco (estado inactivo)
    document.querySelectorAll('.nav-link-mobile').forEach(item => {
        // Quitamos color de activo (ej: azul cyan)
        item.classList.remove('text-info', 'fw-bold'); 
        // Ponemos color blanco (inactivo)
        item.classList.add('text-white'); 
    });

    // B. Activamos el botón específico
    const idBotonMobile = `mobile-nav-${vista}`;
    const botonMobile = document.getElementById(idBotonMobile);

    if (botonMobile) {
        // Quitamos blanco
        botonMobile.classList.remove('text-white');
        // Ponemos color activo (Bootstrap text-info es cyan, o usa text-primary)
        botonMobile.classList.add('text-info', 'fw-bold');
    }
}

// ...
function initChartsLogic() {
    const canvas = document.getElementById('genreChart');
    if (!canvas) return; // Seguridad extra

    const ctx = canvas.getContext('2d');
    
    // Destruir chart previo si existe para evitar superposiciones (bug común en SPAs)
    if (window.myGenreChart) {
        window.myGenreChart.destroy();
    }

    window.myGenreChart = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: ['Lo-fi', 'Pop', 'Rock', 'Reggae', 'Rap'],
            datasets: [{
                label: 'Nivel',
                data: [5, 3, 2, 2.5, 1.5],
                backgroundColor: [
                    'rgba(77, 182, 172, 0.7)', // Lo-fi (con transparencia)
                    'rgba(84, 110, 122, 0.7)', // Pop
                    'rgba(141, 110, 99, 0.7)', // Rock
                    'rgba(255, 241, 118, 0.7)', // Reggae
                    'rgba(255, 204, 128, 0.7)'  // Rap
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
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }, // Grid sutil blanco
                    pointLabels: {
                        display: true,
                        centerPointLabels: true,
                        font: { size: 11, weight: 'bold' },
                        color: 'white' // Texto blanco
                    }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. VERIFICAR SI VENIMOS DE SPOTIFY (TOKEN EN URL)
    const urlParams = new URLSearchParams(window.location.search);
    
    // CORRECCIÓN: Buscamos los nombres exactos que envía tu nuevo backend
    const accessToken = urlParams.get('access_token');   // Antes buscabas 'token'
    const refreshToken = urlParams.get('refresh_token'); // ¡Nuevo e importante!

    // A veces el backend antiguo enviaba 'token', mantenemos compatibilidad por si acaso:
    const finalToken = accessToken || urlParams.get('token');

    if (finalToken) {
        console.log("🚨 Router: Tokens detectados. Guardando y limpiando...");
        
        // A. Guardar Access Token
        localStorage.setItem('spotifyToken', finalToken);

        // B. Guardar Refresh Token (CRUCIAL para que api.js renueve la sesión)
        if (refreshToken) {
            localStorage.setItem('spotifyRefreshToken', refreshToken);
        }

        // C. Guardar marca para redirigir tras recarga
        localStorage.setItem('postLoginRedirect', 'settings'); // O 'home', según prefieras

        // D. FORZAR RECARGA LIMPIA
        // Esto elimina los tokens de la barra de direcciones y recarga la app
        // para que todos los módulos (Player, Api) lean los tokens frescos del localStorage.
        window.location.href = window.location.origin + window.location.pathname;
        
        return; // 🛑 Detenemos ejecución aquí
    }

    // 2. VERIFICAR SI ACABAMOS DE RECARGAR POR LOGIN
    const redirectView = localStorage.getItem('postLoginRedirect');
    
    if (redirectView) {
        console.log(`↪️ Volviendo a ${redirectView} después del login...`);
        localStorage.removeItem('postLoginRedirect'); 
        cargarVista(redirectView);
    } else {
        // 3. CARGA NORMAL
        cargarVista('home');
    }
});