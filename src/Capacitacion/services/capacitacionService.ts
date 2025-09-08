import { CapacitacionRepository } from '../repositories/capacitacionRepository';
import { UpdateCapacitacionData } from "../zodSchema/capacitacionSchema";

export interface CreateCapacitacionData {
  fecha: string;
  modalidad: string;
  lugar: string;
  horaInicio: string;
  horaFin: string;
  tematica: string;
  descripcion: string;
  enlace?: string;
  agenda: string[];
  materiales: string[];
  requisitos: string[];
  contacto: string;
  telefono: string;
}

export interface UpdateCapacitacionServiceData {
  fecha?: string;
  modalidad?: string;
  lugar?: string;
  horaInicio?: string;
  horaFin?: string;
  tematica?: string;
  descripcion?: string;
  enlace?: string;
  agenda?: string[];
  materiales?: string[];
  requisitos?: string[];
  contacto?: string;
  telefono?: string;
}


export interface CapacitacionFilters {
  page?: number;
  limit?: number;
}

export class CapacitacionService {
  private repository: CapacitacionRepository;

  constructor() {
    this.repository = new CapacitacionRepository();
  }

  // servicio para que el accionista obtener capacitaciones
  async getCapacitaciones(filters: CapacitacionFilters) {
    try{
      console.log(`=== SERVICE: Obteniendo Capacitaciones ===`);

      const page = filters.page || 1;
      const limit = filters.limit || 12;
      const skip = (page - 1) * limit;

      const [capacitaciones, total] = await Promise.all([
        this.repository.getAll({ skip, take: limit }),
        this.repository.count()
      ]);

      // formatear datos para el envio hacia el frontend
      const formattedCapacitaciones = capacitaciones.map(capacitacion => ({
        id: capacitacion.id,
        fecha: capacitacion.fecha,
        modalidad: capacitacion.modalidad,
        lugar: capacitacion.lugar,
        horaInicio: capacitacion.horaInicio,
        horaFin: capacitacion.horaFin,  
        tematica: capacitacion.tematica,
        creado: capacitacion.createdAt,
        actualizado: capacitacion.updatedAt,
        detalles: {
          descripcion: capacitacion.descripcion,
          agenda: capacitacion.agenda,
          materiales: capacitacion.materiales,
          requisitos: capacitacion.requisitos,
          contacto: capacitacion.contacto,
          telefono: capacitacion.telefono,
          enlace: capacitacion.enlace ?? undefined,
        }
      }));

      return {
        capacitaciones: formattedCapacitaciones,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Error getting capacitaciones:', error);
      throw new Error('Error al obtener la lista de capacitaciones');
    }
    
  }

  async getCapacitacionaById(id: number) {
    try{
      const capacitacion = await this.repository.findById(id);

      if (!capacitacion) {
        throw new Error('capacitacion no encontrado');
      }

      return {

      }

    } catch (error) {
      console.error('Error getting capacitacion by ID:', error);
      throw new Error('Error al obtener la capacitacion');
    }
  }


  // ======================= SERVICIOS PARA ADMIN ==============================

  // servicio para admin, para crear una capacitacion
  async createCapacitacion(data: CreateCapacitacionData) {
    try {
      // Validación extra: formato de hora
      const isValidHora = (hora: string) =>
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(hora);

      if (!isValidHora(data.horaInicio) || !isValidHora(data.horaFin)) {
        throw new Error("Formato de hora inválido. Use HH:mm (24 horas).");
      }

      // Validación extra: teléfono simple
      if (!/^\+?\d{6,15}$/.test(data.telefono)) {
        throw new Error("Número de teléfono inválido.");
      }

      // Validación extra: contacto es email válido
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contacto)) {
        throw new Error("Correo de contacto inválido.");
      }

      // Preparar datos para la base de datos
      const nuevaCapacitacion = await this.repository.create({
        fecha: new Date(data.fecha),
        modalidad: data.modalidad,
        lugar: data.lugar,
        horaInicio: data.horaInicio,
        horaFin: data.horaFin,
        tematica: data.tematica,
        descripcion: data.descripcion,
        agenda: data.agenda,
        materiales: data.materiales,
        requisitos: data.requisitos,
        contacto: data.contacto,
        telefono: data.telefono,
        enlace: data.enlace ?? undefined,
      });

      // Estructura de respuesta personalizada
      return {
        id: nuevaCapacitacion.id,
        fecha: nuevaCapacitacion.fecha.toISOString().split("T")[0],
        modalidad: nuevaCapacitacion.modalidad,
        lugar: nuevaCapacitacion.lugar,
        horaInicio: nuevaCapacitacion.horaInicio,
        horaFin: nuevaCapacitacion.horaFin,
        tematica: nuevaCapacitacion.tematica,     
        detalles: {
          agenda: nuevaCapacitacion.agenda,
          descrpcion: nuevaCapacitacion.descripcion,
          materiales: nuevaCapacitacion.materiales,
          requisitos: nuevaCapacitacion.requisitos,
          contacto: nuevaCapacitacion.contacto,
          telefono: nuevaCapacitacion.telefono,
          enlace: nuevaCapacitacion.enlace ?? undefined,
        },
        creado: nuevaCapacitacion.createdAt.toISOString(),
        actualizado: nuevaCapacitacion.updatedAt.toISOString(),
      };
    } catch (error) {
      console.error('Error creating capacitacion:', error);
      throw error;
    }
  }

  // servicio para admin, para actualizar una asamblea
  async updateCapacitacion(id: number, data: UpdateCapacitacionServiceData) {
    try {
      const capacitacionExistente = await this.repository.findById(id);
      if (!capacitacionExistente) {
        throw new Error("No se encontró la capcitacion con el ID proporcionado.");
      }

      // Validación individual de campos si existen
      if (data.horaInicio && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.horaInicio)) {
        throw new Error("Formato de horaInicio inválido. Use HH:mm (24 horas).");
      }

      if (data.horaFin && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.horaFin)) {
        throw new Error("Formato de horaFin inválido. Use HH:mm (24 horas).");
      }

      if (data.telefono && !/^\+?\d{6,15}$/.test(data.telefono)) {
        throw new Error("Número de teléfono inválido.");
      }

      if (data.contacto && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contacto)) {
        throw new Error("Correo de contacto inválido.");
      }

      // Preparar objeto actualizado combinando los datos existentes + nuevos
      const datosActualizados = {
        ...capacitacionExistente,
        ...data,
        fecha: data.fecha ? new Date(data.fecha) : capacitacionExistente.fecha,
        agenda: data.agenda ?? capacitacionExistente.agenda,
        materiales: data.materiales ?? capacitacionExistente.materiales,
        requisitos: data.requisitos ?? capacitacionExistente.requisitos,
        contacto: data.contacto ?? capacitacionExistente.contacto,
        telefono: data.telefono ??capacitacionExistente.telefono,
      };

      // Actualizar en base de datos
      const updated = await this.repository.update(id, datosActualizados);

      return {
        id: updated.id,
        fecha: updated.fecha.toISOString().split("T")[0],
        modalidad: updated.modalidad,
        lugar: updated.lugar,
        horaInicio: updated.horaInicio,
        horaFin: updated.horaFin,
        tematica: updated.tematica,
        detalles: {
          descripcion: updated.descripcion ?? "",
          agenda: updated.agenda ?? [],
          materiales: updated.materiales ?? [],
          requisitos: updated.requisitos ?? [],
          contacto: updated.contacto ?? "",
          telefono: updated.telefono ?? "",
          enlace: updated.enlace ?? undefined,
        },
        creado: updated.createdAt.toISOString(),
        actualizado: updated.updatedAt.toISOString(),
      };

    } catch (error) {
      console.error('Error actualizando capacitacion:', error);
      throw error;
    }
  }

  // servicio para admin, para eliminar una capacitacion
  async deleteCapacitacion(id: number) {
    // Primero puedes verificar si existe (opcional)
    const capacitacionExistente = await this.repository.findById(id);
    if (!capacitacionExistente) {
      throw new Error(`No se encontró la capacitacion con ID ${id}`);
    }

    return await this.repository.delete(id);
  }



    /*
  // servicio para que el administrador pueda obtener capacitaciones
  async getCapacitacionesForAdmin(params: {

  }) {
    try {
      const 
    }
  }
    */
}
