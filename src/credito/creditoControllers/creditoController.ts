import { Request, Response } from 'express';
import { 
  createCredito, 
  getCreditosByAccionista, 
  getCreditoById 
} from '../services/creditoService';

// Crear un nuevo crédito
export const createCreditoController = async (req: Request, res: Response) => {
  try {
    const {
      formulario_id,
      accionista_id,
      monto_aprobado,
      tasa_interes,
      plazo_meses,
      cuota_mensual,
      fecha_inicio,
      fecha_vencimiento
    } = req.body;

    if (!formulario_id || !accionista_id || !monto_aprobado || !tasa_interes || !plazo_meses || !cuota_mensual || !fecha_inicio || !fecha_vencimiento) {
      res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios'
      });
      return;
    }

    const creditoData = {
      formulario_id: Number(formulario_id),
      accionista_id: Number(accionista_id),
      monto_aprobado: Number(monto_aprobado),
      tasa_interes: Number(tasa_interes),
      plazo_meses: Number(plazo_meses),
      cuota_mensual: Number(cuota_mensual),
      fecha_inicio,
      fecha_vencimiento
    };

    const credito = await createCredito(creditoData);

    res.status(201).json({
      success: true,
      message: 'Crédito creado exitosamente',
      data: credito
    });
  } catch (error: any) {
    console.error('Error al crear crédito:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear crédito',
      error: error.message
    });
  }
};

// Obtener créditos de un accionista
export const getCreditosByAccionistaController = async (req: Request, res: Response) => {
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

    const result = await getCreditosByAccionista(accionistaIdNum);

    res.status(200).json({
      success: true,
      data: result,
      total: result.creditos.length,
      message: `Se encontraron ${result.creditos.length} crédito(s)`
    });
  } catch (error: any) {
    console.error('Error al obtener créditos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener créditos',
      error: error.message
    });
  }
};

// Obtener crédito por ID
export const getCreditoByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const creditoId = Number(id);

    if (!creditoId || isNaN(creditoId) || creditoId <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID de crédito inválido'
      });
      return;
    }

    const credito = await getCreditoById(creditoId);

    res.status(200).json({
      success: true,
      data: credito,
      message: 'Crédito encontrado exitosamente'
    });
  } catch (error: any) {
    console.error('Error al obtener crédito:', error);
    
    let statusCode = 500;
    if (error.message.includes('no encontrado')) {
      statusCode = 404;
    }

    res.status(statusCode).json({
      success: false,
      message: 'Error al obtener crédito',
      error: error.message
    });
  }
};