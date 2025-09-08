import express from 'express';
import { CapacitacionController } from '../controllers/capacitacionController';
import { verifyToken } from '../../User/middleware/auth.middleware';
import { authenticateAdmin } from '../../Admin/middleware/authMiddleware';

const router = express.Router();
const controller = new CapacitacionController();

router.get('/admin/capacitaciones', verifyToken, async (req, res, next) => {
  console.log("GET /capacitaciones peticion recibida");
  await controller.getAllCapacitaciones(req, res);
});

router.get('/user/capacitaciones', verifyToken, async (req, res, next) => {
  console.log("GET /capacitaciones peticion recibida");
  await controller.getAllCapacitaciones(req, res);
});

// ==================== RUTAS PARA ADMINISTRADORES ====================

// ruta para la creacion de una nueva asamblea
router.post('/admin/capacitaciones', authenticateAdmin, async (req, res, next) => {
  console.log("POST de una nueva capacitacion");
  await controller.createCapacitacion(req, res);
});

router.put('/admin/capacitaciones/:id', authenticateAdmin, async (req, res, next) => {
  console.log("PUT /:id recibida, actualizacion de capacitacion");
  await controller.updateCapacitacion(req, res);
});

router.delete('/admin/capacitaciones/:id', authenticateAdmin, async (req, res, next) => {
  console.log("DELETE /capacitaciones/:id eliminacion de capacitacion");
  await controller.deleteCapacitacion(req, res);
});

export default router;
