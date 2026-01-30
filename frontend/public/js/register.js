import { fetchRequest } from "./utils/fetch.js";

let currentStrength = 0;

const form = document.getElementById('registerForm');
form.addEventListener('submit', handleRegister);

const inputs = form.querySelectorAll('input');

const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');

//const passwordStrength = document.getElementById('passwordStrength');
const strengthBar = document.getElementById('strengthBar');
const strengthText = document.getElementById('strengthText');

togglePassword.addEventListener("click", () => {
    if (password.type === "password") {
        password.type = "text";
        eyeIcon.classList.replace("bi-eye", "bi-eye-slash");
    } else {
        password.type = "password";
        eyeIcon.classList.replace("bi-eye-slash", "bi-eye");
    }
});

const registerFeedback = document.getElementById('registerFeedback');

const btnRegister = document.getElementById('btn-register');

const modal = document.getElementById("successModal");
const succesModal = new bootstrap.Modal(modal);
modal.addEventListener("hidden.bs.modal", () => {
    window.location.replace("./login.html");
});

/* Modal */
const modalRegister = document.getElementById("goLogin");
modalRegister.addEventListener("click", () => {
    window.location.replace("./login.html");
});

function showSuccessModal() {
    succesModal.show();
}

/* Ayudas de IU */
function showRegisterError(message) {
    registerFeedback.textContent = message;
    registerFeedback.style.display = "block";
}

function toggleRegisterButton(loading) {
    btnRegister.disabled = loading;
    btnRegister.textContent = loading ? "Registering..." : "Create Account";
}

/* Logica de Contraseña */
/*password.addEventListener('input', function () {
    const value = this.value;

    if (!value) {
        passwordStrength.style.display = 'none';
        currentStrength = 0;
        return;
    }

    //passwordStrength.style.display = 'block';

    let strength = 0;

    if (value.length >= 6) strength++;
    if (value.length >= 10) strength++;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) strength++;
    if (/\d/.test(value)) strength++;
    if (/[^a-zA-Z0-9]/.test(value)) strength++;

    currentStrength = strength;

    strengthBar.className = 'strength-fill';

    if (strength <= 2) {
        strengthBar.classList.add('strength-weak');
        strengthText.textContent = 'Weak';
        strengthText.style.color = '#dc3545';
    } else if (strength <= 3) {
        strengthBar.classList.add('strength-medium');
        strengthText.textContent = 'Medium';
        strengthText.style.color = '#ffc107';
    } else {
        strengthBar.classList.add('strength-strong');
        strengthText.textContent = 'Strong';
        strengthText.style.color = '#28a745';
    }
});*/

/* Validaciones */
function validatePasswords() {
    console.log("Entro 2");
    
    if (password.value !== confirmPassword.value) {
        registerFeedback.style.display = 'none';
        confirmPassword.classList.add('is-invalid');
        confirmPassword.classList.remove('is-valid');
        showRegisterError("Passwords do not match.")
        return false;
    }

    if(password.value.length < 6) {
        registerFeedback.style.display = 'none';
        confirmPassword.classList.add('is-invalid');
        confirmPassword.classList.remove('is-valid');
        showRegisterError("The password must be at least 6 characters long.")
        return false;
    }

    confirmPassword.classList.remove('is-invalid');
    confirmPassword.classList.add('is-valid');
    return true;
}

function validatePasswordStrength() {
    if (currentStrength < 4) {
        password.classList.add('is-invalid');
        password.classList.remove('is-valid');
        showRegisterError("Password is not strong enough.")
        return false;
    }

    password.classList.remove('is-invalid');
    password.classList.add('is-valid');
    return true;
}

/* Logica de Registro */
async function register(data) {
    return fetchRequest("api/user/register", "POST", data);
}

async function handleRegister(e) {
    
    e.preventDefault();

    /*if (!validatePasswordStrength()) {
        form.classList.add('was-validated');
        return;
    }*/
   
   if (!form.checkValidity() || !validatePasswords()) {
        console.log("Si entro");
        form.classList.add('was-validated');
        return;
    }

    const name = document.getElementById('firstname').value;
    const last_name = document.getElementById('lastname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const data = {
        name,
        last_name,
        email,
        password,
        form: false
    };

    toggleRegisterButton(true);

    try {
        const response = await register(data);

        if (!response.success) {
            showRegisterError(response.error || response.message);
            return;
        }

        showSuccessModal();

    } catch (error) {
        console.error("Register error:", error);
    } finally {
        toggleRegisterButton(false);
    }
}

/* FeedBack Inputs */
inputs.forEach(input => {
    input.addEventListener('blur', function () {
        if (this.checkValidity()) {
            this.classList.add('is-valid');
            this.classList.remove('is-invalid');
        } else {
            this.classList.add('is-invalid');
            this.classList.remove('is-valid');
        }
    });
});