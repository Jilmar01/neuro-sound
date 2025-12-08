import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE;

/**
 * Genera un JWT con el payload proporcionado
 * @param {Object} payload - Datos a incluir en el token
 * @returns {string} - Token JWT generado
 */
export const generateToken = (payload) => {
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
  return token;
};

/**
 * Verifica y decodifica un JWT
 * @param {string} token - Token JWT a verificar
 * @returns {Object} - Payload del token si es válido
 */
export const verifyToken = (token) => {
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded;
};

/**
 * Decodifica un JWT sin verificar la firma (solo lectura)
 * Útil para obtener información del token sin validar
 * @param {string} token - Token JWT a decodificar
 * @returns {Object} - Payload del token
 */
export const decodeToken = (token) => {
    const decoded = jwt.decode(token);
    return decoded;
};
