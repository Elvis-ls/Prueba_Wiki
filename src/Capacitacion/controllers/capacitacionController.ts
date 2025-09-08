import { Request, Response } from 'express';
import { AuthRequest } from '../../User/interfaces/authRequest';
import { AuthenticatedRequest } from '../../Admin/interfaces/authRequest';
import { CapacitacionService } from '../services/capacitacionService';
import { 
  capacitacionValidation,
  updateCapacitacionValidation,
  createCapacitacionValidation,
  getCapacitacionQueryValidation
} from '../validators/capacitacionValidation';

function formatCapacitacionForFrontend(capacitacion: any) {
  return {
    id: capacitacion.id,
    fecha: capacitacion.fecha,
    modalidad: capacitacion.modalidad,
    lugar: capacitacion.lugar,
    horaInicio: capacitacion.horaInicio,
    horaFin: capacitacion.horaFin,
    tematica: capacitacion.tematica,
    detalles: {
      descripcion: capacitacion.descripcion,
      agenda: capacitacion.agenda,
      materiales: capacitacion.materiales,
      requisitos: capacitacion.requisitos,
      contacto: capacitacion.contacto,
      telefono: capacitacion.telefono,
      enlace: capacitacion.enlace ?? undefined,
    }
  };
}


export class CapacitacionController {
  private service: CapacitacionService;

  constructor() {
    this.service = new CapacitacionService();
  }

  // Obtener todas las Capacitaciones para la vista de accionistas
  getAllCapacitaciones = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {

      const filters = getCapacitacionQueryValidation(req.query);

      const capacitaciones = await this.service.getCapacitaciones(filters);
      console.log(capacitaciones);
      res.json({
        success: true,
        capacitaciones
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: 'Error al obtener Capacitaciones' 
      });
    }
  }

  // Crear una nueva Capacitacion para administradores
  createCapacitacion = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("Datos recibidos para crear una Capacitacion", req.body);
      console.log("Datos recibidos para crear una Capacitacion", req.body);

      // validacion de los datos para crear una nueva Capacitacion
      const validatedData = createCapacitacionValidation(req.body);

      console.log("Datos validad para crear nueva Capacitacion")

      const { detalles, ...rest } = validatedData;

      const dataToSave = {
        ...rest,
        descripcion: detalles.descripcion,
        enlace: detalles.enlace,
        agenda: detalles.agenda,
        materiales: detalles.materiales,
        requisitos: detalles.requisitos,
        contacto: detalles.contacto,
        telefono: detalles.telefono,
      };

      const newCapacitacion = await this.service.createCapacitacion(dataToSave);

      res.status(201).json({ 
        success: true,
        message: 'Capacitacion creada correctamente',
        data: formatCapacitacionForFrontend(newCapacitacion)
      });

    } catch (error: any) {
      console.error('Error en createCapacitacion: ', error);

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

      // Manejar errores específicos de la Capacitacion
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
        error: error.message || "Error al crear la Capacitacion" 
      });
    }
  }

  // Actualizar una Capacitacion existente para administrador
  updateCapacitacion = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ 
          success: false,
          error: 'ID de Capacitacion inválido' 
        });
        return;
      }

      console.log("Datos recibidos para actualizar Capacitacion", req.body);

      const validatedData = updateCapacitacionValidation(req.body);
          
      const { detalles, ...rest } = validatedData;

      if (!detalles) {
        res.status(400).json({ 
          success: false,
          error: 'Falta el objeto "detalles" en la petición.' 
        });
        return;
      }

      const dataToUpdate = {
        ...rest,
        ...(detalles.descripcion !== undefined && { descripcion: detalles.descripcion }),
        ...(detalles.enlace !== undefined && { enlace: detalles.enlace }),
        ...(detalles.agenda !== undefined && { agenda: detalles.agenda }),
        ...(detalles.materiales !== undefined && { materiales: detalles.materiales }),
        ...(detalles.requisitos !== undefined && { requisitos: detalles.requisitos }),
        ...(detalles.contacto !== undefined && { contacto: detalles.contacto }),
        ...(detalles.telefono !== undefined && { telefono: detalles.telefono }),
      };

      const updatedCapacitacion = await this.service.updateCapacitacion(id, dataToUpdate)

      res.json({ 
        success: true,
        message: 'Capacitacion actualizada correctamente',
        data: formatCapacitacionForFrontend(updatedCapacitacion)
      });
    } catch (error: any) {

      console.error('Error en updateCapacitacion:', error);

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
        error: error.message || "Error al actualizar la Capacitacion" 
      });
    }
  }

  // Eliminar una Capacitacion
  deleteCapacitacion = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ 
          success: false,
          error: 'ID de Capacitacion inválido' 
        });
        return;
      }

      await this.service.deleteCapacitacion(id);

      res.json({ 
        success: true,
        message: 'Capacitacion eliminado correctamente' 
      });

    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || "Error al eliminar la Capacitacion" 
      });
    }
  }
}
