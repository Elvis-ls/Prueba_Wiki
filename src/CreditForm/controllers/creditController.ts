import { Request, Response } from 'express';
import { 
  getAllCredits, 
  createCredit, 
  updateCredit, 
  deleteCredit, 
  getCreditsByUserId, 
  getCreditById 
} from '../services/creditService';

// Obtener todos los créditos (Admin)
export const getAllCreditsController = async (req: Request, res: Response) => {
  try {
    const credits = await getAllCredits();
    res.status(200).json({
      success: true,
      data: credits,
      total: credits.length,
      message: `Se encontraron ${credits.length} crédito(s)`
    });
  } catch (error: any) {
    console.error('Error al obtener todos los créditos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener todos los créditos',
      error: error.message
    });
  }
};

// Crear un nuevo crédito (Admin)
export const createCreditController = async (req: Request, res: Response) => {
  try {
    const { 
      creditFormId, 
      userId, 
      montoAprobado, 
      tasaInteres, 
      plazoMeses, 
      cuotaMensual, 
      fechaInicio, 
      fechaVencimiento, 
      notas 
    } = req.body;

    // Validaciones básicas
    if (!creditFormId || !userId || !montoAprobado || !tasaInteres || !plazoMeses || !cuotaMensual || !fechaInicio || !fechaVencimiento) {
      res.status(400).json({
        success: false,
        message: 'Todos los campos requeridos deben ser proporcionados'
      });
      return;
    }

    const creditData = {
      creditFormId: Number(creditFormId),
      userId: Number(userId),
      montoAprobado: Number(montoAprobado),
      tasaInteres: Number(tasaInteres),
      plazoMeses: Number(plazoMeses),
      cuotaMensual: Number(cuotaMensual),
      fechaInicio,
      fechaVencimiento,
      notas
    };

    const newCredit = await createCredit(creditData);

    res.status(201).json({
      success: true,
      message: 'Crédito creado exitosamente',
      data: newCredit
    });
  } catch (error: any) {
    console.error('Error al crear el crédito:', error);
    
    let statusCode = 500;
    if (error.message.includes('no existe') || error.message.includes('no encontrado')) {
      statusCode = 404;
    } else if (error.message.includes('ya existe') || error.message.includes('duplicado')) {
      statusCode = 409;
    } else if (error.message.includes('debe ser') || error.message.includes('inválido')) {
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      message: 'Error al crear el crédito',
      error: error.message
    });
  }
};

// Actualizar un crédito (Admin)
export const updateCreditController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const creditId = Number(id);

    if (!creditId || isNaN(creditId)) {
      res.status(400).json({
        success: false,
        message: 'ID de crédito inválido'
      });
      return;
    }

    const updateData = req.body;

    // Convertir números si están presentes
    if (updateData.montoAprobado) updateData.montoAprobado = Number(updateData.montoAprobado);
    if (updateData.tasaInteres) updateData.tasaInteres = Number(updateData.tasaInteres);
    if (updateData.plazoMeses) updateData.plazoMeses = Number(updateData.plazoMeses);
    if (updateData.cuotaMensual) updateData.cuotaMensual = Number(updateData.cuotaMensual);

    const updatedCredit = await updateCredit(creditId, updateData);

    res.status(200).json({
      success: true,
      message: 'Crédito actualizado exitosamente',
      data: updatedCredit
    });
  } catch (error: any) {
    console.error('Error al actualizar el crédito:', error);
    
    let statusCode = 500;
    if (error.message.includes('no encontrado')) {
      statusCode = 404;
    } else if (error.message.includes('debe ser') || error.message.includes('inválido')) {
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      message: 'Error al actualizar el crédito',
      error: error.message
    });
  }
};

// Eliminar un crédito (Admin)
export const deleteCreditController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const creditId = Number(id);

    if (!creditId || isNaN(creditId)) {
      res.status(400).json({
        success: false,
        message: 'ID de crédito inválido'
      });
      return;
    }

    const result = await deleteCredit(creditId);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error: any) {
    console.error('Error al eliminar el crédito:', error);
    
    let statusCode = 500;
    if (error.message.includes('no encontrado')) {
      statusCode = 404;
    }

    res.status(statusCode).json({
      success: false,
      message: 'Error al eliminar el crédito',
      error: error.message
    });
  }
};

// Obtener créditos por ID de usuario
export const getCreditsByUserIdController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const userIdNum = Number(userId);

    if (!userIdNum || isNaN(userIdNum)) {
      res.status(400).json({
        success: false,
        message: 'ID de usuario inválido'
      });
      return;
    }

    const credits = await getCreditsByUserId(userIdNum);

    res.status(200).json({
      success: true,
      data: credits,
      total: credits.length,
      message: credits.length === 0 
        ? 'No se encontraron créditos para este usuario' 
        : `Se encontraron ${credits.length} crédito(s) para el usuario`
    });
  } catch (error: any) {
    console.error('Error al obtener créditos del usuario:', error);
    
    let statusCode = 500;
    if (error.message.includes('no encontrado')) {
      statusCode = 404;
    }

    res.status(statusCode).json({
      success: false,
      message: 'Error al obtener créditos del usuario',
      error: error.message
    });
  }
};

// Obtener crédito por ID
export const getCreditByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const creditId = Number(id);

    if (!creditId || isNaN(creditId)) {
      res.status(400).json({
        success: false,
        message: 'ID de crédito inválido'
      });
      return;
    }

    const credit = await getCreditById(creditId);

    res.status(200).json({
      success: true,
      data: credit,
      message: 'Crédito encontrado exitosamente'
    });
  } catch (error: any) {
    console.error('Error al obtener el crédito:', error);
    
    let statusCode = 500;
    if (error.message.includes('no encontrado')) {
      statusCode = 404;
    }

    res.status(statusCode).json({
      success: false,
      message: 'Error al obtener el crédito',
      error: error.message
    });
  }
};