import { verifyToken } from '../utils/jwt.util.js';
import { sendError } from '../utils/response.util.js';

/**
 * Middleware de autenticación JWT.
 * Lee el header `Authorization: Bearer <token>`, verifica el token
 * y añade el payload en `req.user`.
 */
export const authMiddleware = (req, res, next) => {
  try {

    let token = null;
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) return sendError(res, 'No autorizado', 401);

    const payload = verifyToken(token);
    req.user = payload;
    return next();
  } catch (error) {
    return sendError(res, error.message || 'No autorizado', 401);
  }
};
