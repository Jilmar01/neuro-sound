import { logout } from "./utils/auth.js";

const buttonLogout = document.getElementById('confirmLogoutBtn');

if (buttonLogout) {
    buttonLogout.addEventListener('click', function () {
        logout();
    });
}

