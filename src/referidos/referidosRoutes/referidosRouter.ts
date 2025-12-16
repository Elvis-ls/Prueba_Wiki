import express from 'express';
import { verifyJwt } from '../../util/verifyJwt';
import { verifyAdmin } from '../../util/verifyAdmin';
import { 
  inviteReferralController,
  getReferralsByAccionistaController,
  updateReferralStatusController,
  getAllReferralsController,
  getReferralStatsController
} from '../controllers/referidosController';

const router = express.Router();

// Accionistas
router.post('/referrals/invite', verifyJwt, inviteReferralController);
router.get('/referrals/my-referrals/:accionistaId', verifyJwt, getReferralsByAccionistaController);

// Administrador
router.get('/admin/referrals', verifyJwt, verifyAdmin, getAllReferralsController);
router.put('/admin/referrals/:id/status', verifyJwt, verifyAdmin, updateReferralStatusController);
router.get('/admin/referrals/stats', verifyJwt, verifyAdmin, getReferralStatsController);

export default router;