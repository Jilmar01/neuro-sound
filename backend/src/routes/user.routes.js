import { Router } from "express";
import { userController } from "../controllers/user.ctrl.js";
import { authMiddleware } from '../middleware/auth.mdlw.js';

const router = Router();

// Ruta para registrar un nuevo usuario
router.post("/register", userController.createUser);

// Ruta para obtener datos de un usuario por ID
router.get('/data', authMiddleware, userController.getUserId);

// Ruta para actulizar un usuario por ID
router.put('/update', authMiddleware, userController.updateUserId);

// Ruta para eliminar un usuario por ID
router.delete('/delete', authMiddleware, userController.deleteUserId);

export default router;