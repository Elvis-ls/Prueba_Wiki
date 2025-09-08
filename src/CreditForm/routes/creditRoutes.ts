import { Router } from 'express';
import { creditController } from '../controllers/creditController';

const router = Router();

router.post('/create/credits', creditController.requestCredit);
router.get('/credits/user/:cedula', creditController.getUserCredits);
router.get('/credits/search', creditController.searchCredits);
router.get('/credits/:numeroDocumento', creditController.getCreditDetails);

export default router;