import { prisma } from '../../prismaClient/client';

export class CapacitacionRepository {
  // obtener todas las asambleas con su informacion
  async getAll(filters: any = {}) {
    const { search, modalidad, año, skip, take } = filters;
    const where: any = {};

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
          lugar: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    return await prisma.capacitacion.findMany({
      where,
      orderBy: { fecha: "desc" },
      skip,
      take,
    });
  }

  // Contar total de capacitaciones (para paginación)
  async count(filters: any = {}) {
    const { search, modalidad, año } = filters;
    const where: any = {};

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
          lugar: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    return await prisma.capacitacion.count({ where });
  }

  // crea una nueva capacitacion
  async create(data: any) {
    return await prisma.capacitacion.create({ 
        data: {
            fecha: data.fecha,
            modalidad: data.modalidad,
            lugar: data.lugar,
            horaInicio: data.horaInicio,
            horaFin: data.horaFin,
            tematica: data.tematica,
            descripcion: data.descripcion,
            enlace: data.enlace,
            agenda: data.agenda,
            materiales: data.materiales,
            requisitos: data.requisitos,
            contacto: data.contacto,
            telefono: data.telefono,
        }
    });
  }

  // actualizar capacitacion
  async findById(id: number) {
    return prisma.capacitacion.findUnique({ where: { id } });
  }

  //ontener capacitacion por idd
    async update(id: number, data: any) {
    // Crea un nuevo objeto solo con los campos definidos
    const camposValidos = [
      'fecha', 'modalidad', 'lugar', 'horaInicio', 'horaFin', 'tematica',
      'descripcion', 'enlace', 'agenda', 'materiales', 'requisitos', 'contacto', 'telefono'
    ];
    const dataParaActualizar: any = {};

    // es ecir, que si hay cmpos que no se actualiza, entonces los campos que no se actualizo
    // mantenen el valor que tenian antes
    for (const campo of camposValidos) {
      if (data[campo] !== undefined) {
        dataParaActualizar[campo] = data[campo];
      }
    }

    return prisma.capacitacion.update({
      where: { id },
      data: dataParaActualizar,
    });
  }



  // eliminar asamblea
  async delete(id: number) {
    return await prisma.capacitacion.delete({
      where: { id },
    });
  }
}
