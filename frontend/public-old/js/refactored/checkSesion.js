//funcion para verificar que en todos los casos haya el token en el localStorage, sino redireccionar al index.html
function checkToken() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = "index.html";
    }
}

checkToken();