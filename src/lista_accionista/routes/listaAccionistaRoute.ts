import express from 'express';
import { verifyJwt } from '../../util/verifyJwt';
import { verifyAdmin } from '../../util/verifyAdmin';
import { 
  createShareholderController, 
  deleteShareholderController, 
  getAllShareholdersForAdmin, 
  getAvailableUsersController, 
  getFollowingController, 
  getShareholderByIdController, 
  getShareholdersController, 
  getShareholdersForAdminController, 
  getStatsController, 
  toggleFollowShareholderController, 
  toggleFollowShareholderForAdminController, 
  updateShareholderController,
  checkSixMonthsController  
} from '../controllers/shareholdersController';

const router = express.Router();

// Ruta para obtener la lista de accionistas con paginación y filtros
router.get('/shareholders', verifyJwt, getShareholdersController);

// Ruta para obtener accionista específico por ID, en la vista "Lista de accionistas"
router.get('/shareholders/:id', verifyJwt, getShareholderByIdController);

// Ruta Toggle seguir/dejar de seguir accionista (requiere autenticación)
router.post('/shareholders/follow/:userId', verifyJwt, toggleFollowShareholderController);

// Ruta para obtener accionista "Siguiendo" pero para el modal en ProfileHeader
router.get('/following', verifyJwt, getFollowingController);

// Verificar si un accionista tiene 6 meses de antigüedad
router.get('/shareholders/:id/tiene6meses', verifyJwt, checkSixMonthsController);

// Ruta de lectura para administradores
router.get('/admin/shareholders', verifyJwt, verifyAdmin, getShareholdersForAdminController);

// Ruta para obtener todos los accionistas con paginación
router.get('/admin/shareholders/all', verifyJwt, verifyAdmin, getAllShareholdersForAdmin);

router.get('/admin/shareholders/:id', verifyJwt, verifyAdmin, getShareholderByIdController);

// Verificar si un accionista tiene 6 meses de antigüedad (admin)
router.get('/admin/shareholders/:id/tiene6meses', verifyJwt, verifyAdmin, checkSixMonthsController);

// Ruta para crear nuevo accionista
router.post('/admin/shareholders', verifyJwt, verifyAdmin, createShareholderController);

// Ruta para actualizar accionista existente
router.put('/admin/shareholders/:id', verifyJwt, verifyAdmin, updateShareholderController);

// Ruta para eliminar accionista
router.delete('/admin/shareholders/:id', verifyJwt, verifyAdmin, deleteShareholderController);

// Ruta para obtener estadísticas de accionistas
router.get('/admin/shareholders/stats/overview', verifyJwt, verifyAdmin, getStatsController);

// Obtener usuarios disponibles para agregar como accionistas
router.get('/admin/shareholders/users/available', verifyJwt, verifyAdmin, getAvailableUsersController);

// Toggle seguir/dejar de seguir para administradores
router.post('/admin/shareholders/follow/:userId', verifyJwt, verifyAdmin, toggleFollowShareholderForAdminController);

export default router;