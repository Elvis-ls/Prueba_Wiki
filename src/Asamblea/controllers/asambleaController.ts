import { Request, Response } from 'express';
import { AuthRequest } from '../../User/interfaces/authRequest';
import { AuthenticatedRequest } from '../../Admin/interfaces/authRequest';
import { AsambleaService } from '../services/asambleaService';
import { 
  asambleaValidation,
  updateAsambleaValidation,
  createAsambleaValidation,
  getAsambleaQueryValidation
} from '../validators/asambleaValidation';

export class AsambleaController {
  private service: AsambleaService;

  constructor() {
    this.service = new AsambleaService();
  }

  // Obtener todas las asambleas para la vista de accionistas
  getAllAsambleas = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {

      const filters = getAsambleaQueryValidation(req.query);

      const asambleas = await this.service.getAsambleas(filters);
      res.json({
        success: true,
        asambleas
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: 'Error al obtener asambleas' 
      });
    }
  }

  // Crear una nueva asamblea para administradores
  createAsamblea = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("Datos recibidos para crear una asamblea", req.body);
      console.log("Datos recibidos para crear una asamblea", req.body);

      // validacion de los datos para crear una nueva asamblea
      const validatedData = createAsambleaValidation(req.body);

      console.log("Datos validad para crear nueva asamblea")

      // Desestructurar los datos
      const {
        fecha,
        tipo,
        modalidad,
        lugar,
        horaInicio,
        horaFin,
        detalles
      } = validatedData;

      const newAsamblea = await this.service.createAsamblea({
        fecha,
        tipo,
        modalidad,
        lugar,
        horaInicio,
        horaFin,
        detalles
      });

      res.status(201).json({ 
        success: true,
        message: 'Asamblea creado correctamente',
        data: newAsamblea 
      });

    } catch (error: any) {
      console.error('Error en createAsamblea:', error);

      // manejo errores de zod
      if (error.name == 'ZodError'){
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

      // Manejar errores específicos de la asamblea
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
        error: error.message || "Error al crear la asamblea" 
      });
    }
  }

  // Actualizar una asamblea existente para administrador
  updateAsamblea = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ 
          success: false,
          error: 'ID de asamblea inválido' 
        });
        return;
      }

      console.log("Datos recibidos para actualizar asamblea", req.body);

      const validatedData = updateAsambleaValidation(req.body);
            
      const updatedAsamblea = await this.service.updateAsamblea(id, validatedData)

      res.json({ 
        success: true,
        message: 'asamblea actualizado correctamente',
        data: updatedAsamblea 
      });
    } catch (error: any) {

      console.error('Error en updateAsamblea:', error);

      if (error.name === 'ZodError') {
        const validationErrors = error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }));

        res.status(400).json({
          success: false,
          error: 'Datos inválidos',
          details: validationErrors
        });
        return;
      }

      res.status(500).json({ 
        success: false,
        error: error.message || "Error al actualizar la asamblea" 
      });
    }
  }

  // Eliminar una asamblea
  deleteAsamblea = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ 
          success: false,
          error: 'ID de asamblea inválido' 
        });
        return;
      }

      await this.service.deleteAsamblea(id);

      res.json({ 
        success: true,
        message: 'Asamblea eliminado correctamente' 
      });

    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || "Error al eliminar la asamblea" 
      });
    }
  }
}
