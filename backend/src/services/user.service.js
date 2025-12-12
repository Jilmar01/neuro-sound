import User from '../models/user.model.js';
import { hashPassword } from '../utils/password.util.js';

// Validadores auxiliares
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPassword = (password) => password && password.length >= 6;
const isValidName = (name) => name && name.trim().length > 0;

/**
 * Obtiene un usuario por su ID.
 *
 * @param {string} id - ObjectId del usuario.
 * @returns {Promise<Object|null>} Datos del usuario.
 */
export const getUserBy = async (id) => {
    return await User.findById(id).select('-password');
};

/**
 * Registra un nuevo usuario en la base de datos.
 *
 * @param {Object} userData - Objeto con los campos del usuario ({ name, last_name, email, password }).
 * @returns {Promise<Object>} Datos del usuario creado .
 * @throws {Error} Si validación falla o email ya existe.
 */
export const registerUser = async (userData) => {
    const { name, last_name, email, password, form } = userData;

    console.log("Se realizo una peticion");

    // Validar campos requeridos
    if (!name || !last_name || !email || !password) {
        throw new Error('VALIDATION_ERROR: Los campos name, last_name, email y password son requeridos.');
    }

    // Validar formato de nombre
    if (!isValidName(name) || !isValidName(last_name)) {
        throw new Error('VALIDATION_ERROR: El nombre y apellido deben tener al menos 1 carácter.');
    }

    // Validar formato de email
    if (!isValidEmail(email)) {
        throw new Error('VALIDATION_ERROR: El formato del email no es válido.');
    }

    // Validar longitud de contraseña
    if (!isValidPassword(password)) {
        throw new Error('VALIDATION_ERROR: La contraseña debe tener al menos 6 caracteres.');
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('DUPLICATE_EMAIL: El email ya está registrado.');
    }

    // Hashear contraseña
    const pwd = hashPassword(password);
    const nuevoUsuario = new User({ name, last_name, email, password: pwd, form });
    await nuevoUsuario.save();

    const userObj = nuevoUsuario.toObject ? nuevoUsuario.toObject() : { ...nuevoUsuario };
    if (userObj.password) delete userObj.password;

    return userObj;
};

/**
 * Actualiza un usuario por su ID.
 *
 * @param {string} id - ObjectId del usuario a actualizar.
 * @param {Object} updateData - Campos a actualizar.
 * @returns {Promise<Object|null>} Datos del usuario actualizadoo null si no existe.
 * @throws {Error} Si validación falla.
 */
export const updateUser = async (id, updateData) => {
    // Validar que hay datos a actualizar
    if (!updateData || Object.keys(updateData).length === 0) {
        throw new Error('VALIDATION_ERROR: Debe proporcionar al menos un campo para actualizar.');
    }

    // Validar email si se proporciona
    if (updateData.email && !isValidEmail(updateData.email)) {
        throw new Error('VALIDATION_ERROR: El formato del email no es válido.');
    }

    // Validar contraseña si se proporciona
    if (updateData.password && !isValidPassword(updateData.password)) {
        throw new Error('VALIDATION_ERROR: La contraseña debe tener al menos 6 caracteres.');
    }

    // Verificar email duplicado si se está actualizando
    if (updateData.email) {
        const existingUser = await User.findOne({ email: updateData.email });
        if (existingUser && existingUser._id.toString() !== id) {
            throw new Error('DUPLICATE_EMAIL: El email ya está registrado por otro usuario.');
        }
    }

    // Hashear contraseña si está presente
    if (updateData.password) {
        updateData.password = hashPassword(updateData.password);
    }

    const updated = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    //console.log(updated);
    
    return updated;
};

/**
 * Elimina un usuario por su ID.
 *
 * @param {string} id - ObjectId del usuario a eliminar.
 * @returns {Promise<Object|null>} Documento eliminado (sin `password`) o null si no existía.
 */
export const deleteUser = async (id) => {
    const deleted = await User.findByIdAndDelete(id).select('-password');
    return deleted;
};
