/* =========================================
   ARCHIVO DE CONFIGURACIÓN GLOBAL
   ========================================= */

const USE_TUNNEL = true; // true para Celular | false para PC
const MY_LOCAL_IP = "192.168.18.9"; 

const CONFIG = {
    LOCAL: {
        API_URL: "https://neuro-sound.onrender.com",
        STREAM_URL: "http://127.0.0.1:5001",
        FRONTEND_URL: "http://127.0.0.1:3000"
    },
    TUNNEL: {
        API_URL: "https://neuro-sound.onrender.com",
        STREAM_URL: "https://t6b802qq-5001.use.devtunnels.ms",
        FRONTEND_URL: `http://${MY_LOCAL_IP}:3000`
    }
};

const ENV = USE_TUNNEL ? CONFIG.TUNNEL : CONFIG.LOCAL;

const API_BASE_URL = ENV.API_URL;
const FRONTEND_BASE_URL = ENV.FRONTEND_URL;

// --- CORRECCIÓN AQUÍ ---
// 1. Intentamos leer del almacenamiento local, si no existe, usamos la del config
let STREAM_BASE_URL = localStorage.getItem('savedStreamURL') || ENV.STREAM_URL;

// Función para actualizar y guardar
function updateStreamURL() {
    const inputElement = document.getElementById("urlupdate");
    if (inputElement) {
        const newURL = inputElement.value;
        
        // Guardamos en la memoria persistente del navegador
        localStorage.setItem('savedStreamURL', newURL);
        
        // Actualizamos la variable actual
        STREAM_BASE_URL = newURL;
        
        alert(`Guardado correctamente: ${STREAM_BASE_URL}`);
        console.log(`🎵 Stream actualizado y guardado: ${STREAM_BASE_URL}`);
    } else {
        console.error("No se encontró el input 'urlupdate'");
    }
}

// Función extra (opcional) para borrar la config y volver al default
function resetStreamURL() {
    localStorage.removeItem('savedStreamURL');
    STREAM_BASE_URL = ENV.STREAM_URL;
    alert("URL reseteada a la configuración por defecto.");
    location.reload(); // Recarga para aplicar cambios
}

console.log(`🌍 Entorno: ${USE_TUNNEL ? 'MÓVIL (Tunnel)' : 'PC (Local)'}`);
console.log(`🎵 Stream actual: ${STREAM_BASE_URL}`);