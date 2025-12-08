import { Router } from "express";
import { userController } from "../controllers/user.ctrl.js";

const router = Router();

// Ruta para registrar un nuevo usuario
router.post("/register", userController.createUser);

// Ruta para obtener datos de un usuario por ID
router.get('/data/:id', userController.getUserId);

// Ruta para actulizar un usuario por ID
router.put('/update/:id', userController.updateUserId);

// Ruta para eliminar un usuario por ID
router.delete('/delete/:id', userController.deleteUserId);

export default router;