import { sendSuccess, sendError } from '../utils/response.util.js';
import { authService } from '../services/auth.service.js';

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
		const cookieOptions = {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
		};

		// Intentar usar JWT_EXPIRE para maxAge si está disponible; si no, usar valor por defecto.
		const defaultMaxAge = 7 * 24 * 60 * 60 * 1000;
		cookieOptions.maxAge = defaultMaxAge;

		res.cookie('token', token, cookieOptions);

		return sendSuccess(res, { user }, 'Login exitoso', 200);
	} catch (error) {
		return sendError(res, 'Error al iniciar sesión', 500, error.message);
	}
};

/**
 * Cerrar sesión - limpia la cookie de sesión
 */
export const logout = (req, res) => {
	try {
		res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
		return sendSuccess(res, null, 'Logout exitoso', 200);
	} catch (error) {
		return sendError(res, 'Error al cerrar sesión', 500, error.message);
	}
};