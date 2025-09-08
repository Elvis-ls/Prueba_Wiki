// routes/shareholdersRoutes.ts
import express from 'express';
import { ShareholdersController } from '../controllers/shareholdersController';
import { verifyToken } from '../../User/middleware/auth.middleware';
import { authenticateAdmin } from '../../Admin/middleware/authMiddleware';

const router = express.Router();
const controller = new ShareholdersController();

// ==================== RUTAS PARA USUARIOS (LECTURA) ====================

// Obtener lista de accionistas con paginación y filtros, cuando se va la 
//vista "Lista de accionistas"
router.get('/shareholders', verifyToken, async (req, res, next) => {
  console.log("🟢 GET /shareholders peticion recibida");
  await controller.getShareholders(req, res);
});


// Obtener accionista específico por ID, en la vista "Lista de accionistas"
router.get('/shareholders/:id', verifyToken, async (req, res, next) => {
  await controller.getShareholderById(req, res);
});

// Toggle seguir/dejar de seguir accionista (requiere autenticación)
router.post('/shareholders/follow/:userId', verifyToken, async (req, res, next) => {
  await controller.toggleFollowShareholder(req, res);
});

// obtener accionista "Siguiendo" pero para el modal en ProfileHeader
router.get("/following", verifyToken, async (req, res, next) => {
  await controller.getFollowing(req, res);
});


// ==================== RUTAS PARA ADMINISTRADORES ====================

// Rutas de lectura para administradores
router.get('/admin/shareholders', authenticateAdmin, async (req, res, next) => {
  await controller.getShareholdersForAdmin(req, res);
});

router.get(
  '/admin/shareholders/all',authenticateAdmin, async(req, res, next) => {
    await controller.getAllShareholdersForAdmin(req, res);
  }
);

router.get('/admin/shareholders/:id', authenticateAdmin, async (req, res, next) => {
  await controller.getShareholderById(req, res);
});

// ==================== RUTAS EXCLUSIVAS PARA ADMINISTRADORES (ESCRITURA) ====================

// Crear nuevo accionista
router.post('/admin/shareholders', authenticateAdmin, async (req, res, next) => {
  await controller.createShareholder(req, res);
});

// Actualizar accionista existente
router.put('/admin/shareholders/:id', authenticateAdmin, async (req, res, next) => {
  await controller.updateShareholder(req, res);
});

// Eliminar accionista
router.delete('/admin/shareholders/:id', authenticateAdmin, async (req, res, next) => {
  await controller.deleteShareholder(req, res);
});

// Obtener estadísticas de accionistas
router.get('/admin/shareholders/stats/overview', authenticateAdmin, async (req, res, next) => {
  await controller.getStats(req, res);
});

// Obtener usuarios disponibles para agregar como accionistas
router.get('/admin/shareholders/users/available', authenticateAdmin, async (req, res, next) => {
  await controller.getAvailableUsers(req, res);
});

// Toggle seguir/dejar de seguir para administradores
router.post('/admin/shareholders/follow/:userId', authenticateAdmin, async (req, res, next) => {
  await controller.toggleFollowShareholderForAdmin(req, res);
});

export default router;