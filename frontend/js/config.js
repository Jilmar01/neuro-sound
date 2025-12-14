// js/config.js

// Cambia esta variable a 'true' si usas DevTunnels, o 'false' si usas Localhost
const USE_TUNNEL = false; 

const CONFIG = {
    // 1. Configuración para LOCALHOST (Tu PC)
    LOCAL: {
        API_URL: "http://127.0.0.1:5000",       // Tu Backend Principal
        STREAM_URL: "http://127.0.0.1:5001"     // Tu Servidor de Canciones
    },
    
    // 2. Configuración para DEVTUNNELS (Internet/Celular)
    TUNNEL: {
        API_URL: "https://8nlqb9lj-5000.use2.devtunnels.ms", 
        STREAM_URL: "https://8nlqb9lj-5001.use2.devtunnels.ms"
    }
};

// Seleccionamos automáticamente cuál usar según la variable de arriba
const SELECTED_ENV = USE_TUNNEL ? CONFIG.TUNNEL : CONFIG.LOCAL;

// Exportamos las variables finales para usarlas en otros archivos
const API_BASE_URL = SELECTED_ENV.API_URL;
const STREAM_BASE_URL = SELECTED_ENV.STREAM_URL;

console.log(`🌍 Entorno cargado: ${USE_TUNNEL ? 'TUNNEL' : 'LOCAL'}`);
console.log(`🔗 API: ${API_BASE_URL}`);