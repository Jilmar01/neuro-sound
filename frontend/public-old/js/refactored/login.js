import { apiCall } from "./fetch.js"; 

function setBody(){
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    if(!email || !password) throw new Error("Por favor completa los campos");
    return { email, password };
}

async function handleLogin(event) {
    // 1. DETENER el envío nativo (Obligatorio)
    event.preventDefault(); 

    // 2. LIMPIEZA VISUAL (El truco)
    // Esto borra los parámetros (?email=...) de la barra de direcciones sin recargar la página
    window.history.replaceState({}, document.title, window.location.pathname);

    try {
        const credentials = setBody(); 

        // 3. Petición segura (los datos van ocultos en el body del request)
        const data = await apiCall('neuro', '/api/auth/login', 'POST', credentials);

        //console.log("Login exitoso:", data);
        //exportar el token al localStorage
        localStorage.setItem('token', data.data.token);

        if(data.data.user.form){    
            window.location.href = "home.html";
        } else {
            window.location.href = "cuestionario.html";
        }

    } catch (error) {
        console.error("Error en login:", error);
        alert(error.message); 
    }
}

document.getElementById('loginForm').addEventListener('submit', handleLogin);