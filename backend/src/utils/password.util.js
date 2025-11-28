import bcrypt from 'bcryptjs';

/**
 * Encripta una contraseña usando bcrypt.
 * 
 * @param {string} password - Contraseña en texto plano
 * @returns {string} - Hash de la contraseña
 */
export const hashPassword = (password) => {
    const salt = bcrypt.genSaltSync(5);
    return bcrypt.hashSync(password, salt);
};

/**
 * Verifica si una contraseña en texto plano coincide con su hash.
 * 
 * @param {string} plainPassword - Contraseña en texto plano
 * @param {string} hashedPassword - Hash almacenado
 * @returns {boolean} - true si coinciden, false en caso contrario
 */
export const verifyPassword = (plainPassword, hashedPassword) => {
    return bcrypt.compareSync(plainPassword, hashedPassword);
};

export { hashPassword, verifyPassword };
