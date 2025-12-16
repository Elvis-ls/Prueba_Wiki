import { Request, Response } from 'express';
import { 
  inviteReferral, 
  getReferralsByAccionista, 
  updateReferralStatus, 
  getAllReferrals, 
  getReferralStats 
} from '../services/referidosService';

// Invitar un nuevo referido
export const inviteReferralController = async (req: Request, res: Response) => {
  try {
    const {
      invitador_id,
      nombres,
      apellidos,
      email,
      cedula,
      telefono
    } = req.body;

    // Validaciones básicas
    if (!invitador_id || !nombres || !apellidos || !email || !cedula) {
      res.status(400).json({
        success: false,
        message: 'Los campos invitador_id, nombres, apellidos, email y cedula son obligatorios'
      });
      return;
    }

    const referralData = {
      invitador_id: Number(invitador_id),
      nombres,
      apellidos,
      email,
      cedula,
      telefono
    };

    const referral = await inviteReferral(referralData);

    res.status(201).json({
      success: true,
      message: 'Referido invitado exitosamente',
      data: referral
    });
  } catch (error: any) {
    console.error('Error al invitar referido:', error);
    
    let statusCode = 500;
    if (error.message.includes('no existe') || error.message.includes('no encontrado')) {
      statusCode = 404;
    } else if (error.message.includes('Ya existe') || error.message.includes('ya es accionista')) {
      statusCode = 409;
    } else if (error.message.includes('debe tener') || error.message.includes('es requerido') || error.message.includes('debe proporcionar')) {
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      message: 'Error al invitar referido',
      error: error.message
    });
  }
};

// Obtener referidos de un accionista específico
export const getReferralsByAccionistaController = async (req: Request, res: Response) => {
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

    const referrals = await getReferralsByAccionista(accionistaIdNum);

    // Estadísticas básicas para el accionista
    const stats = {
      total_referidos: referrals.length,
      pendientes: referrals.filter(r => r.estado === 'Pendiente').length,
      registrados: referrals.filter(r => r.estado === 'Registrado').length,
      rechazados: referrals.filter(r => r.estado === 'Rechazado').length
    };

    res.status(200).json({
      success: true,
      data: referrals,
      stats,
      total: referrals.length,
      message: referrals.length === 0 
        ? 'No se encontraron referidos para este accionista' 
        : `Se encontraron ${referrals.length} referido(s) para el accionista ID ${accionistaIdNum}`
    });
  } catch (error: any) {
    console.error('Error al obtener referidos del accionista:', error);
    
    let statusCode = 500;
    if (error.message.includes('no encontrado')) {
      statusCode = 404;
    } else if (error.message.includes('inválido')) {
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      message: 'Error al obtener referidos del accionista',
      error: error.message
    });
  }
};

// Actualizar estado de referido (Admin)
export const updateReferralStatusController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estado, referido_id } = req.body;
    const referralId = Number(id);

    if (!referralId || isNaN(referralId) || referralId <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID de referido inválido'
      });
      return;
    }

    if (!estado) {
      res.status(400).json({
        success: false,
        message: 'El estado es requerido'
      });
      return;
    }

    const validStatuses = ['Pendiente', 'Registrado', 'Rechazado'];
    if (!validStatuses.includes(estado)) {
      res.status(400).json({
        success: false,
        message: 'Estado inválido. Use: Pendiente, Registrado, Rechazado'
      });
      return;
    }

    // Si el estado es "Registrado", validar referido_id
    if (estado === 'Registrado' && referido_id && (isNaN(Number(referido_id)) || Number(referido_id) <= 0)) {
      res.status(400).json({
        success: false,
        message: 'referido_id debe ser un número válido cuando el estado es "Registrado"'
      });
      return;
    }

    const updatedReferral = await updateReferralStatus(
      referralId, 
      estado, 
      referido_id ? Number(referido_id) : undefined
    );

    res.status(200).json({
      success: true,
      message: 'Estado del referido actualizado exitosamente',
      data: updatedReferral
    });
  } catch (error: any) {
    console.error('Error al actualizar estado del referido:', error);
    
    let statusCode = 500;
    if (error.message.includes('no encontrado') || error.message.includes('no existe')) {
      statusCode = 404;
    } else if (error.message.includes('inválido')) {
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      message: 'Error al actualizar estado del referido',
      error: error.message
    });
  }
};

// Obtener todos los referidos (Admin)
export const getAllReferralsController = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const estado = req.query.estado as string;

    // Validar estado si se proporciona
    if (estado && !['Pendiente', 'Registrado', 'Rechazado'].includes(estado)) {
      res.status(400).json({
        success: false,
        message: 'Estado inválido. Use: Pendiente, Registrado, Rechazado'
      });
      return;
    }

    const result = await getAllReferrals(page, limit, estado);

    res.status(200).json({
      success: true,
      data: result.referrals,
      pagination: result.pagination,
      filters: { estado: estado || 'Todos' },
      message: `Se encontraron ${result.referrals.length} referido(s)`
    });
  } catch (error: any) {
    console.error('Error al obtener todos los referidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener todos los referidos',
      error: error.message
    });
  }
};

// Obtener estadísticas de referidos (Admin)
export const getReferralStatsController = async (req: Request, res: Response) => {
  try {
    const stats = await getReferralStats();

    res.status(200).json({
      success: true,
      data: stats,
      message: 'Estadísticas de referidos obtenidas exitosamente'
    });
  } catch (error: any) {
    console.error('Error al obtener estadísticas de referidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de referidos',
      error: error.message
    });
  }
};