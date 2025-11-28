import { registerUser, getUserBy, updateUser, deleteUser } from '../services/user.service.js';
import { sendSuccess, sendError } from '../utils/response.util.js';

/**
 * Mapea errores del servicio a códigos HTTP.
 * @param {Error} error - Error lanzado por el servicio.
 * @returns {Object} { status, message }
 */
const mapServiceError = (error) => {
    const message = error.message || '';

    if (message.includes('VALIDATION_ERROR')) {
        return { status: 400, message: message.replace('VALIDATION_ERROR: ', '') };
    }
    if (message.includes('DUPLICATE_EMAIL')) {
        return { status: 409, message: message.replace('DUPLICATE_EMAIL: ', '') };
    }
    if (message.includes('NOT_FOUND')) {
        return { status: 404, message: message.replace('NOT_FOUND: ', '') };
    }

    return { status: 500, message: 'Error interno del servidor.' };
};

/**
 * Crea un nuevo usuario.
 */
const createUser = async (req, res) => {
    try {
        const userData = { ...req.body };
        const userObj = await registerUser(userData);
        return sendSuccess(res, userObj, 'Usuario creado exitosamente', 201);
    } catch (error) {
        const { status, message } = mapServiceError(error);
        return sendError(res, message, status);
    }
};

/**
 * Obtiene un usuario por su ID.
 */
const getUserId = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await getUserBy(id);

        if (!usuario) {
            return sendError(res, 'Usuario no encontrado', 404);
        }

        return sendSuccess(res, usuario, 'Datos del usuario', 200);
    } catch (error) {
        const { status, message } = mapServiceError(error);
        return sendError(res, message, status);
    }
};

/**
 * Actualiza un usuario por su ID.
 */
const updateUserId = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        const updated = await updateUser(id, updateData);

        if (!updated) {
            return sendError(res, 'Usuario no encontrado', 404);
        }

        return sendSuccess(res, updated, 'Usuario actualizado', 200);
    } catch (error) {
        const { status, message } = mapServiceError(error);
        return sendError(res, message, status);
    }
};

/**
 * Elimina un usuario por su ID.
 */
const deleteUserId = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await deleteUser(id);

        if (!deleted) {
            return sendError(res, 'Usuario no encontrado', 404);
        }

        return sendSuccess(res, deleted, 'Usuario eliminado', 200);
    } catch (error) {
        const { status, message } = mapServiceError(error);
        return sendError(res, message, status);
    }
};

export const userController = {
    createUser,
    getUserId,
    updateUserId,
    deleteUserId
};
