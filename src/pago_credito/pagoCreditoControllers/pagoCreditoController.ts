import { Request, Response } from 'express';
import { 
  registrarPago, 
  getPagosByCredito, 
  getEstadoPagosAccionista 
} from '../services/pagoCreditoService';

// Registrar un pago
export const registrarPagoController = async (req: Request, res: Response) => {
  try {
    const {
      credito_id,
      numero_cuota,
      monto_pagado,
      fecha_pago
    } = req.body;

    if (!credito_id || !numero_cuota || !monto_pagado || !fecha_pago) {
      res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios'
      });
      return;
    }

    const pagoData = {
      credito_id: Number(credito_id),
      numero_cuota: Number(numero_cuota),
      monto_pagado: Number(monto_pagado),
      fecha_pago
    };

    const pago = await registrarPago(pagoData);

    res.status(200).json({
      success: true,
      message: 'Pago registrado exitosamente',
      data: pago
    });
  } catch (error: any) {
    console.error('Error al registrar pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar pago',
      error: error.message
    });
  }
};

// Obtener pagos de un crédito
export const getPagosByCreditoController = async (req: Request, res: Response) => {
  try {
    const { creditoId } = req.params;
    const creditoIdNum = Number(creditoId);

    if (!creditoIdNum || isNaN(creditoIdNum) || creditoIdNum <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID de crédito inválido'
      });
      return;
    }

    const pagos = await getPagosByCredito(creditoIdNum);

    res.status(200).json({
      success: true,
      data: pagos,
      total: pagos.length,
      message: `Se encontraron ${pagos.length} pago(s)`
    });
  } catch (error: any) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pagos',
      error: error.message
    });
  }
};

// Obtener estado de pagos de un accionista (alDiaCreditos)
export const getEstadoPagosAccionistaController = async (req: Request, res: Response) => {
  try {
    const { accionistaId } = req.params;
    const accionistaIdNum = Number(accionistaId);

    if (!accionistaIdNum || isNaN(accionistaIdNum) || accionistaIdNum <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID de accionista inválido'
      });
      return;
    }

    const estado = await getEstadoPagosAccionista(accionistaIdNum);

    res.status(200).json({
      success: true,
      data: estado,
      message: estado.alDiaCreditos 
        ? 'El accionista está al día con sus créditos' 
        : 'El accionista tiene pagos pendientes o vencidos'
    });
  } catch (error: any) {
    console.error('Error al obtener estado de pagos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estado de pagos',
      error: error.message
    });
  }
};