import { sendSuccess, sendError } from '../utils/response.util.js';
import { authService, userAuth } from '../services/auth.service.js';

/**
 * Inicio de sesion de usuario.
 * Body: { email, password }
 * Devuelve token JWT y datos del usuario.
 */
export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) return sendError(res, 'Email y password son requeridos', 400);

		const { user, token } = await authService(email, password);

		// Opciones de cookie
		const isProduction = process.env.NODE_ENV === "production";

		const cookieOptions = {
			httpOnly: true,
			secure: isProduction,
			sameSite: isProduction ? "none" : "lax",
			path: "/",
			maxAge: 7 * 24 * 60 * 60 * 1000
		};

		// Intentar usar JWT_EXPIRE para maxAge si está disponible; si no, usar valor por defecto.
		const defaultMaxAge = 7 * 24 * 60 * 60 * 1000;
		cookieOptions.maxAge = defaultMaxAge;

		res.cookie('token', token, cookieOptions);

		return sendSuccess(res, { token, user }, 'Login exitoso', 200);
	} catch (error) {
		return sendError(res, 'Error al iniciar sesión', error.status, error.message);
	}
};

/**
 * Cerrar sesión - limpia la cookie de sesión
 */
export const logout = (req, res) => {
	try {
		const isProduction = process.env.NODE_ENV === "production";

		const cookieOptions = {
			httpOnly: true,
			secure: isProduction,
			sameSite: isProduction ? "none" : "lax",
			path: "/"
		};

		res.clearCookie('token', cookieOptions);

		return sendSuccess(res, null, 'Logout exitoso', 200);
	} catch (error) {
		return sendError(res, 'Error al cerrar sesión', 500, error.message);
	}
};

/**
 * Datos del usuario autenticado
 */
export const myData = async (req, res) => {
	try {
		const { _id } = req.user;
		const user = await userAuth(_id);
		return sendSuccess(res, user, 'Datos del usuario autenticado', 200);
	} catch (error) {
		return sendError(res, 'Error al obtener datos del usuario', 500, error.message);
	}
};