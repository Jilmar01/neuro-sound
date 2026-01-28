import { Router } from 'express';
import { login, logout, myData } from '../controllers/auth.ctrl.js';
import { authMiddleware } from '../middleware/auth.mdlw.js';

const router = Router();

// Inicio de sesión
router.post('/login', login);

// Cerrar sesión (limpia cookie)
router.post('/logout', logout);

// Devuelve payload del token (protegida)
router.get('/me', authMiddleware, myData);

export default router;