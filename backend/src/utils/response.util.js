/**
 * Utilidades para respuestas HTTP estandarizadas.
 * Proporciona funciones helper para enviar respuestas JSON consistentes.
 */

/**
 * Envía respuesta exitosa al cliente.
 * Estructura: { success: true, status, message, data }
 * 
 * @param {Object} res - Response de Express
 * @param {*} data - Datos a devolver (null si no hay)
 * @param {string} message - Mensaje descriptivo
 * @param {number} status - Código HTTP (200, 201, etc.)
 */
const sendSuccess = (res, data = null, message = 'OK', status = 200) => {
  const payload = {
    success: true,
    status,
    message,
    data,
  };
  return res.status(status).json(payload);
};

/**
 * Envía respuesta de error al cliente.
 * Estructura: { success: false, status, message, error? }
 * 
 * @param {Object} res - Response de Express
 * @param {string} message - Mensaje de error
 * @param {number} status - Código HTTP (400, 401, 404, 500, etc.)
 * @param {*} error - Detalles técnicos (opcional)
 */
const sendError = (res, message = 'Internal Server Error', status = 500, error = null) => {
  const payload = {
    success: false,
    status,
    message,
  };
  if (error) payload.error = error;
  return res.status(status).json(payload);
};

export { sendSuccess, sendError };
