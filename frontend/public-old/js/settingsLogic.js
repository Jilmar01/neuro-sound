/* ==========================================
   js/settingsLogic.js
   Lógica para la vista de Ajustes
   ========================================== */

function initSettingsView() {
    console.log("⚙️ Inicializando vista de Ajustes...");

    // 1. CAPTURAR EL TOKEN QUE VIENE DE LA URL (SPOTIFY)
    const urlParams = new URLSearchParams(window.location.search);
    const incomingToken = urlParams.get('token');

    if (incomingToken) {
        console.log("🟢 Token de Spotify detectado. Guardando y redirigiendo...");
        
        // A. Guardamos el token
        localStorage.setItem('spotifyToken', incomingToken);

        // B. Construimos la URL limpia (Protocolo + Dominio + Ruta, sin parámetros)
        // Ejemplo: http://localhost:5000/ajustes.html
        const cleanUrl = window.location.origin + window.location.pathname;

        // C. Forzamos al navegador a ir a esa URL limpia
        window.location.href = cleanUrl;
        
        // D. Detenemos la ejecución aquí para que no cargue nada más antes de irse
        return; 
    }

    // Si NO hay token en la URL, el código sigue normal:
    loadUserProfile();
    checkSpotifyStatus();
}

async function loadUserProfile() {
    console.log("📡 Solicitando datos de perfil...");

    // 1. Recuperamos el Token del login (Nuestra llave de acceso)
    const token = localStorage.getItem('token');

    if (!token) {
        console.warn("⚠️ No hay token. Usuario no logueado.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/user/data`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            }
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                console.error("Token caducado. Cerrando sesión...");
                localStorage.removeItem('token');
                window.location.href = 'login.html';
                return;
            }
            throw new Error(data.message || "Error al obtener perfil");
        }

        const user = data.data || data;
        console.log("✅ Datos recibidos:", user);

        localStorage.setItem('userData', JSON.stringify(user));
        actualizarDOM(user);

    } catch (error) {
        console.error("❌ Error de red o servidor:", error);
        const cached = localStorage.getItem('userData');
        if (cached) actualizarDOM(JSON.parse(cached));
    }
}

// --- FUNCIÓN PARA PINTAR LOS DATOS ---
function actualizarDOM(user) {
    const inputName = document.getElementById('inputName');
    if (inputName) inputName.value = user.name || "";

    const inputLastName = document.getElementById('inputLastName');
    if (inputLastName) inputLastName.value = user.last_name || "";

    const inputEmail = document.getElementById('inputEmail');
    if (inputEmail) inputEmail.value = user.email || "";

    const displayElement = document.getElementById('profileNameDisplay');
    if (displayElement) displayElement.innerText = `${user.name} ${user.last_name || ""}`;

    if (user.photo) {
        const container = document.getElementById('avatarContainer');
        const icon = document.getElementById('defaultAvatarIcon');
        if (container && icon) {
            icon.style.display = 'none';
            container.style.backgroundImage = `url('${user.photo}')`;
        }
    }
}

// --- FUNCIONES DE SPOTIFY ---
function checkSpotifyStatus() {
    const savedToken = localStorage.getItem('spotifyToken');
    const btn = document.getElementById('btn-spotify-connect');
    const statusText = document.getElementById('spotify-status-text');
    const indicator = document.getElementById('status-indicator');

    if (!btn) return;

    if (savedToken) {
        btn.classList.add('connected');
        btn.innerHTML = '<i class="bi bi-check-circle-fill"></i> Desconectar';
        btn.classList.remove('btn-spotify');
        btn.classList.add('btn-outline-success');
        
        if(statusText) statusText.innerText = "Conectado";
        if(indicator) {
            indicator.style.backgroundColor = "#198754";
            indicator.style.boxShadow = "0 0 5px #198754";
        }
    } else {
        btn.classList.remove('connected', 'btn-outline-success');
        btn.classList.add('btn-spotify');
        btn.innerHTML = '<i class="bi bi-spotify"></i><span> Conectar Spotify</span>';
        
        if(statusText) statusText.innerText = "No conectado";
        if(indicator) {
            indicator.style.backgroundColor = "#dc3545"; // Rojo
            indicator.style.boxShadow = "none";
        }
    }
}

function toggleSpotify() {
    const btn = document.getElementById('btn-spotify-connect');
    
    if (btn.classList.contains('connected')) {
        // 👇 MODIFICACIÓN: Desvincular y recargar página
        localStorage.removeItem('spotifyToken');
        console.log("🔴 Desvinculando Spotify y recargando...");
        window.location.reload(); 

    } else {
        // Redirigir al Auth de Spotify
        const baseUrl = (typeof API_BASE_URL !== 'undefined') ? API_BASE_URL : "http://127.0.0.1:5000";
        window.location.href = `${baseUrl}/api/spotify/login`;
    }
}

// Función para previsualizar imagen al subirla
function previewImage(event) {
    const input = event.target;
    const container = document.getElementById('avatarContainer');
    const icon = document.getElementById('defaultAvatarIcon');

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            if(icon) icon.style.display = 'none';
            container.style.backgroundImage = `url('${e.target.result}')`;
        }
        reader.readAsDataURL(input.files[0]);
    }
}