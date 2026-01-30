export const API_BASE_URL = 'https://neuro-sound.onrender.com/';
//export const API_BASE_URL = 'https://8nlqb9lj-5000.use2.devtunnels.ms/';
//export const API_BASE_URL = 'http://localhost:5000/';
export const API_SERVER_MUSIC = await getNameServerMusic();


async function getNameServerMusic() {
    try {
        const response = await fetchRequest(
            "api/server-music/get-domain",
            "GET",
        );
        return response.data[0].domainUrl;
    } catch (error) {
        console.error("Error cargando canción", error);
        return null;
    }
}

/**
 * Realiza una solicitud fetch a la API
 * 
 * @param {*} endpoint - endpoint de la API
 * @param {*} method - método HTTP (GET, POST, PUT, DELETE)
 * @param {*} data - datos a enviar en la solicitud
 * @param {*} auth - si se requiere autenticación
 * @returns 
 */
export async function fetchRequest(endpoint, method = 'GET', data = null, auth = false) {

    const url = `${API_BASE_URL}${endpoint}`;

    const headers = {
        'Content-Type': 'application/json'
    };

    if (auth) {
        const token = localStorage.getItem('token');
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
    }

    const options = { method, headers };

    if (data && ["POST", "PUT", "PATCH"].includes(method)) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        return await response.json();
    } catch (error) {
        console.error("Fetch error:", error);
        return {
            success: false,
            status: 0,
            message: "Unable to connect to the server"
        };
    }
}