// Función unificada de Logout
function logout() {
    // 1. Borrar credenciales
    localStorage.removeItem('token');
    localStorage.removeItem('spotifyToken');
    
    console.log("Sesión cerrada correctamente");

    // 2. Redireccionar manualmente
    window.location.href = "index.html";
}

// IMPORTANTE: Exponer la función para que el onclick del HTML la encuentre
window.logout = logout;