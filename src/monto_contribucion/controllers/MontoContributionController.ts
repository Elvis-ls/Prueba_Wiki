import { Request, Response } from 'express';
import { AuthRequest } from '../../util/verifyJwt';
import {
  obtenerIdMontoContribucion,
  agregarPagoMensual,
  obtenerMontoContribucionConPagos,
  aprobarRechazarPago,
  agregarComentarioMontoContribucion,
  obtenerVoucherPago
} from '../services/montoContribucionService';

// Nota: obtenerIdMontoContribucionController usa Request en lugar de AuthRequest
// porque ya no obtiene el accionista_id del token, sino de los parámetros

// ============================================
// 1. OBTENER ID DE MONTO_CONTRIBUCION
// ============================================
export const obtenerIdMontoContribucionController = async (req: Request, res: Response) => {
  try {
    const { accionista_id, anio, mes } = req.params;

    if (!accionista_id) {
      res.status(400).json({ success: false, message: "El accionista_id es obligatorio" });
      return;
    }

    if (!anio || !mes) {
      res.status(400).json({ success: false, message: "Año y mes son obligatorios" });
      return;
    }

    const resultado = await obtenerIdMontoContribucion(
      Number(accionista_id),
      Number(anio),
      Number(mes)
    );

    res.status(200).json({ success: true, data: resultado });
  } catch (error: any) {
    console.error("Error al obtener ID:", error);
    res.status(404).json({
      success: false,
      message: error.message || "No se encontró el registro"
    });
  }
};

// ============================================
// 2. AGREGAR PAGO MENSUAL (ACCIONISTA)
// ============================================
export const agregarPagoMensualController = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" });
      return;
    }

    const { monto_id, fecha_aporte, cantidad_pagada } = req.body;

    if (!monto_id) {
      res.status(400).json({ success: false, message: "El campo 'monto_id' es obligatorio" });
      return;
    }

    if (!fecha_aporte) {
      res.status(400).json({ success: false, message: "El campo 'fecha_aporte' es obligatorio" });
      return;
    }

    if (!cantidad_pagada || isNaN(Number(cantidad_pagada)) || Number(cantidad_pagada) <= 0) {
      res.status(400).json({ 
        success: false, 
        message: "El campo 'cantidad_pagada' debe ser un número mayor a 0" 
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: "El voucher es obligatorio" });
      return;
    }

    const nuevoPago = await agregarPagoMensual({
      monto_id: Number(monto_id),
      fecha_aporte: new Date(fecha_aporte),
      cantidad_pagada: Number(cantidad_pagada),
      voucher: req.file.buffer,
      voucher_tipo: req.file.mimetype
    });

    res.status(201).json({
      success: true,
      message: "Pago registrado exitosamente. Estado: Pendiente de aprobación.",
      data: nuevoPago
    });
  } catch (error: any) {
    console.error("Error al agregar pago:", error);

    if (error.code === "MAX_PAGOS") {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    res.status(500).json({
      success: false,
      message: error.message || "Error al registrar el pago"
    });
  }
};

// ============================================
// 3. VER MIS MONTO_CONTRIBUCION CON PAGOS (ACCIONISTA)
// ============================================
export const verMisMontoContribucionController = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" });
      return;
    }

    const montos = await obtenerMontoContribucionConPagos(req.user.id);

    res.status(200).json({ success: true, data: montos });
  } catch (error: any) {
    console.error("Error al obtener montos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los montos de contribución"
    });
  }
};

// ============================================
// 4. VER MONTO_CONTRIBUCION DE UN ACCIONISTA (ADMIN)
// ============================================
export const verMontoContribucionAccionistaController = async (req: Request, res: Response) => {
  try {
    const { accionista_id } = req.params;

    if (!accionista_id) {
      res.status(400).json({ success: false, message: "El accionista_id es obligatorio" });
      return;
    }

    const montos = await obtenerMontoContribucionConPagos(Number(accionista_id));

    res.status(200).json({ success: true, data: montos });
  } catch (error: any) {
    console.error("Error al obtener montos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los montos de contribución"
    });
  }
};

// ============================================
// 5. APROBAR/RECHAZAR PAGO (ADMIN)
// ============================================
export const aprobarRechazarPagoController = async (req: Request, res: Response) => {
  try {
    const { pago_id } = req.params;
    const { aprobar, comentario } = req.body;

    if (!pago_id) {
      res.status(400).json({ success: false, message: "El pago_id es obligatorio" });
      return;
    }

    if (typeof aprobar !== 'boolean') {
      res.status(400).json({ 
        success: false, 
        message: "El campo 'aprobar' debe ser true o false" 
      });
      return;
    }

    const resultado = await aprobarRechazarPago(
      Number(pago_id),
      aprobar,
      comentario
    );

    res.status(200).json({
      success: true,
      message: resultado.mensaje,
      data: resultado
    });
  } catch (error: any) {
    console.error("Error al aprobar/rechazar pago:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error al procesar la solicitud"
    });
  }
};

// ============================================
// 6. AGREGAR COMENTARIO A MONTO_CONTRIBUCION (ADMIN)
// ============================================
export const agregarComentarioController = async (req: Request, res: Response) => {
  try {
    const { monto_id } = req.params;
    const { comentario } = req.body;

    if (!monto_id) {
      res.status(400).json({ success: false, message: "El monto_id es obligatorio" });
      return;
    }

    if (!comentario) {
      res.status(400).json({ success: false, message: "El comentario es obligatorio" });
      return;
    }

    const resultado = await agregarComentarioMontoContribucion(
      Number(monto_id),
      comentario
    );

    res.status(200).json({
      success: true,
      message: "Comentario agregado exitosamente",
      data: resultado
    });
  } catch (error: any) {
    console.error("Error al agregar comentario:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error al agregar comentario"
    });
  }
};

// ============================================
// 7. OBTENER VOUCHER DE UN PAGO (ADMIN)
// ============================================
export const obtenerVoucherController = async (req: Request, res: Response) => {
  try {
    const { pago_id } = req.params;

    if (!pago_id) {
      res.status(400).json({ success: false, message: "El pago_id es obligatorio" });
      return;
    }

    const archivo = await obtenerVoucherPago(Number(pago_id));

    res.setHeader("Content-Type", archivo.voucher_tipo || "application/octet-stream");
    res.setHeader("Content-Disposition", `inline; filename="voucher_${pago_id}"`);
    res.send(archivo.voucher);
  } catch (error: any) {
    console.error("Error al obtener voucher:", error);
    res.status(404).json({
      success: false,
      message: error.message || "Voucher no encontrado"
    });
  }
};