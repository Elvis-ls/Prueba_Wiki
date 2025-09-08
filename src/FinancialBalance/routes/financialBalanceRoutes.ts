import express from 'express';
import { FinancialBalanceController } from '../controllers/financialBalanceController';

const router = express.Router();
const controller = new FinancialBalanceController();

// Rutas para usuarios (solo lectura)
// Obtener balances por año
router.get('/balances', async (req, res, next) => {
  await controller.getBalancesByYear(req, res);
});

// Obtener resumen financiero de un año
router.get('/balances/summary', async (req, res, next) => {
  await controller.getYearSummary(req, res);
});

// Obtener años disponibles
router.get('/balances/years', async (req, res, next) => {
  await controller.getAvailableYears(req, res);
});

// Rutas para administradores (lectura)
router.get('/admin/balances', async (req, res, next) => {
  await controller.getBalancesByYear(req, res);
});

router.get('/admin/balances/summary', async (req, res, next) => {
  await controller.getYearSummary(req, res);
});

router.get('/admin/balances/years', async (req, res, next) => {
  await controller.getAvailableYears(req, res);
});

// Rutas exclusivas para administradores (escritura)
// Actualizar balance específico
router.put('/admin/balances/:year/:month', async (req, res, next) => {
  await controller.updateBalance(req, res);
});

// Actualizar múltiples balances de un año (esta es la ruta que necesitas)
router.put('/admin/balances/:year', async (req, res, next) => {
  await controller.updateMultipleBalances(req, res);
});

// Ruta alternativa para guardar cambios (POST)
router.post('/admin/balances/:year/save', async (req, res, next) => {
  await controller.updateMultipleBalances(req, res);
});

// Resetear balance a valores calculados automáticamente
router.post('/admin/balances/:year/:month/reset', async (req, res, next) => {
  await controller.resetToAutoCalculated(req, res);
});

export default router;