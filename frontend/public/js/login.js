import { getUser } from "./utils/auth.js";
import { fetchRequest } from "./utils/fetch.js";

const form = document.getElementById("loginForm");
const feedback = document.getElementById("feedback");
const button = form.querySelector("button");

const password = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const eyeIcon = document.getElementById("eyeIcon");

togglePassword.addEventListener("click", () => {
    if (password.type === "password") {
        password.type = "text";
        eyeIcon.classList.replace("bi-eye", "bi-eye-slash");
    } else {
        password.type = "password";
        eyeIcon.classList.replace("bi-eye-slash", "bi-eye");
    }
});

/* Ayudas de IU */
function setButtonLoading(isLoading) {
    button.disabled = isLoading;
    button.textContent = isLoading ? "Checking..." : "Enter Music Player";
}

function showFeedback(message) {
    feedback.textContent = message;
    feedback.className = "feedback feedback-valid";
    feedback.style.display = "block";
}

/* Navegacion */
function redirectByFormStatus(hasForm) {
    window.location.replace(hasForm ? "./home.html" : "./survey.html");
}

/* Logica del Login */
async function login(email, password) {
    return fetchRequest("api/auth/login", "POST", { email, password });
}

async function handleSubmit(event) {
    event.preventDefault();

    const email = form.email.value.trim();
    const password = form.password.value.trim();

    setButtonLoading(true);

    try {
        const response = await login(email, password);

        if (!response.success) {
            showFeedback(response.error || "Invalid username or password");
            return;
        }

        const { token, user } = response.data;
        localStorage.setItem("token", token);
        redirectByFormStatus(user.form);

    } catch (error) {
        showFeedback("Unable to connect to the server");
        console.error(error);
    } finally {
        setButtonLoading(false);
    }
}

/* Inicio */
async function initLogin() {
    const response = await getUser();

    if (!response?.success) {
        form.addEventListener("submit", handleSubmit);
        return;
    }

    redirectByFormStatus(response.data.form);
}

initLogin();
