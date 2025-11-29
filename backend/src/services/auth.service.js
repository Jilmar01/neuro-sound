import User from "../models/user.model.js";
import { generateToken } from "../utils/jwt.util.js";
import { verifyPassword } from "../utils/password.util.js";

// Validadores auxiliares
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPassword = (password) => password && password.length >= 6;

/**
 * Revisa que el usuario exita para su autenticacion
 * 
 * @param {string} email - Email de usuario a autenticar
 * @param {string} password = Contraseña de la cuenta de email
 * @returns {Promise<Object>} - Datos del usuario y Token de autenticacion
 */
export const authService = async (email, password) => {

    const user = await User.findOne({email}).select('+password');
    const passwordMatch = verifyPassword(password, user.password);

    if(!user || !passwordMatch) throw new Error("Credenciales inválidas");

    const userObj = user.toObject ? user.toObject() : { ...usuario };
    if (userObj.password) delete userObj.password;

    const token = generateToken(userObj);

    return { user: userObj, token};
}
