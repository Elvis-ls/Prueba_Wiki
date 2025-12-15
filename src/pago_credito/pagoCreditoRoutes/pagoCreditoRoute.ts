import express from 'express';
import { verifyJwt } from '../../util/verifyJwt';
import { verifyAdmin } from '../../util/verifyAdmin';
import { 
  registrarPagoController,
  getPagosByCreditoController,
  getEstadoPagosAccionistaController
} from '../controllers/pagoCreditoController';

const router = express.Router();

// Administrador
router.post('/admin/pagos/registrar', verifyJwt, verifyAdmin, registrarPagoController);

// Accionistas
router.get('/pagos/credito/:creditoId', verifyJwt, getPagosByCreditoController);
router.get('/pagos/estado/:accionistaId', verifyJwt, getEstadoPagosAccionistaController);

export default router;