import { prisma } from '../../prismaClient/client';

export class AsambleaRepository {
  // obtener todas las asambleas con su informacion
  async getAll(filters: any = {}) {
    const { search, tipo, modalidad, año, skip, take } = filters;
    const where: any = {};

    // Filtrar por tipo
    if (tipo) where.tipo = tipo;

    // Filtrar por modalidad
    if (modalidad) where.modalidad = modalidad;

    // Filtrar por año (rango de fechas)
    if (año) {
      const startDate = new Date(año, 0, 1);
      const endDate = new Date(año + 1, 0, 1);
      where.fecha = {
        gte: startDate,
        lt: endDate,
      };
    }

    // Búsqueda por texto (tipo o lugar)
    if (search) {
      where.OR = [
        {
          tipo: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          lugar: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    return await prisma.asamblea.findMany({
      where,
      orderBy: { fecha: "desc" },
      skip,
      take,
    });
  }

  // Contar total de asambleas (para paginación)
  async count(filters: any = {}) {
    const { search, tipo, modalidad, año } = filters;
    const where: any = {};

    if (tipo) where.tipo = tipo;
    if (modalidad) where.modalidad = modalidad;

    if (año) {
      const startDate = new Date(año, 0, 1);
      const endDate = new Date(año + 1, 0, 1);
      where.fecha = {
        gte: startDate,
        lt: endDate,
      };
    }

    if (search) {
      where.OR = [
        {
          tipo: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          lugar: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    return await prisma.asamblea.count({ where });
  }

  // crea una nueva asamblea
  async create(data: any) {
    return await prisma.asamblea.create({ data });
  }

  // actualizar asamblea
  async findById(id: number) {
    return prisma.asamblea.findUnique({ where: { id } });
  }

  //ontener asamblea por idd
  async update(id: number, data: any) {
    // Extraer solo los campos válidos para actualizar
    const {
      fecha,
      tipo,
      modalidad,
      lugar,
      horaInicio,
      horaFin,
      detalles
    } = data;

    return prisma.asamblea.update({
      where: { id },
      data: {
        fecha: fecha ? new Date(fecha) : undefined,
        tipo,
        modalidad,
        lugar,
        horaInicio,
        horaFin,
        agenda: detalles?.agenda,
        documentos: detalles?.documentos,
        requisitos: detalles?.requisitos,
        contacto: detalles?.contacto,
        telefono: detalles?.telefono,
      },
    });
  }


  // eliminar asamblea
  async delete(id: number) {
    return await prisma.asamblea.delete({
      where: { id },
    });
  }
}
