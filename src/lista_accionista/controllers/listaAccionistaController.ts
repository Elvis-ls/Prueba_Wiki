import { Request, Response } from "express";
import { AuthRequest } from '../../util/verifyJwt';
import { createShareholder, deleteShareholder, findAllWithoutPagination, 
  getAvailableUsers, 
  getFollowingOfUser, 
  getShareholderById, getShareholders, getShareholdersForAdmin, getStats, toggleFollowShareholder, 
  toggleFollowShareholderForAdmin, updateShareholder } from '../services/shareholdersService';

// Obtener todos los accionistas para admins (sin paginar)
export const getAllShareholdersForAdmin = async(req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Usuario no autenticado" });
      return;
    }
    const currentAdminId = req.user.id;
    const tipo     = req.query.tipo    as string | undefined;
    const busqueda = req.query.busqueda as string | undefined;

    const result = await findAllWithoutPagination({
        currentAdminId,
        tipo,
        busqueda
      });
      
      res.json({
      success: true,
      data: result,
      pagination: {
        page: 1,
        limit: result.length,
        total: result.length,
        totalPages: 1,
      },
    });
  } catch (error) {
    console.error('Error interno del servidor:', error);
    res.status(500).json({ success: false, error:'Error al obtener todos los accionistas' });
  }
};

// Obtener lista de accionistas para usuarios
export const getShareholdersController = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Usuario no autenticado" });
      return;
    }
    const currentUserId = req.user.id;

    const filters = req.query;
    
    const result = await getShareholders(filters, currentUserId);
    res.json({ success: true, data: result.shareholders, pagination: result.pagination });
  } catch (error) {
    console.error('Error interno del servidor:', error);
    res.status(500).json({ success: false, error:'Error al obtener la lista de accionistas' });
  }
};

// Obtener lista de accionistas para admins
export const getShareholdersAdminController = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.params.id;

    const filters = req.query;
    
    const result = await getShareholders(filters, Number(currentUserId));
    res.json({ success: true, data: result.shareholders, pagination: result.pagination });
  } catch (error) {
    console.error('Error interno del servidor:', error);
    res.status(500).json({ success: false, error:'Error al obtener la lista de accionistas' });
  }
};

// Obtener un accionista por su ID
export const getShareholderByIdController = async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    const shareholder = await getShareholderById(Number(id));
    res.json({ success: true, data: shareholder });
  } catch (error) {
    console.error('Error interno del servidor:', error);
    res.status(500).json({ success: false, error:'Error al obtener el accionista' });
  }
};

// Crear un nuevo accionista (solo admins)
export const createShareholderController = async (req: Request, res: Response) => {
  try {
    const validatedData = req.body;
    const newShareholder = await createShareholder(validatedData);
    res.status(201).json({ success: true, message: 'Accionista creado correctamente', data: newShareholder });
  } catch (error) {
    console.error('Error en createShareholderController:', error);
    res.status(400).json({ success: false, error: 'Datos inválidos' });
  }
};

// Actualizar un accionista (solo admins)
export const updateShareholderController = async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    const validatedData = req.body;
    const updatedShareholder = await updateShareholder(Number(id), validatedData);
    res.json({ success: true, message: 'Accionista actualizado correctamente', data: updatedShareholder });
  } catch (error) {
    console.error('Error interno del servidor:', error);
    res.status(500).json({ success: false, error:'Error al actualizar el accionista' });
  }
};

// Eliminar un accionista (solo admins)
export const deleteShareholderController = async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    await deleteShareholder(Number(id));
    res.json({ success: true, message: 'Accionista eliminado correctamente' });
  } catch (error) {
    console.error('Error interno del servidor:', error);
    res.status(500).json({ success: false, error:'Error al eliminar el accionista' });
  }
};

// Seguir o dejar de seguir un accionista
export const toggleFollowShareholderController = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Usuario no autenticado" });
      return;
    }
    const currentUserId = req.user.id;

    const shareholderUserId = req.params.userId;

    const result = await toggleFollowShareholder(currentUserId, Number(shareholderUserId));
    res.json({ success: true, data: result });
  } catch (error: any) {
    const statusCode = error.message.includes('seguirte a ti mismo') ? 400 : 500;
    res.status(statusCode).json({ success: false, error: error.message || "Error al actualizar el seguimiento" });
  }
};

// Métodos para admins (seguir accionista)
export const toggleFollowShareholderForAdminController = async (req: Request, res: Response) => {
  try {
    const currentAdminId = (req as any).adminId;
    if (!currentAdminId) {
      res.status(401).json({ success: false, error: 'Administrador no autenticado' });
      return;
    }

    const shareholderUserId = req.params.userId;

    const result = await toggleFollowShareholderForAdmin(currentAdminId, Number(shareholderUserId));
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error interno del servidor:', error);
    res.status(500).json({ success: false, error:'Error al actualizar el seguimiento' });
  }
};

// Obtener accionistas para admins (paginado)
export const getShareholdersForAdminController = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Usuario no autenticado" });
      return;
    }
    const currentAdminId = req.user.id;

    const { page = 1, limit = 10, tipo, busqueda } = req.query;
    const result = await getShareholdersForAdmin({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      tipo: tipo as string,
      busqueda: busqueda as string,
      currentAdminId
    });
    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) {
    console.error('Error interno del servidor:', error);
    res.status(500).json({ success: false, error:'Error al obtener accionistas' });
  }
};

// Obtener estadísticas de accionistas (admins)
export const getStatsController = async (req: Request, res: Response) => {
  try {
    const stats = await getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error interno del servidor:', error);
    res.status(500).json({ success: false, error:'Error al obtener las estadísticas' });
  }
};

// Obtener usuarios disponibles para agregar como accionistas (admins)
export const getAvailableUsersController = async (req: Request, res: Response) => {
  try {
    const users = await getAvailableUsers();
    res.json({ success: true, data: users });
  } catch (error: any) {
    console.error('Error interno del servidor:', error);
    res.status(500).json({ success: false, error:'Error al obtener usuarios disponibles' });
  }
};

export const getFollowingController = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Usuario no autenticado" });
      return;
    }
    const userId = req.user?.id;

    const following = await getFollowingOfUser(userId);

    res.status(200).json(following);
  } catch (error) {
    console.error('Error interno del servidor:', error);
    res.status(500).json({ error: "Error al obtener los usuarios seguidos" });
  }
};
// Verificar si un accionista tiene 6 meses de antigüedad
export const checkSixMonthsController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const shareholderId = parseInt(id);

    if (isNaN(shareholderId) || shareholderId <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID de accionista inválido'
      });
      return;
    }

    const result = await checkSixMonthsAntiquity(shareholderId);

    res.json({
      success: true,
      data: result,
      message: result.tiene6meses 
        ? 'El accionista tiene 6 meses o más de antigüedad' 
        : 'El accionista tiene menos de 6 meses de antigüedad'
    });

  } catch (error: any) {
    console.error('Error al verificar antigüedad:', error);
    
    const statusCode = error.message.includes('no encontrado') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: 'Error al verificar la antigüedad del accionista',
      error: error.message
    });
  }
};