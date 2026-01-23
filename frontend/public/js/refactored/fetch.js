// ---------------------------------------------------------
// 1. CONFIGURACIÓN
// ---------------------------------------------------------
const SERVERS = {
    'neuro': {
        baseUrl: 'https://neuro-sound.onrender.com', // Tu Backend
        tokenKey: 'token'
    },
    'spotify': {
        baseUrl: 'https://api.spotify.com/v1', // Tu Proxy/Spotify
        tokenKey: 'spotifyToken'
    }
};

// Variable de control para evitar que 10 peticiones intenten refrescar a la vez
let isRefreshing = false;

// ---------------------------------------------------------
// 2. FUNCIÓN DE REFRESCO (La Magia)
// ---------------------------------------------------------
async function refreshSpotifySession() {
    const refreshToken = localStorage.getItem('spotifyRefreshToken');
    
    if (!refreshToken) {
        throw new Error("No hay refresh token. Inicia sesión nuevamente.");
    }

    console.log("Token caducado. Solicitando renovación al Backend...");

    try {
        // Llamamos a TU backend, ruta: /api/spotify/refresh
        const response = await fetch('https://neuro-sound.onrender.com/api/spotify/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken })
        });

        if (!response.ok) throw new Error("Fallo al renovar token en el servidor");

        const data = await response.json();

        // Guardamos los nuevos tokens
        localStorage.setItem('spotifyToken', data.access_token);
        
        // Si el backend nos dio un refresh token nuevo, lo actualizamos. Si no, mantenemos el viejo.
        if (data.refresh_token) {
            localStorage.setItem('spotifyRefreshToken', data.refresh_token);
        }

        console.log("Token renovado y guardado.");
        return data.access_token;

    } catch (error) {
        console.error("Error fatal renovando sesión:", error);
        // Si falla el refresh (ej. usuario revocó permiso), cerramos sesión por seguridad
        localStorage.removeItem('spotifyToken');
        localStorage.removeItem('spotifyRefreshToken');
        window.location.href = 'index.html'; // O tu pantalla de login
        throw error;
    }
}

// ---------------------------------------------------------
// 3. LA FUNCIÓN FETCH MAESTRA
// ---------------------------------------------------------
export async function apiCall(serverName, endpoint, method, body = null) {
    
    const config = SERVERS[serverName];
    if (!config) throw new Error(`Servidor "${serverName}" no configurado.`);

    // Preparar URL y Token inicial
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${config.baseUrl}${cleanEndpoint}`;
    let token = localStorage.getItem(config.tokenKey);

    // Preparar Headers
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const fetchOptions = {
        method: method.toUpperCase(),
        headers: headers
    };
    if (body && method.toUpperCase() !== 'GET') {
        fetchOptions.body = JSON.stringify(body);
    }

    // LOG DE DEPURACIÓN
    // console.log(`🚀 [${serverName}] ${method} ${url}`);

    try {
        // --- INTENTO 1: Petición Normal ---
        let response = await fetch(url, fetchOptions);

        // --- INTERCEPTOR DE ERROR 401 (Solo para Spotify) ---
        if (response.status === 401 && serverName === 'spotify') {
            
            if (isRefreshing) {
                // Si ya se está refrescando, podríamos poner una lógica de espera aquí,
                // pero por simplicidad lanzamos error para reintentar luego.
                console.warn("⏳ Esperando a que termine el refresh actual...");
            } else {
                isRefreshing = true; // Bloqueamos

                try {
                    // 1. Pedimos nuevo token
                    const newToken = await refreshSpotifySession();

                    // 2. Actualizamos el header de la petición fallida con el nuevo token
                    fetchOptions.headers['Authorization'] = `Bearer ${newToken}`;

                    // 3. Reintentamos la petición original
                    console.log("🔁 Reintentando petición original...");
                    response = await fetch(url, fetchOptions);

                } catch (refreshError) {
                    throw refreshError; // Si falla el refresh, fallamos todo
                } finally {
                    isRefreshing = false; // Desbloqueamos
                }
            }
        }

        if (response.status === 204) return null;

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || data.error?.message || `Error HTTP ${response.status}`);
        }

        return data;

    } catch (error) {
        console.error(`Error en petición (${serverName}):`, error);
        throw error;
    }
}