// routes/institutionalEarningsRoutes.ts
import express from 'express';
import { InstitutionalEarningsController } from '../controllers/institutionalEarningsController';

const router = express.Router();
const controller = new InstitutionalEarningsController();

// ==================== RUTAS PARA USUARIOS (SOLO LECTURA) ====================

// Obtener ganancias por año
router.get('/earnings', async (req, res, next) => {
  await controller.getEarningsByYear(req, res);
});

// Obtener resumen de ganancias de un año
router.get('/earnings/summary', async (req, res, next) => {
  await controller.getYearSummary(req, res);
});

// Obtener años disponibles
router.get('/earnings/years', async (req, res, next) => {
  await controller.getAvailableYears(req, res);
});

// ==================== RUTAS PARA ADMINISTRADORES (LECTURA Y ESCRITURA) ====================

// Rutas de lectura para administradores (mismas que usuarios)
router.get('/admin/earnings', async (req, res, next) => {
  await controller.getEarningsByYear(req, res);
});

router.get('/admin/earnings/summary', async (req, res, next) => {
  await controller.getYearSummary(req, res);
});

router.get('/admin/earnings/years', async (req, res, next) => {
  await controller.getAvailableYears(req, res);
});

// ==================== RUTAS EXCLUSIVAS PARA ADMINISTRADORES (ESCRITURA) ====================

// Actualizar ganancias específicas de un mes
router.put('/admin/earnings/:year/:month', async (req, res, next) => {
  await controller.updateEarnings(req, res);
});

// Actualizar múltiples ganancias de un año (RUTA PRINCIPAL PARA EL FRONTEND)
router.put('/admin/earnings/:year', async (req, res, next) => {
  await controller.updateMultipleEarnings(req, res);
});

// Ruta alternativa para guardar cambios (POST)
router.post('/admin/earnings/:year/save', async (req, res, next) => {
  await controller.updateMultipleEarnings(req, res);
});

// Resetear ganancias de un mes a valores calculados automáticamente
router.post('/admin/earnings/:year/:month/reset', async (req, res, next) => {
  await controller.resetToAutoCalculated(req, res);
});

// Sincronizar todos los datos de un año
router.post('/admin/earnings/:year/sync', async (req, res, next) => {
  await controller.syncYearData(req, res);
});

export default router;