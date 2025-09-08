import express from 'express';
import { MontoContributionService } from '../services/MontoContributionService';
import { MontoContributionController } from '../controllers/MontoContributionController';

const router = express.Router();
const service = new MontoContributionService();
const controller = new MontoContributionController(service);

router.post('/monto-contribution', async (req, res, next) => {
  await controller.create(req, res, next);
});

router.patch('/monto-contribution/:id/pay', async (req, res, next) => {
  await controller.markAsPaid(req, res, next);
});

router.get('/contributions', async (req, res, next) => {
  await controller.getByUser(req, res, next);
});

router.put('/admin/contributions/update-status', async (req, res, next) => {
  await controller.updateStatus(req, res, next);
});

/* NUEVA RUTA: Para actualizar comentarios (solo admins)
router.post('/admin/comments', async (req, res, next) => {
  const controller = new MontoContributionController(new MontoContributionService());
  await controller.updateComments(req, res, next);
});
*/
export default router; 