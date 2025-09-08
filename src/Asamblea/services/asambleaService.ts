import { AsambleaRepository } from '../repositories/asambleaRepository';
import { UpdateAsambleaData } from "../zodSchema/asambleaSchema";
export interface CreateAsambleaData {
  fecha: string;
  tipo: string;
  modalidad: string;
  lugar: string;
  horaInicio: string;
  horaFin: string;
  detalles: {
    agenda: string[];
    documentos: string[];
    requisitos: string[];
    contacto: string;
    telefono: string;
  };
}

export interface AsambleaFilters {
  page?: number;
  limit?: number;
}

export class AsambleaService {
  private repository: AsambleaRepository;

  constructor() {
    this.repository = new AsambleaRepository();
  }

  // servicio para que el accionista obtener asambleas
  async getAsambleas(filters: AsambleaFilters) {
    try{
      console.log(`=== SERVICE: Obteniendo asambleas ===`);

      const page = filters.page || 1;
      const limit = filters.limit || 12;
      const skip = (page - 1) * limit;

      const [asambleas, total] = await Promise.all([
        this.repository.getAll({ skip, take: limit }),
        this.repository.count()
      ]);

      // formatear datos para el envio hacia el frontend
      const formattedAsambleas = asambleas.map(asamblea => ({
        id: asamblea.id,
        fecha: asamblea.fecha,
        tipo: asamblea.tipo,
        modalidad: asamblea.modalidad,
        lugar: asamblea.lugar,
        horaInicio: asamblea.horaInicio,
        horaFin: asamblea.horaFin,
        creado: asamblea.createdAt,
        actualizado: asamblea.updatedAt,
        detalles: {
          agenda: asamblea.agenda,
          documentos: asamblea.documentos,
          requisitos: asamblea.requisitos,
          contacto: asamblea.contacto,
          telefono: asamblea.telefono,
        }
      }));

      return {
        asambleas: formattedAsambleas,
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
      console.error('Error getting shareholders:', error);
      throw new Error('Error al obtener la lista de accionistas');
    }
    
  }

  async getAsambleaById(id: number) {
    try{
      const asamblea = await this.repository.findById(id);

      if (!asamblea) {
        throw new Error('asamblea no encontrado');
      }

      return {

      }

    } catch (error) {
      console.error('Error getting asamblea by ID:', error);
      throw new Error('Error al obtener la asamblea');
    }
  }


  // ======================= SERVICIOS PARA ADMIN ==============================

  // servicio para admin, para crear una asamblea
  async createAsamblea(data: CreateAsambleaData) {
    try {
      // Validación extra: formato de hora
      const isValidHora = (hora: string) =>
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(hora);

      if (!isValidHora(data.horaInicio) || !isValidHora(data.horaFin)) {
        throw new Error("Formato de hora inválido. Use HH:mm (24 horas).");
      }

      // Validación extra: teléfono simple
      if (!/^\+?\d{6,15}$/.test(data.detalles.telefono)) {
        throw new Error("Número de teléfono inválido.");
      }

      // Validación extra: contacto es email válido
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.detalles.contacto)) {
        throw new Error("Correo de contacto inválido.");
      }

      // Preparar datos para la base de datos
      const nuevaAsamblea = await this.repository.create({
        fecha: new Date(data.fecha),
        tipo: data.tipo,
        modalidad: data.modalidad,
        lugar: data.lugar,
        horaInicio: data.horaInicio,
        horaFin: data.horaFin,
        agenda: data.detalles.agenda,
        documentos: data.detalles.documentos,
        requisitos: data.detalles.requisitos,
        contacto: data.detalles.contacto,
        telefono: data.detalles.telefono,
      });

      // Estructura de respuesta personalizada
      return {
        id: nuevaAsamblea.id,
        fecha: nuevaAsamblea.fecha.toISOString().split("T")[0],
        tipo: nuevaAsamblea.tipo,
        modalidad: nuevaAsamblea.modalidad,
        lugar: nuevaAsamblea.lugar,
        horaInicio: nuevaAsamblea.horaInicio,
        horaFin: nuevaAsamblea.horaFin,
        detalles: {
          agenda: nuevaAsamblea.agenda,
          documentos: nuevaAsamblea.documentos,
          requisitos: nuevaAsamblea.requisitos,
          contacto: nuevaAsamblea.contacto,
          telefono: nuevaAsamblea.telefono,
        },
        creado: nuevaAsamblea.createdAt.toISOString(),
        actualizado: nuevaAsamblea.updatedAt.toISOString(),
      };
    } catch (error) {
      console.error('Error creating asamblea:', error);
      throw error;
    }
  }

  // servicio para admin, para actualizar una asamblea
  async updateAsamblea(id: number, data: UpdateAsambleaData) {
    try {
      const asambleaExistente = await this.repository.findById(id);
      if (!asambleaExistente) {
        throw new Error("No se encontró la asamblea con el ID proporcionado.");
      }

      // Validación individual de campos si existen
      if (data.horaInicio && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.horaInicio)) {
        throw new Error("Formato de horaInicio inválido. Use HH:mm (24 horas).");
      }

      if (data.horaFin && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.horaFin)) {
        throw new Error("Formato de horaFin inválido. Use HH:mm (24 horas).");
      }

      if (data.detalles?.telefono && !/^\+?\d{6,15}$/.test(data.detalles.telefono)) {
        throw new Error("Número de teléfono inválido.");
      }

      if (data.detalles?.contacto && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.detalles.contacto)) {
        throw new Error("Correo de contacto inválido.");
      }

      // Preparar objeto actualizado combinando los datos existentes + nuevos
      const datosActualizados = {
        ...asambleaExistente,
        ...data,
        fecha: data.fecha ? new Date(data.fecha) : asambleaExistente.fecha,
        agenda: data.detalles?.agenda ?? asambleaExistente.agenda,
        documentos: data.detalles?.documentos ?? asambleaExistente.documentos,
        requisitos: data.detalles?.requisitos ?? asambleaExistente.requisitos,
        contacto: data.detalles?.contacto ?? asambleaExistente.contacto,
        telefono: data.detalles?.telefono ?? asambleaExistente.telefono,
      };

      // Actualizar en base de datos
      const updated = await this.repository.update(id, datosActualizados);

      return {
        id: updated.id,
        fecha: updated.fecha.toISOString().split("T")[0],
        tipo: updated.tipo,
        modalidad: updated.modalidad,
        lugar: updated.lugar,
        horaInicio: updated.horaInicio,
        horaFin: updated.horaFin,
        detalles: {
          agenda: updated.agenda,
          documentos: updated.documentos,
          requisitos: updated.requisitos,
          contacto: updated.contacto,
          telefono: updated.telefono,
        },
        creado: updated.createdAt.toISOString(),
        actualizado: updated.updatedAt.toISOString(),
      };

    } catch (error) {
      console.error('Error actualizando asamblea:', error);
      throw error;
    }
  }

  // servicio para admin, para eliminar una asamblea
  async deleteAsamblea(id: number) {
    // Primero puedes verificar si existe (opcional)
    const asambleaExistente = await this.repository.findById(id);
    if (!asambleaExistente) {
      throw new Error(`No se encontró la asamblea con ID ${id}`);
    }

    return await this.repository.delete(id);
  }



    /*
  // servicio para que el administrador pueda obtener asambleas
  async getAsambleasForAdmin(params: {

  }) {
    try {
      const 
    }
  }
    */
}
