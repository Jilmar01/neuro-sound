import { fetchRequest } from "./fetch.js";

export const getUser = async () => {
    const userData = await fetchRequest("api/auth/me", "GET", null, true);
    return userData;
}

export const getToken = () => {
    return localStorage.getItem('token');
}

export function isAuthenticated() {
    return !!getToken();
}

export function logout() {
    localStorage.clear();
    window.location.replace("../index.html");
}