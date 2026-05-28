import { Router } from 'express';
import { getDomainServer, insertDomainServer, updateDomainServer } from '../controllers/music.server.js';

const router = Router();

// Inserta un nuevo dominio para el servidor de Musica
router.post('/register', insertDomainServer);
// Obtines el dominio del servidor de Musica
router.get('/get-domain', getDomainServer);
// Actualiza el dominio del servidor de Musica
router.put('/update-domain', updateDomainServer);

export default router;