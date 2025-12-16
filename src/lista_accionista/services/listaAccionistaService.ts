import { prisma } from "../../prismaClient/client";

// Define la interfaz de datos para la creación (se mantiene igual)
interface CreateShareholderData {
  userId?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  cedula?: string;
  telefono?: string;
  tipo: "Mayoritario" | "Institucional" | "Minoritario";
  porcentajeParticipacion: number;
  cantidadAcciones: number;
  ultimaActualizacion?: string;
}

const buildShareholderWhereClause = (filters: any) => {
  const where: any = {};

  if (filters.tipo) {
    where.tipo = filters.tipo;
  }

  if (filters.activo !== undefined) {
    where.activo = filters.activo;
  }

  const searchTerm = filters.search || filters.busqueda;
  if (searchTerm) {
    where.OR = [
      { user: { name: { contains: searchTerm, mode: 'insensitive' } } },
      { user: { lastName: { contains: searchTerm, mode: 'insensitive' } } },
      { user: { cedula: { contains: searchTerm } } },
      { tipo: { contains: searchTerm, mode: 'insensitive' } }
    ];
  }
  return where;
};

// Obtener lista de accionistas con paginación
export const getShareholders = async (filters: any, currentUserId?: number) => {
  try {
    console.log(`=== SERVICE: Obteniendo accionistas ===`);
    console.log('Filtros recibidos:', filters);

    const { page = 1, limit = 12, ...otherFilters } = filters;
    const skip = (page - 1) * limit;

    const where = buildShareholderWhereClause(otherFilters);

    const shareholders = await prisma.lista_accionista.findMany({
      where,
      include: {
        accionista: {
          select: {
            id: true,
            name: true,
            lastName: true,
            cedula: true,
            email: true,
            phone: true,
            status: true,
            role: true,
            credencialPath: true,
            createdAt: true,
          }
        }
      },
      orderBy: [
        { porcentajeParticipacion: 'desc' },
        { cantidadAcciones: 'desc' },
        { accionista: { name: 'asc' } }
      ],
      skip,
      take: limit
    });

    const total = await prisma.lista_accionista.count({ where });

    console.log(`Encontrados ${shareholders.length} accionistas de ${total} totales`);

    let followingIds: number[] = [];
    if (currentUserId) {
      const userIds = shareholders.map(s => s.accionista.id);
      const follows = await prisma.accionista_follow.findMany({
        where: {
          seguidor_id: currentUserId,
          seguido_id: {
            in: userIds
          }
        },
        select: {
          seguido_id: true
        }
      });
      followingIds = follows.map(f => f.seguido_id);
    }

    const formattedShareholders = shareholders.map(shareholder => ({
      id: shareholder.id,
      userId: shareholder.accionista.id,
      nombre: shareholder.accionista.name,
      apellido: shareholder.accionista.lastName,
      cedula: shareholder.accionista.cedula,
      email: shareholder.accionista.email,
      phone: shareholder.accionista.phone,
      status: shareholder.accionista.status,
      role: shareholder.accionista.role,
      credencialPath: shareholder.accionista.credencialPath,
      tipo: shareholder.tipo,
      porcentaje: shareholder.porcentajeParticipacion,
      acciones: shareholder.cantidadAcciones,
      activo: shareholder.activo,
      fechaIngreso: shareholder.fechaIngreso,
      ultimaActualizacion: shareholder.ultimaActualizacion.toISOString().split('T')[0],
      seguido: currentUserId ? followingIds.includes(shareholder.accionista.id) : false,
    }));

    console.log("formattedShareholders en services: ", formattedShareholders);

    return {
      shareholders: formattedShareholders,
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
};

// Obtener accionista por ID
export const getShareholderById = async (id: number) => {
  try {
    const shareholder = await prisma.lista_accionista.findUnique({
      where: { id },
      include: {
        accionista: {
          select: {
            id: true,
            name: true,
            lastName: true,
            cedula: true,
            email: true,
            phone: true,
            status: true,
            role: true,
            description: true,
            addressHome: true,
            areaPosition: true,
            institutionLevel: true,
            location: true,
            birthDate: true,
            credencialPath: true,
            createdAt: true,
          }
        }
      }
    });

    if (!shareholder) {
      throw new Error('Accionista no encontrado');
    }

    return {
      id: shareholder.id,
      userId: shareholder.accionista.id,
      nombre: shareholder.accionista.name,
      apellido: shareholder.accionista.lastName,
      cedula: shareholder.accionista.cedula,
      email: shareholder.accionista.email,
      phone: shareholder.accionista.phone,
      description: shareholder.accionista.description,
      addressHome: shareholder.accionista.addressHome,
      areaPosition: shareholder.accionista.areaPosition,
      institutionLevel: shareholder.accionista.institutionLevel,
      location: shareholder.accionista.location,
      birthDate: shareholder.accionista.birthDate,
      status: shareholder.accionista.status,
      role: shareholder.accionista.role,
      credencialPath: shareholder.accionista.credencialPath,
      tipo: shareholder.tipo,
      porcentaje: shareholder.porcentajeParticipacion,
      acciones: shareholder.cantidadAcciones,
      activo: shareholder.activo,
      fechaIngreso: shareholder.fechaIngreso,
      ultimaActualizacion: shareholder.ultimaActualizacion,
    };
  } catch (error) {
    console.error('Error getting shareholder by ID:', error);
    throw new Error('Error al obtener el accionista');
  }
};

// Crear nuevo accionista (solo admins)
export const createShareholder = async (data: CreateShareholderData) => {
  try {
    let userId: number;

    if (data.userId) {
      userId = data.userId;
      const userExists = await prisma.accionista.findUnique({
        where: { id: userId },
        select: { id: true }
      });
      if (!userExists) {
        throw new Error('El usuario especificado no existe');
      }
    }
    else if (data.firstName && data.lastName) {
      const user = await prisma.accionista.findFirst({
        where: {
          name: { equals: data.firstName.trim(), mode: 'insensitive' },
          lastName: { equals: data.lastName.trim(), mode: 'insensitive' }
        },
        select: { id: true }
      });
      if (!user) {
        throw new Error(`No se encontró un usuario con el nombre "${data.firstName} ${data.lastName}". El usuario debe existir antes de agregarlo como accionista.`);
      }
      userId = user.id;
    }
    else {
      throw new Error('Debe proporcionar userId o firstName y lastName');
    }

    const exists = await prisma.lista_accionista.findUnique({ where: { accionista_id: userId } });
    if (exists) {
      throw new Error('El usuario ya está registrado como accionista');
    }

    const newShareholder = await prisma.lista_accionista.create({
      data: {
        accionista_id: userId,
        tipo: data.tipo,
        porcentajeParticipacion: data.porcentajeParticipacion,
        cantidadAcciones: data.cantidadAcciones,
        activo: true,
      },
      include: {
        accionista: {
          select: {
            id: true,
            name: true,
            lastName: true,
            cedula: true,
            email: true,
            phone: true,
            status: true,
            role: true,
            createdAt: true,
          }
        }
      }
    });

    return {
      id: newShareholder.id,
      userId: newShareholder.accionista.id,
      nombre: newShareholder.accionista.name,
      apellido: newShareholder.accionista.lastName,
      cedula: newShareholder.accionista.cedula,
      email: newShareholder.accionista.email,
      tipo: newShareholder.tipo,
      porcentaje: newShareholder.porcentajeParticipacion,
      acciones: newShareholder.cantidadAcciones,
      activo: newShareholder.activo,
      fechaIngreso: newShareholder.fechaIngreso,
      ultimaActualizacion: newShareholder.ultimaActualizacion.toISOString().split('T')[0],
      seguido: false,
    };
  } catch (error) {
    console.error('Error creating shareholder:', error);
    throw error;
  }
};

// Actualizar accionista (solo admins)
export const updateShareholder = async (id: number, data: any) => {
  try {
    const updatedShareholder = await prisma.lista_accionista.update({
      where: { id },
      data: {
        ...data,
        ultimaActualizacion: new Date(),
      },
      include: {
        accionista: {
          select: {
            id: true,
            name: true,
            lastName: true,
            cedula: true,
            email: true,
            phone: true,
            status: true,
            role: true,
            createdAt: true,
          }
        }
      }
    });

    return {
      id: updatedShareholder.id,
      userId: updatedShareholder.accionista.id,
      nombre: updatedShareholder.accionista.name,
      apellido: updatedShareholder.accionista.lastName,
      tipo: updatedShareholder.tipo,
      porcentaje: updatedShareholder.porcentajeParticipacion,
      acciones: updatedShareholder.cantidadAcciones,
      activo: updatedShareholder.activo,
      ultimaActualizacion: updatedShareholder.ultimaActualizacion.toISOString().split('T')[0],
    };
  } catch (error) {
    console.error('Error updating shareholder:', error);
    throw new Error('Error al actualizar el accionista');
  }
};

// Eliminar accionista (solo admins)
export const deleteShareholder = async (id: number) => {
  try {
    await prisma.lista_accionista.delete({
      where: { id }
    });
    return { message: 'Accionista eliminado correctamente' };
  } catch (error) {
    console.error('Error deleting shareholder:', error);
    throw new Error('Error al eliminar el accionista');
  }
};

// Toggle seguir/dejar de seguir accionista (usuarios normales)
export const toggleFollowShareholder = async (followerId: number, followedId: number) => {
  try {
    if (followerId === followedId) {
      throw new Error('No puedes seguirte a ti mismo');
    }

    const existingFollow = await prisma.accionista_follow.findUnique({
      where: {
        seguidor_id_seguido_id: {
          seguidor_id: followerId,
          seguido_id: followedId
        }
      }
    });

    if (existingFollow) {
      await prisma.accionista_follow.delete({
        where: {
          seguidor_id_seguido_id: {
            seguidor_id: followerId,
            seguido_id: followedId
          }
        }
      });
      return { action: 'unfollowed', message: 'Dejaste de seguir al accionista' };
    } else {
      await prisma.accionista_follow.create({
        data: {
          seguidor_id: followerId,
          seguido_id: followedId
        }
      });
      return { action: 'followed', message: 'Ahora sigues al accionista' };
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    throw error;
  }
};

// Toggle seguir/dejar de seguir accionista (administradores)
export const toggleFollowShareholderForAdmin = async (adminId: number, shareholderUserId: number) => {
  try {
    const existingFollow = await prisma.accionista_follow.findUnique({
      where: {
        seguidor_id_seguido_id: {
          seguidor_id: adminId,
          seguido_id: shareholderUserId
        }
      }
    });

    if (existingFollow) {
      await prisma.accionista_follow.delete({
        where: {
          seguidor_id_seguido_id: {
            seguidor_id: adminId,
            seguido_id: shareholderUserId
          }
        }
      });
      return { action: 'unfollowed', message: 'Admin dejó de seguir al accionista' };
    } else {
      await prisma.accionista_follow.create({
        data: {
          seguidor_id: adminId,
          seguido_id: shareholderUserId
        }
      });
      return { action: 'followed', message: 'Admin ahora sigue al accionista' };
    }
  } catch (error) {
    console.error('Error toggling follow for admin:', error);
    throw error;
  }
};

// Obtener accionistas con información de seguimiento para usuarios
export const getShareholdersS = async (params: {
  page: number;
  limit: number;
  tipo?: string;
  busqueda?: string;
  currentUserId?: number;
}) => {
  try {
    const offset = (params.page - 1) * params.limit;

    const where: any = { activo: true };

    if (params.tipo) {
      where.tipo = params.tipo;
    }

    if (params.busqueda) {
      where.OR = [
        { user: { name: { contains: params.busqueda, mode: 'insensitive' } } },
        { user: { lastName: { contains: params.busqueda, mode: 'insensitive' } } }
      ];
    }

    const shareholders = await prisma.lista_accionista.findMany({
      where,
      include: {
        accionista: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            cedula: true,
            phone: true,
            seguidores: params.currentUserId ? {
              where: {
                seguidor_id: params.currentUserId
              }
            } : false
          }
        }
      },
      skip: offset,
      take: params.limit,
      orderBy: {
        ultimaActualizacion: 'desc'
      }
    });

    const total = await prisma.lista_accionista.count({ where });

    const mappedData = shareholders.map(shareholder => ({
      id: shareholder.id,
      userId: shareholder.accionista_id,
      nombre: shareholder.accionista.name,
      apellido: shareholder.accionista.lastName,
      email: shareholder.accionista.email,
      cedula: shareholder.accionista.cedula,
      phone: shareholder.accionista.phone,
      porcentaje: shareholder.porcentajeParticipacion,
      acciones: shareholder.cantidadAcciones,
      tipo: shareholder.tipo,
      ultimaActualizacion: shareholder.ultimaActualizacion,
      seguido: params.currentUserId ? shareholder.accionista.seguidores.length > 0 : false
    }));

    return {
      data: mappedData,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit)
      }
    };
  } catch (error) {
    console.error('Error in getShareholdersS:', error);
    throw error;
  }
};

// Obtener accionistas para administradores (pueden ver todos)
export const getShareholdersForAdmin = async (params: {
  page: number;
  limit: number;
  tipo?: string;
  busqueda?: string;
  currentAdminId?: number;
}) => {
  try {
    const offset = (params.page - 1) * params.limit;

    const where: any = { activo: true };

    if (params.tipo) {
      where.tipo = params.tipo;
    }

    if (params.busqueda) {
      where.OR = [
        { user: { name: { contains: params.busqueda, mode: 'insensitive' } } },
        { user: { lastName: { contains: params.busqueda, mode: 'insensitive' } } }
      ];
    }

    const shareholders = await prisma.lista_accionista.findMany({
      where,
      include: {
        accionista: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            cedula: true,
            phone: true,
            seguidores: params.currentAdminId ? {
              where: {
                seguidor_id: params.currentAdminId
              }
            } : false
          }
        }
      },
      skip: offset,
      take: params.limit,
      orderBy: {
        ultimaActualizacion: 'desc'
      }
    });

    const total = await prisma.lista_accionista.count({ where });

    const mappedData = shareholders.map(shareholder => ({
      id: shareholder.id,
      userId: shareholder.accionista_id,
      nombre: shareholder.accionista.name,
      apellido: shareholder.accionista.lastName,
      email: shareholder.accionista.email,
      cedula: shareholder.accionista.cedula,
      phone: shareholder.accionista.phone,
      porcentaje: shareholder.porcentajeParticipacion,
      acciones: shareholder.cantidadAcciones,
      tipo: shareholder.tipo,
      ultimaActualizacion: shareholder.ultimaActualizacion,
      seguido: params.currentAdminId ? shareholder.accionista.seguidores.length > 0 : false
    }));

    return {
      data: mappedData,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit)
      }
    };
  } catch (error) {
    console.error('Error getting shareholders for admin:', error);
    throw error;
  }
};

export const getAllShareholdersForAdmin = async (params: {
  currentAdminId?: number;
  tipo?: string;
  busqueda?: string;
}) => {
  const where: any = { activo: true };
  if (params.tipo) {
    where.tipo = params.tipo;
  }
  if (params.busqueda) {
    where.OR = [
      { user: { name: { contains: params.busqueda, mode: 'insensitive' } } },
      { user: { lastName: { contains: params.busqueda, mode: 'insensitive' } } }
    ];
  }

  const rows = await prisma.lista_accionista.findMany({
    where,
    include: {
      accionista: {
        select: {
          id: true,
          name: true,
          lastName: true,
          email: true,
          cedula: true,
          phone: true,
          seguidores: params.currentAdminId
            ? { where: { seguidor_id: params.currentAdminId } }
            : false
        }
      }
    },
    orderBy: { ultimaActualizacion: 'desc' }
  });

  return {
    data: rows.map(r => ({
      id: r.id,
      userId: r.accionista.id,
      nombre: r.accionista.name,
      apellido: r.accionista.lastName,
      email: r.accionista.email,
      cedula: r.accionista.cedula,
      phone: r.accionista.phone,
      porcentaje: r.porcentajeParticipacion,
      acciones: r.cantidadAcciones,
      tipo: r.tipo,
      ultimaActualizacion: r.ultimaActualizacion,
      seguido: params.currentAdminId
        ? r.accionista.seguidores.length > 0
        : false
    })),
    pagination: {
      page: 1,
      limit: rows.length,
      total: rows.length,
      totalPages: 1
    }
  };
};

// Obtener estadísticas de accionistas
export const getStats = async () => {
  try {
    const totalAccionistas = await prisma.lista_accionista.count({
      where: { activo: true }
    });

    const tipoStats = await prisma.lista_accionista.groupBy({
      by: ['tipo'],
      where: { activo: true },
      _count: {
        id: true
      },
      _sum: {
        porcentajeParticipacion: true,
        cantidadAcciones: true
      }
    });

    const totalAcciones = await prisma.lista_accionista.aggregate({
      where: { activo: true },
      _sum: {
        cantidadAcciones: true,
        porcentajeParticipacion: true
      }
    });

    return {
      totalAccionistas,
      totalAcciones: totalAcciones._sum.cantidadAcciones || 0,
      totalPorcentaje: totalAcciones._sum.porcentajeParticipacion || 0,
      porTipo: tipoStats.map(stat => ({
        tipo: stat.tipo,
        cantidad: stat._count.id,
        porcentajeTotal: stat._sum.porcentajeParticipacion || 0,
        accionesTotal: stat._sum.cantidadAcciones || 0
      }))
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    throw new Error('Error al obtener las estadísticas');
  }
};

// Obtener usuarios disponibles para agregar como accionistas
export const getAvailableUsers = async () => {
  try {
    return await prisma.accionista.findMany({
      where: {
        AccionistaLista: null, // Usuarios que NO están en la lista
        status: { not: 'Inactivo' } // Usuarios activos
      },
      select: {
        id: true,
        name: true,
        lastName: true,
        cedula: true,
        email: true,
        role: true
      },
      orderBy: [
        { name: 'asc' },
        { lastName: 'asc' }
      ]
    });
  } catch (error) {
    console.error('Error getting available users:', error);
    throw new Error('Error al obtener usuarios disponibles');
  }
};


export const findAllWithoutPagination = async (params: {
  currentAdminId?: number;
  tipo?: string;
  busqueda?: string;
}) => {
  // 1) Arma los filtros WHERE
  const where: any = { activo: true };
  if (params.tipo) {
    where.tipo = params.tipo;
  }
  if (params.busqueda) {
    where.OR = [
      { user: { name: { contains: params.busqueda, mode: 'insensitive' } } },
      { user: { lastName: { contains: params.busqueda, mode: 'insensitive' } } }
    ];
  }

  // 2) Llama a Prisma con INCLUDE para traer la relación
  const rows = await prisma.lista_accionista.findMany({
    where,
    include: {
      accionista: {
        select: {
          id: true,
          name: true,
          lastName: true,
          email: true,
          cedula: true,
          phone: true,
          // Si hay admin, incluye el array de seguidores filtrado
          seguidores: params.currentAdminId
            ? { where: { seguidor_id: params.currentAdminId } }
            : false
        }
      }
    },
    orderBy: { ultimaActualizacion: 'desc' }
  });

  // 3) Mapea al DTO de frontend usando r.user.*
  return rows.map(r => ({
    id: r.id,
    userId: r.accionista.id,
    nombre: r.accionista.name,
    apellido: r.accionista.lastName,
    email: r.accionista.email,
    cedula: r.accionista.cedula,
    phone: r.accionista.phone,
    porcentaje: r.porcentajeParticipacion,
    acciones: r.cantidadAcciones,
    tipo: r.tipo,
    ultimaActualizacion: r.ultimaActualizacion,
    // si no viene currentAdminId, r.user.seguidores estará undefined
    seguido: params.currentAdminId
      ? r.accionista.seguidores.length > 0
      : false
  }));
};

export const getFollowingOfUser = async (accionista_id: number) => {
  const seguir = prisma.accionista_follow.findMany({
    where: { seguido_id: accionista_id },
    include: {
      seguidor: {
        select: {
          id: true,
          name: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
    },
  });
  return seguir;
};

// Verificar si un accionista tiene 6 meses de antigüedad
export const checkSixMonthsAntiquity = async (shareholderId: number) => {
  try {
    const shareholder = await prisma.lista_accionista.findUnique({
      where: { 
        id: shareholderId,
        activo: true  // Solo verificar accionistas activos
      },
      select: {
        id: true,
        fechaIngreso: true
      }
    });

    if (!shareholder) {
      throw new Error('Accionista no encontrado o inactivo');
    }

    // Calcular la fecha de hace 6 meses
    const fechaActual = new Date();
    const fechaSeisMesesAtras = new Date();
    fechaSeisMesesAtras.setMonth(fechaActual.getMonth() - 6);

    // Verificar si la fecha de ingreso es anterior a hace 6 meses
    const tiene6meses = shareholder.fechaIngreso <= fechaSeisMesesAtras;

    // Calcular días exactos de antigüedad (opcional para debugging)
    const tiempoTranscurrido = fechaActual.getTime() - shareholder.fechaIngreso.getTime();
    const diasTranscurridos = Math.floor(tiempoTranscurrido / (1000 * 60 * 60 * 24));

    return {
      id: shareholder.id,
      tiene6meses: tiene6meses,
      fechaIngreso: shareholder.fechaIngreso,
      diasTranscurridos: diasTranscurridos,
      fechaVerificacion: fechaActual
    };

  } catch (error: any) {
    console.error('Error al verificar antigüedad de 6 meses:', error);
    throw error;
  }
};