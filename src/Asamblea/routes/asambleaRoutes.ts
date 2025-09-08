import express from 'express';
import { AsambleaController } from '../controllers/asambleaController';
import { verifyToken } from '../../User/middleware/auth.middleware';
import { authenticateAdmin } from '../../Admin/middleware/authMiddleware';

const router = express.Router();
const controller = new AsambleaController();

router.get('/admin/asambleas', verifyToken, async (req, res, next) => {
  console.log("GET /asambleas peticion recibida");
  await controller.getAllAsambleas(req, res);
});

router.get('/user/asambleas', verifyToken, async (req, res, next) => {
  console.log("GET /asambleas peticion recibida");
  await controller.getAllAsambleas(req, res);
});

// ==================== RUTAS PARA ADMINISTRADORES ====================

// ruta para la creacion de una nueva asamblea
router.post('/admin/asambleas', authenticateAdmin, async (req, res, next) => {
  console.log("POST de una nueva asambleas");
  await controller.createAsamblea(req, res);
});

router.put('/admin/asambleas/:id', authenticateAdmin, async (req, res, next) => {
  console.log("PUT /:id recibida, actualizacion de");
  await controller.updateAsamblea(req, res);
});

router.delete('/admin/asambleas/:id', authenticateAdmin, async (req, res, next) => {
  console.log("DELETE /asambleas/:id eliminacion de asamblea");
  await controller.deleteAsamblea(req, res);
});

export default router;
