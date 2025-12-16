import express from 'express';
import { getEstadoSolicitudController } from '../controllers/solicitudcreditoControllers';

const router = express.Router();

/**
 * Obtener el estado de la solicitud de paquete financiero por accionista_id
 */
router.get('/solicitud-paquete/estado/:accionistaId', getEstadoSolicitudController);

export default router;