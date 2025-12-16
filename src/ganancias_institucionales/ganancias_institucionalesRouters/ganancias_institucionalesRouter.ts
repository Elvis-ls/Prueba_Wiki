import express from 'express';
import { verifyJwt } from '../../util/verifyJwt';
import { verifyAdmin } from '../../util/verifyAdmin';
import {
  getEarningsByYearController,
  getYearSummaryController,
  getAvailableYearsController,
  updateEarningsController,
  updateMultipleEarningsController,
  resetToAutoCalculatedController,
  syncYearDataController
} from '../controllers/institutionalEarningsController';

const router = express.Router();

// ==================== RUTAS PARA USUARIOS (SOLO LECTURA) ====================

// Obtener ganancias por año
// GET /api/earnings?year=2024
router.get('/earnings', verifyJwt, getEarningsByYearController);

// Obtener resumen de ganancias de un año
// GET /api/earnings/summary?year=2024
router.get('/earnings/summary', verifyJwt, getYearSummaryController);

// Obtener años disponibles
// GET /api/earnings/years
router.get('/earnings/years', verifyJwt, getAvailableYearsController);

// ==================== RUTAS PARA ADMINISTRADORES ====================

// Obtener ganancias por año (admin)
// GET /api/admin/earnings?year=2024
router.get('/admin/earnings', verifyJwt, verifyAdmin, getEarningsByYearController);

// Obtener resumen de ganancias (admin)
// GET /api/admin/earnings/summary?year=2024
router.get('/admin/earnings/summary', verifyJwt, verifyAdmin, getYearSummaryController);

// Obtener años disponibles (admin)
// GET /api/admin/earnings/years
router.get('/admin/earnings/years', verifyJwt, verifyAdmin, getAvailableYearsController);

// Actualizar ganancias específicas de un mes
// PUT /api/admin/earnings/:year/:month
// Body: { intereses: 100, creditos: 200, otrosIngresos: 50 }
router.put('/admin/earnings/:year/:month', verifyJwt, verifyAdmin, updateEarningsController);

// Actualizar múltiples ganancias de un año
router.put('/admin/earnings/:year', verifyJwt, verifyAdmin, updateMultipleEarningsController);

// Ruta alternativa para guardar cambios (POST)
// POST /api/admin/earnings/:year/save
// Body: { earnings: [{ month: 1, intereses: 100, creditos: 200, otrosIngresos: 50 }, ...] }
router.post('/admin/earnings/:year/save', verifyJwt, verifyAdmin, updateMultipleEarningsController);

// Resetear ganancias de un mes a valores calculados automáticamente
// POST /api/admin/earnings/:year/:month/reset
router.post('/admin/earnings/:year/:month/reset', verifyJwt, verifyAdmin, resetToAutoCalculatedController);

// Sincronizar todos los datos de un año
// POST /api/admin/earnings/:year/sync
router.post('/admin/earnings/:year/sync', verifyJwt, verifyAdmin, syncYearDataController);

export default router;