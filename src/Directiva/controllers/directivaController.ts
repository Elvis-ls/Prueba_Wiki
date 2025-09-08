import { Request, Response } from "express";
import { DirectivaService } from "../services/directivaService";
import { 
  updateDirectivaContentValidation,
  updateDirectivaMemberValidation,
  createDirectivaMemberValidation
} from "../validator/directivaValidation";

export class DirectivaController {
  public service: DirectivaService;

  constructor() {
    this.service = new DirectivaService();
  }

  // Obtener contenido completo de directiva (usuarios y admins)
  getDirectivaContent = async (req: Request, res: Response): Promise<void> => {
    try {
      const content = await this.service.getDirectivaContent();
      
      res.json({ 
        success: true,
        data: content
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || "Error al obtener el contenido de la directiva" 
      });
    }
  };

  // Obtener miembros de la directiva (usuarios y admins)
  getDirectivaMembers = async (req: Request, res: Response): Promise<void> => {
    try {
      const members = await this.service.getDirectivaMembers();
      
      res.json({ 
        success: true,
        data: members
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || "Error al obtener los miembros de la directiva" 
      });
    }
  };

  // Actualizar contenido general de directiva (solo admins)
  updateDirectivaContent = async (req: Request, res: Response): Promise<void> => {
    try {
      // Usar un adminId por defecto o extraerlo del token/body
      const adminId = req.body.adminId || 1; // Valor por defecto

      const validatedData = updateDirectivaContentValidation(req.body);
      
      const updatedContent = await this.service.updateDirectivaContent(validatedData, adminId);
      
      res.json({ 
        success: true,
        message: 'Contenido de directiva actualizado correctamente',
        data: updatedContent 
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || "Error al actualizar el contenido de la directiva" 
      });
    }
  };

  // Actualizar miembro específico (solo admins)
  updateDirectivaMember = async (req: Request, res: Response): Promise<void> => {
    try {
      const memberId = parseInt(req.params.id);
      const adminId = req.body.adminId || 1; // Valor por defecto

      if (isNaN(memberId)) {
        res.status(400).json({ 
          success: false,
          error: 'ID de miembro inválido' 
        });
        return;
      }

      const validatedData = updateDirectivaMemberValidation(req.body);
      
      const updatedMember = await this.service.updateDirectivaMember(memberId, validatedData, adminId);
      
      res.json({ 
        success: true,
        message: 'Miembro actualizado correctamente',
        data: updatedMember 
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || "Error al actualizar el miembro" 
      });
    }
  };

  // Crear nuevo miembro (solo admins)
  createDirectivaMember = async (req: Request, res: Response): Promise<void> => {
    try {
      const adminId = req.body.adminId || 1; // Valor por defecto

      const validatedData = createDirectivaMemberValidation(req.body);
      
      const newMember = await this.service.createDirectivaMember(validatedData, adminId);
      
      res.json({ 
        success: true,
        message: 'Miembro creado correctamente',
        data: newMember 
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || "Error al crear el miembro" 
      });
    }
  };

  // Eliminar miembro (solo admins)
  deleteDirectivaMember = async (req: Request, res: Response): Promise<void> => {
    try {
      const memberId = parseInt(req.params.id);

      if (isNaN(memberId)) {
        res.status(400).json({ 
          success: false,
          error: 'ID de miembro inválido' 
        });
        return;
      }

      await this.service.deleteDirectivaMember(memberId);
      
      res.json({ 
        success: true,
        message: 'Miembro eliminado correctamente'
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || "Error al eliminar el miembro" 
      });
    }
  };

  // Actualizar múltiples miembros (solo admins)
  updateMultipleMembers = async (req: Request, res: Response): Promise<void> => {
    try {
      const adminId = req.body.adminId || 1; // Valor por defecto
      const { members } = req.body;

      if (!Array.isArray(members)) {
        res.status(400).json({ 
          success: false,
          error: 'Se esperaba un array de miembros' 
        });
        return;
      }

      const updatedMembers = await this.service.updateMultipleMembers(members, adminId);
      
      res.json({ 
        success: true,
        message: 'Miembros actualizados correctamente',
        data: updatedMembers 
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || "Error al actualizar los miembros" 
      });
    }
  };
}