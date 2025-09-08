import express from 'express';
import { MontoContributionService } from '../../MontoContribution/services/MontoContributionService';
import { MontoContributionController } from '../../MontoContribution/controllers/MontoContributionController';

const router = express.Router();
const service = new MontoContributionService();
const controller = new MontoContributionController(service);

// Usar funciones wrapper explícitas
router.get('/contributions/:userId', async (req, res, next) => {
  await controller.getByUser(req, res, next);
});

router.get('/contributions', async (req, res, next) => {
  await controller.getAll(req, res, next);
});

router.put('/contributions/comments', async (req, res, next) => {
  await controller.updateComments(req, res, next);
});

export default router;