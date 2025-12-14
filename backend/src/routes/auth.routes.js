import { Router } from 'express';
import { login, logout } from '../controllers/auth.ctrl.js';
import { authMiddleware } from '../middleware/auth.mdlw.js';
import { sendSuccess } from '../utils/response.util.js';

const router = Router();

// Inicio de sesión
router.post('/login', login);

// Cerrar sesión (limpia cookie)
router.post('/logout', logout);

// Devuelve payload del token (protegida)
router.get('/me', authMiddleware, (req, res) => {
  return sendSuccess(res, req.user, "Usuario tiene una sesion activa", 200);
});

export default router;