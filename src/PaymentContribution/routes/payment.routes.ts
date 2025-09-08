import express from 'express';
import { PaymentContributionController } from '../controllers/paymentContribution.controller';
import { PaymentContributionService } from '../services/paymentContribution.service';

const router = express.Router();
const controller = new PaymentContributionController(new PaymentContributionService());

router.post('/monto-contribution', controller.handle.bind(controller));

export default router;