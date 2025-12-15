import express from 'express';
import { verifyJwt } from '../../util/verifyJwt';
import { verifyAdmin } from '../../util/verifyAdmin';
import { 
  requestCreditController,
  getUserCreditsController,
  getCreditDetailsController,
  searchCreditsController,
  getCreditSummaryController
} from '../controllers/creditFormController';

const router = express.Router();

// Accionistas y consultas generales
router.post('/credits/create', verifyJwt, requestCreditController);
router.get('/credits/user/:cedula', verifyJwt, getUserCreditsController);
router.get('/credits/search', verifyJwt, searchCreditsController);
router.get('/credits/:numeroDocumento', verifyJwt, getCreditDetailsController);

// Administrador
router.get('/admin/credits/summary', verifyJwt, verifyAdmin, getCreditSummaryController);

export default router;