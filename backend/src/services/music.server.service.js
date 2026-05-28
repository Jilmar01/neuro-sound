import MusicServer from '../models/music.server.js'
import { HttpError } from "../utils/httpError.js";

/**
 * Crea un nuevo dominio para el servidor de musica
 * 
 * @param {String} name - Nombre del servidor de musica
 * @param {String} domainUrl - URL del dominio del servidor de musica
 * @param {String} description - Descripcion del servidor de musica
 * @returns - URL del dominio guardado
 */
export const createDomain = async (name, domainUrl, description) => {
    if (!name || !domainUrl) {
        throw new HttpError("El nombre y la URL del dominio son obligatorios", 400);
    }

    const music = new MusicServer({ name, domainUrl, description });
    await music.save();

    return {name, domainUrl, description};
}

/**
 * Obtiene el dominio del servidor de musica
 * 
 * @param {String} nameDomain - Nombre del servidor de musica
 * @returns - Datos del servidor de musica
 */
export const getDomain = async (nameDomain) => {
    const domain = await MusicServer.find({ name: nameDomain });
    if(domain.length === 0) {
        throw new HttpError("No se ha encontrado un dominio registrado para el servidor de musica", 404);
    }
    return domain;
}


/**
 * Actualiza el dominio del servidor de musica
 * 
 * @param {String} currentName - Nombre actual del servidor de musica
 * @param {String} name - Nombre del servidor de musica
 * @param {String} domainUrl - URL del dominio del servidor de musica
 * @param {String} description - Descripcion del servidor de musica
 * @returns - Datos actualizados del servidor de musica
 */
export const updateDomain = async (currentName, data) => {

    const currentDomain = await getDomain(currentName);

    const updates = {};

    if (data.name && data.name !== currentDomain[0].name) {
        updates.name = data.name;
    }

    if (data.domainUrl && data.domainUrl !== currentDomain[0].domainUrl) {
        updates.domainUrl = data.domainUrl;
    }

    if (data.description && data.description !== currentDomain[0].description) {
        updates.description = data.description;
    }

    if (Object.keys(updates).length === 0) {
        throw new HttpError("No se proporcionaron datos para actualizar", 400);   
    }

    return await MusicServer.findOneAndUpdate(
        { name: currentName },
        updates,
        { new: true }
    );
};
