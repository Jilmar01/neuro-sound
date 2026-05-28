import { sendSuccess, sendError } from '../utils/response.util.js';
import { createDomain, getDomain, updateDomain } from '../services/music.server.service.js';

/*
* Inserta un nuevo dominio para el servidor de musica
*/
export const insertDomainServer = async (req, res) => {
    try {
        const { name, domainUrl, description } = req.body;
        const domainData = await createDomain(name, domainUrl, description);
        return sendSuccess(res, domainData, "Dominio del servidor de musica guardado", 200);
    } catch (error) {
        if (error.code === 11000) {
            return sendError(res, "El dominio ya existe", 409, `El dominio ${error.keyValue.domainUrl} ya está registrado`);
        }
        return sendError(res, "Error al guardar el dominio del servidor de musica", error.status, error.message);
    }
}

/*
* Obtiene el dominio del servidor de musica
*/
export const getDomainServer = async (req, res) => {
    try {
        const nameDomain = req.query.name || "NeuroSound Music Server";
        const domain = await getDomain(nameDomain);
        return sendSuccess(res, domain, "Dominio del servidor de musica", 200);
    } catch (error) {
        return sendError(res, "Error al obtener el dominio del servidor de musica", error.status, error.message);
    }
}

export const updateDomainServer = async (req, res) => {
    try {
        const { name, domainUrl, description } = req.body;
        const currentName = req.query.name || "NeuroSound Music Server";
        const updatedDomain = await updateDomain(currentName, { name, domainUrl, description });
        return sendSuccess(res, updatedDomain, "Dominio del servidor de musica actualizado", 200);
    } catch (error) {
        return sendError(res, "Error al actualizar el dominio del servidor de musica", error.status, error.message);
    }
}