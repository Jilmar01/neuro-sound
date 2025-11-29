import { Router } from 'express';
import { login, logout } from '../controllers/auth.ctrl.js';
import { authMiddleware } from '../middleware/auth.mdlw.js';

const router = Router();

// Inicio de sesión
router.post('/login', login);

// Cerrar sesión (limpia cookie)
router.post('/logout', logout);

// Devuelve payload del token (protegida)
router.get('/me', authMiddleware, (req, res) => {
  return res.json({ success: true, data: req.user });
});

export default router;