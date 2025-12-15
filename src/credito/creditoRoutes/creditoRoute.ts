import express from 'express';
import { verifyJwt } from '../../util/verifyJwt';
import { verifyAdmin } from '../../util/verifyAdmin';
import { 
  createCreditoController,
  getCreditosByAccionistaController,
  getCreditoByIdController
} from '../controllers/creditoController';

const router = express.Router();

// Administrador
router.post('/admin/creditos/create', verifyJwt, verifyAdmin, createCreditoController);

// Accionistas
router.get('/creditos/accionista/:accionistaId', verifyJwt, getCreditosByAccionistaController);
router.get('/creditos/:id', verifyJwt, getCreditoByIdController);

export default router;