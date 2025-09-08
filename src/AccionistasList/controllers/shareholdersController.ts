// controllers/shareholdersController.ts
import { Request, Response } from "express";
import { AuthRequest } from '../../User/interfaces/authRequest';
import { AuthenticatedRequest } from '../../Admin/interfaces/authRequest';
import { ShareholdersService } from "../services/shareholdersService";
import { 
  getShareholdersQueryValidation, 
  createShareholderValidation,
  updateShareholderValidation,
  followShareholderValidation
} from '../validator/shareholdersValidation';

export class ShareholdersController {
  private service: ShareholdersService;

  constructor() {
    this.service = new ShareholdersService();
  }

  // Obtener lista de accionistas (usuarios y admins)
  getShareholders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const filters = getShareholdersQueryValidation(req.query);
      const currentUserId = req.user?.id;
      
      const result = await this.service.getShareholders(filters, currentUserId);
      
      res.json({ 
        success: true,
        data: result.shareholders,
        pagination: result.pagination
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || "Error al obtener la lista de accionistas" 
      });
    }
  };

  // Obtener accionista por ID (usuarios y admins)
  getShareholderById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ 
          success: false,
          error: 'ID de accionista inválido' 
        });
        return;
      }

      const shareholder = await this.service.getShareholderById(id);
      
      res.json({ 
        success: true,
        data: shareholder 
      });
    } catch (error: any) {
      const statusCode = error.message === 'Accionista no encontrado' ? 404 : 500;
      res.status(statusCode).json({ 
        success: false,
        error: error.message || "Error al obtener el accionista" 
      });
    }
  };

  // obtener acccionistas "Soguiendo" para modal en ProfileHeader
  async getFollowing(req: AuthRequest, res: Response) {
    try {
      // se llama al archivo AuthRequest.d.ts
      //para verificacion del userId y del role
      const userId = req.user?.userId;
      if (!userId) return res.status(400).json({ error: 'Usuario no autenticado' });

      console.log("el usuario si es vaido en getFollowing()");

      const following = await this.service.getFollowingOfUser(userId);
      
      console.log("respuesta del servicio: ", following);
      
      return res.status(200).json(following);
    } catch (error) {
      console.error("❌ Error al obtener los usuarios seguidos:", error);
      return res.status(500).json({ error: "Error interno" });
    }
  }



  // Crear nuevo accionista (solo admins)
  createShareholder = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Datos recibidos para crear accionista:', req.body);
      
      // Validar los datos usando el schema actualizado
      const validatedData = createShareholderValidation(req.body);
      console.log('Datos validados:', validatedData);
      
      const newShareholder = await this.service.createShareholder(validatedData);
      
      res.status(201).json({ 
        success: true,
        message: 'Accionista creado correctamente',
        data: newShareholder 
      });
    } catch (error: any) {
      console.error('Error en createShareholder:', error);
      
      // Manejar errores de validación de Zod
      if (error.name === 'ZodError') {
        const validationErrors = error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        res.status(400).json({ 
          success: false,
          error: 'Datos de entrada inválidos',
          details: validationErrors
        });
        return;
      }
      
      // Manejar errores específicos del negocio
      let statusCode = 500;
      if (error.message.includes('ya está registrado')) {
        statusCode = 409; // Conflict
      } else if (error.message.includes('no existe') || error.message.includes('No se encontró')) {
        statusCode = 404; // Not Found
      } else if (error.message.includes('debe existir') || error.message.includes('Debe proporcionar')) {
        statusCode = 400; // Bad Request
      }
      
      res.status(statusCode).json({ 
        success: false,
        error: error.message || "Error al crear el accionista" 
      });
    }
  };

  // Actualizar accionista (solo admins)
  updateShareholder = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ 
          success: false,
          error: 'ID de accionista inválido' 
        });
        return;
      }

      const validatedData = updateShareholderValidation(req.body);
      
      const updatedShareholder = await this.service.updateShareholder(id, validatedData);
      
      res.json({ 
        success: true,
        message: 'Accionista actualizado correctamente',
        data: updatedShareholder 
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || "Error al actualizar el accionista" 
      });
    }
  };

  // Eliminar accionista (solo admins)
  deleteShareholder = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ 
          success: false,
          error: 'ID de accionista inválido' 
        });
        return;
      }

      await this.service.deleteShareholder(id);
      
      res.json({ 
        success: true,
        message: 'Accionista eliminado correctamente' 
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || "Error al eliminar el accionista" 
      });
    }
  };

  toggleFollowShareholder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const currentUserId = req.user?.userId;
      if (!currentUserId) {
        res.status(401).json({ 
          success: false,
          error: 'Usuario no autenticado' 
        });
        return;
      }

      const shareholderUserId = parseInt(req.params.userId);
      
      if (isNaN(shareholderUserId)) {
        res.status(400).json({ 
          success: false,
          error: 'ID de usuario inválido' 
        });
        return;
      }

      const result = await this.service.toggleFollowShareholder(currentUserId, shareholderUserId);
      
      res.json({ 
        success: true,
        data: result 
      });
    } catch (error: any) {
      const statusCode = error.message.includes('seguirte a ti mismo') ? 400 : 500;
      res.status(statusCode).json({ 
        success: false,
        error: error.message || "Error al actualizar el seguimiento" 
      });
    }
  };
  // Método para administradores
  toggleFollowShareholderForAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const currentAdminId = req.adminId;
      if (!currentAdminId) {
        res.status(401).json({ 
          success: false,
          error: 'Administrador no autenticado' 
        });
        return;
      }

      const shareholderUserId = parseInt(req.params.userId);
      
      if (isNaN(shareholderUserId)) {
        res.status(400).json({ 
          success: false,
          error: 'ID de usuario inválido' 
        });
        return;
      }

      // Para admin, usar el adminId como followerId
      const result = await this.service.toggleFollowShareholderForAdmin(currentAdminId, shareholderUserId);
      
      res.json({ 
        success: true,
        data: result 
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || "Error al actualizar el seguimiento" 
      });
    }
  };
  // Método para admin
  getShareholdersForAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const currentAdminId = req.adminId;
      const { page = 1, limit = 10, tipo, busqueda } = req.query;

      const result = await this.service.getShareholdersForAdmin({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        tipo: tipo as string,
        busqueda: busqueda as string,
        currentAdminId: currentAdminId // Pasar el ID del admin actual
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || "Error al obtener accionistas" 
      });
    }
  };

  getAllShareholdersForAdmin = async(req: Request, res: Response):Promise<void> => {
    try {
      const currentAdminId = (req as any).adminId as number | undefined;
      const tipo     = req.query.tipo    as string | undefined;
      const busqueda = req.query.busqueda as string | undefined;

      const result = await this.service.getAllShareholdersForAdmin({
        currentAdminId,
        tipo,
        busqueda
      });

      res.json({
        success:    true,
        data:       result.data,
        pagination: result.pagination
      });
    } catch (err: any) {
      console.error('Error controller.getAllShareholdersForAdmin:', err);
      res.status(500).json({
        success: false,
        error:   err.message || 'Error al obtener todos los accionistas'
      });
    }
  }

  // Obtener estadísticas de accionistas (admins)
  getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.service.getStats();
      
      res.json({ 
        success: true,
        data: stats 
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || "Error al obtener las estadísticas" 
      });
    }
  };

  // Obtener usuarios disponibles para agregar como accionistas (admins)
  getAvailableUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.service.getAvailableUsers();
      
      res.json({ 
        success: true,
        data: users 
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || "Error al obtener usuarios disponibles" 
      });
    }
  };
}