import express from 'express';
import { verifyJwt } from '../../util/verifyJwt';
import { verifyAdmin } from '../../util/verifyAdmin';
import { uploadMemory } from '../../util/upload';
import {
  obtenerIdMontoContribucionController,
  agregarPagoMensualController,
  verMisMontoContribucionController,
  verMontoContribucionAccionistaController,
  aprobarRechazarPagoController,
  agregarComentarioController,
  obtenerVoucherController
} from '../controllers/montoContribucionController';

const router = express.Router();

// ============================================
// RUTAS PARA ACCIONISTAS
// ============================================

/**
 * 1. Obtener ID del monto_contribucion
 * GET /api/contribution/obtener-id/:accionista_id/:anio/:mes
 * Ejemplo: GET /api/contribution/obtener-id/5/2023/11
 */
router.get(
  '/contribution/obtener-id/:accionista_id/:anio/:mes',
  verifyJwt,
  obtenerIdMontoContribucionController
);

/**
 * 2. Agregar pago mensual
 * POST /api/contribution/agregar-pago
 * Body: monto_id, fecha_aporte, cantidad_pagada
 * File: voucher
 */
router.post(
  '/contribution/agregar-pago',
  verifyJwt,
  uploadMemory.single('voucher'),
  agregarPagoMensualController
);

/**
 * 3. Ver mis monto_contribucion con sus pagos
 * GET /api/contribution/mis-contribuciones
 */
router.get(
  '/contribution/mis-contribuciones',
  verifyJwt,
  verMisMontoContribucionController
);

// ============================================
// RUTAS PARA ADMINISTRADOR
// ============================================

/**
 * 4. Ver monto_contribucion de un accionista específico
 * GET /api/admin/contribution/accionista/:accionista_id
 */
router.get(
  '/admin/contribution/accionista/:accionista_id',
  verifyJwt,
  verifyAdmin,
  verMontoContribucionAccionistaController
);

/**
 * 5. Aprobar/Rechazar un pago
 * PUT /api/admin/contribution/pago/:pago_id/revisar
 * Body: { aprobar: true/false, comentario?: string }
 */
router.put(
  '/admin/contribution/pago/:pago_id/revisar',
  verifyJwt,
  verifyAdmin,
  aprobarRechazarPagoController
);

/**
 * 6. Agregar comentario a un monto_contribucion
 * PUT /api/admin/contribution/:monto_id/comentario
 * Body: { comentario: string }
 */
router.put(
  '/admin/contribution/:monto_id/comentario',
  verifyJwt,
  verifyAdmin,
  agregarComentarioController
);

/**
 * 7. Obtener voucher de un pago
 * GET /api/admin/contribution/pago/:pago_id/voucher
 */
router.get(
  '/admin/contribution/pago/:pago_id/voucher',
  verifyJwt,
  verifyAdmin,
  obtenerVoucherController
);

export default router;