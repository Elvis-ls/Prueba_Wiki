// repositories/shareholdersRepository.ts
import { prisma } from "../../prismaClient/client";

export class ShareholdersRepository {
  
  // Obtener todos los accionistas con información del usuario
  async getAll(filters: any = {}) {
    const { search, tipo, activo, skip, take } = filters;
    
    const where: any = {};
    
    // Filtros
    if (tipo) {
      where.tipo = tipo;
    }
    
    if (activo !== undefined) {
      where.activo = activo;
    }
    
    // Filtro de búsqueda
    if (search) {
      where.OR = [
        {
          user: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          user: {
            lastName: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          user: {
            cedula: {
              contains: search
            }
          }
        },
        {
          tipo: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    return await prisma.accionistaLista.findMany({
      where,
      include: {
        user: {
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
        { user: { name: 'asc' } }
      ],
      skip,
      take
    });
  }

  // Contar total de accionistas (para paginación)
  async count(filters: any = {}) {
    const { search, tipo, activo } = filters;
    
    const where: any = {};
    
    if (tipo) {
      where.tipo = tipo;
    }
    
    if (activo !== undefined) {
      where.activo = activo;
    }
    
    if (search) {
      where.OR = [
        {
          user: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          user: {
            lastName: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          user: {
            cedula: {
              contains: search
            }
          }
        }
      ];
    }

    return await prisma.accionistaLista.count({ where });
  }

  // para el modal en ProfileHeader
  async getFollowingOfUser(userId: number) {
    return await prisma.accionistaFollow.findMany({
      where: { followedId: userId },
      include: {
        follower: {
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
  }


  // Obtener accionista por ID
  async getById(id: number) {
    return await prisma.accionistaLista.findUnique({
      where: { id },
      include: {
        user: {
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
  }
  // NUEVO MÉTODO: Buscar usuario por nombre y apellido
  async getUserByNames(firstName: string, lastName: string) {
    return await prisma.users.findFirst({
      where: {
        name: {
          equals: firstName.trim(),
          mode: 'insensitive'
        },
        lastName: {
          equals: lastName.trim(),
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        lastName: true,
        cedula: true,
        email: true,
        status: true,
        role: true
      }
    });
  }


  // Obtener accionista por userId
  async getUserById(userId: number) {
    return await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        lastName: true,
        cedula: true,
        email: true,
        status: true,
        role: true
      }
    });
  }

  // Crear nuevo accionista
  async create(data: any) {
    return await prisma.accionistaLista.create({
      data: {
        userId: data.userId,
        tipo: data.tipo,
        porcentajeParticipacion: data.porcentajeParticipacion,
        cantidadAcciones: data.cantidadAcciones,
        activo: data.activo || true,
      },
      include: {
        user: {
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
  }

  // Actualizar accionista
  async update(id: number, data: any) {
    return await prisma.accionistaLista.update({
      where: { id },
      data: {
        ...data,
        ultimaActualizacion: new Date(),
      },
      include: {
        user: {
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
  }

  // Eliminar accionista
  async delete(id: number) {
    return await prisma.accionistaLista.delete({
      where: { id }
    });
  }

  // Sistema de seguimiento - Seguir/Dejar de seguir
  // Toggle follow para usuarios normales
async toggleFollow(followerId: number, followedId: number) {
  try {
    // Verificar si ya existe la relación
    const existingFollow = await prisma.accionistaFollow.findUnique({
      where: {
        followerId_followedId: {
          followerId: followerId,
          followedId: followedId
        }
      }
    });

    if (existingFollow) {
      // Si ya sigue, dejar de seguir
      await prisma.accionistaFollow.delete({
        where: {
          followerId_followedId: {
            followerId: followerId,
            followedId: followedId
          }
        }
      });
      return { action: 'unfollowed', message: 'Dejaste de seguir al accionista' };
    } else {
      // Si no sigue, empezar a seguir
      await prisma.accionistaFollow.create({
        data: {
          followerId: followerId,
          followedId: followedId
        }
      });
      return { action: 'followed', message: 'Ahora sigues al accionista' };
    }
  } catch (error) {
    console.error('Error in toggleFollow:', error);
    throw error;
  }
}

// Toggle follow para administradores
async toggleFollowFromAdmin(adminId: number, shareholderUserId: number) {
  try {
    // Para admin, usar una tabla separada o manejar diferente
    // Por simplicidad, usaremos la misma tabla pero con el adminId
    const existingFollow = await prisma.accionistaFollow.findUnique({
      where: {
        followerId_followedId: {
          followerId: adminId,
          followedId: shareholderUserId
        }
      }
    });

    if (existingFollow) {
      await prisma.accionistaFollow.delete({
        where: {
          followerId_followedId: {
            followerId: adminId,
            followedId: shareholderUserId
          }
        }
      });
      return { action: 'unfollowed', message: 'Admin dejó de seguir al accionista' };
    } else {
      await prisma.accionistaFollow.create({
        data: {
          followerId: adminId,
          followedId: shareholderUserId
        }
      });
      return { action: 'followed', message: 'Admin ahora sigue al accionista' };
    }
  } catch (error) {
    console.error('Error in toggleFollowFromAdmin:', error);
    throw error;
  }
}

// Obtener accionistas con estado de seguimiento para usuarios
async findAllWithFollowStatus(params: {
  page: number;
  limit: number;
  offset: number;
  tipo?: string;
  busqueda?: string;
  currentUserId?: number;
}) {
  try {
    const where: any = {
      activo: true
    };

    if (params.tipo) {
      where.tipo = params.tipo;
    }

    if (params.busqueda) {
      where.OR = [
        {
          user: {
            name: {
              contains: params.busqueda,
              mode: 'insensitive'
            }
          }
        },
        {
          user: {
            lastName: {
              contains: params.busqueda,
              mode: 'insensitive'
            }
          }
        }
      ];
    }

    const shareholders = await prisma.accionistaLista.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            cedula: true,
            phone: true,
            // Incluir información de seguimiento
            seguidores: params.currentUserId ? {
              where: {
                followerId: params.currentUserId
              }
            } : false
          }
        }
      },
      skip: params.offset,
      take: params.limit,
      orderBy: {
        ultimaActualizacion: 'desc'
      }
    });

    const total = await prisma.accionistaLista.count({ where });

    // Mapear datos con información de seguimiento
    const mappedData = shareholders.map(shareholder => ({
      id: shareholder.id,
      userId: shareholder.userId,
      nombre: shareholder.user.name,
      apellido: shareholder.user.lastName,
      email: shareholder.user.email,
      cedula: shareholder.user.cedula,
      phone: shareholder.user.phone,
      porcentaje: shareholder.porcentajeParticipacion,
      acciones: shareholder.cantidadAcciones,
      tipo: shareholder.tipo,
      ultimaActualizacion: shareholder.ultimaActualizacion,
      seguido: params.currentUserId ? shareholder.user.seguidores.length > 0 : false
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
    console.error('Error in findAllWithFollowStatus:', error);
    throw error;
  }
}

// Obtener accionistas con estado de seguimiento para administradores
async findAllWithAdminFollowStatus(params: {
  page: number;
  limit: number;
  offset: number;
  tipo?: string;
  busqueda?: string;
  currentAdminId?: number;
}) {
  try {
    const where: any = {
      activo: true
    };

    if (params.tipo) {
      where.tipo = params.tipo;
    }

    if (params.busqueda) {
      where.OR = [
        {
          user: {
            name: {
              contains: params.busqueda,
              mode: 'insensitive'
            }
          }
        },
        {
          user: {
            lastName: {
              contains: params.busqueda,
              mode: 'insensitive'
            }
          }
        }
      ];
    }

    const shareholders = await prisma.accionistaLista.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            cedula: true,
            phone: true,
            // Incluir información de seguimiento para admin
            seguidores: params.currentAdminId ? {
              where: {
                followerId: params.currentAdminId
              }
            } : false
          }
        }
      },
      skip: params.offset,
      take: params.limit,
      orderBy: {
        ultimaActualizacion: 'desc'
      }
    });

    const total = await prisma.accionistaLista.count({ where });

    // Mapear datos con información de seguimiento
    const mappedData = shareholders.map(shareholder => ({
      id: shareholder.id,
      userId: shareholder.userId,
      nombre: shareholder.user.name,
      apellido: shareholder.user.lastName,
      email: shareholder.user.email,
      cedula: shareholder.user.cedula,
      phone: shareholder.user.phone,
      porcentaje: shareholder.porcentajeParticipacion,
      acciones: shareholder.cantidadAcciones,
      tipo: shareholder.tipo,
      ultimaActualizacion: shareholder.ultimaActualizacion,
      seguido: params.currentAdminId ? shareholder.user.seguidores.length > 0 : false
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
    console.error('Error in findAllWithAdminFollowStatus:', error);
    throw error;
  }
}

async findAllWithoutPagination(params: {
    currentAdminId?: number;
    tipo?: string;
    busqueda?: string;
  }) {
    // 1) Arma los filtros WHERE
    const where: any = { activo: true };
    if (params.tipo) {
      where.tipo = params.tipo;
    }
    if (params.busqueda) {
      where.OR = [
        { user: { name:     { contains: params.busqueda, mode: 'insensitive' } } },
        { user: { lastName: { contains: params.busqueda, mode: 'insensitive' } } }
      ];
    }

    // 2) Llama a Prisma con INCLUDE para traer la relación
    const rows = await prisma.accionistaLista.findMany({
      where,
      include: {
        user: {
          select: {
            id:       true,
            name:     true,
            lastName: true,
            email:    true,
            cedula:   true,
            phone:    true,
            // Si hay admin, incluye el array de seguidores filtrado
            seguidores: params.currentAdminId
              ? { where: { followerId: params.currentAdminId } }
              : false
          }
        }
      },
      orderBy: { ultimaActualizacion: 'desc' }
    });

    // 3) Mapea al DTO de frontend usando r.user.*
    return rows.map(r => ({
      id:                  r.id,
      userId:              r.user.id,
      nombre:              r.user.name,
      apellido:            r.user.lastName,
      email:               r.user.email,
      cedula:              r.user.cedula,
      phone:               r.user.phone,
      porcentaje:          r.porcentajeParticipacion,
      acciones:            r.cantidadAcciones,
      tipo:                r.tipo,
      ultimaActualizacion: r.ultimaActualizacion,
      // si no viene currentAdminId, r.user.seguidores estará undefined
      seguido:             params.currentAdminId
                            ? r.user.seguidores.length > 0
                            : false
    }));
  }

  // Obtener estado de seguimiento para un usuario específico
  async getFollowingStatus(currentUserId: number, shareholderIds: number[]) {
    const follows = await prisma.accionistaFollow.findMany({
      where: {
        followerId: currentUserId,
        followedId: {
          in: shareholderIds
        }
      },
      select: {
        followedId: true
      }
    });

    return follows.map(f => f.followedId);
  }

  // Obtener estadísticas de accionistas
  async getStats() {
    const totalAccionistas = await prisma.accionistaLista.count({
      where: { activo: true }
    });

    const tipoStats = await prisma.accionistaLista.groupBy({
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

    const totalAcciones = await prisma.accionistaLista.aggregate({
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
  }

  // Verificar si un usuario ya está en la lista de accionistas
  async existsByUserId(userId: number) {
    const exists = await prisma.accionistaLista.findUnique({
      where: { userId }
    });
    return !!exists;
  }

  // Obtener usuarios que NO están en la lista de accionistas (para agregar nuevos)
  async getAvailableUsers() {
    return await prisma.users.findMany({
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
  }
}