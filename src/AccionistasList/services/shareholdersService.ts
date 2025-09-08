// services/shareholdersService.ts
import { ShareholdersRepository } from "../repositories/shareholdersRepository";
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

export class ShareholdersService {
  private repository: ShareholdersRepository;

  constructor() {
    this.repository = new ShareholdersRepository();
  }
  

  // Obtener lista de accionistas con paginación
  async getShareholders(filters: any, currentUserId?: number) {
    try {
      console.log(`=== SERVICE: Obteniendo accionistas ===`);
      console.log('Filtros recibidos:', filters);
      
      const { page = 1, limit = 12, ...otherFilters } = filters;
      const skip = (page - 1) * limit;
      
      const searchFilters = {
        ...otherFilters,
        skip,
        take: limit
      };

      // Obtener accionistas
      const shareholders = await this.repository.getAll(searchFilters);
      const total = await this.repository.count(otherFilters);
      
      console.log(`Encontrados ${shareholders.length} accionistas de ${total} totales`);

      // Si hay un usuario logueado, obtener su información de seguimiento
      let followingIds: number[] = [];
      if (currentUserId) {
        const userIds = shareholders.map(s => s.user.id);
        followingIds = await this.repository.getFollowingStatus(currentUserId, userIds);
      }

      // Formatear datos para el frontend
      const formattedShareholders = shareholders.map(shareholder => ({
        id: shareholder.id,
        userId: shareholder.user.id,
        nombre: shareholder.user.name,
        apellido: shareholder.user.lastName,
        cedula: shareholder.user.cedula,
        email: shareholder.user.email,
        imagen: shareholder.user.image || '/placeholder-user.jpg',
        phone: shareholder.user.phone,
        status: shareholder.user.status,
        role: shareholder.user.role,
        credencialPath: shareholder.user.credencialPath,
        
        // Datos específicos de accionista
        tipo: shareholder.tipo,
        porcentaje: shareholder.porcentajeParticipacion,
        acciones: shareholder.cantidadAcciones,
        activo: shareholder.activo,
        fechaIngreso: shareholder.fechaIngreso,
        ultimaActualizacion: shareholder.ultimaActualizacion.toISOString().split('T')[0],
        
        // Estado de seguimiento
        seguido: currentUserId ? followingIds.includes(shareholder.user.id) : false,
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
  }

  // servicio para el modal ProfileHeader
  async getFollowingOfUser(userId: number) {
    return await this.repository.getFollowingOfUser(userId);
  }


  // Obtener accionista por ID
  async getShareholderById(id: number) {
    try {
      const shareholder = await this.repository.getById(id);
      
      if (!shareholder) {
        throw new Error('Accionista no encontrado');
      }

      return {
        // datos especificos del campo user
        id: shareholder.id,
        userId: shareholder.user.id,
        nombre: shareholder.user.name,
        apellido: shareholder.user.lastName,
        cedula: shareholder.user.cedula,
        email: shareholder.user.email,
        imagen: shareholder.user.image || '/placeholder-user.jpg',
        phone: shareholder.user.phone,
        description: shareholder.user.description,
        addressHome: shareholder.user.addressHome,
        areaPosition: shareholder.user.areaPosition,
        institutionLevel: shareholder.user.institutionLevel,
        location: shareholder.user.location,
        birthDate: shareholder.user.birthDate,
        status: shareholder.user.status,
        role: shareholder.user.role,
        credencialPath: shareholder.user.credencialPath,
        
        // Datos específicos de accionista
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
  }

  // Crear nuevo accionista (solo admins)
  async createShareholder(data: CreateShareholderData) {
    try {
      let userId: number;

      // Si se proporciona userId, usarlo directamente
      if (data.userId) {
        userId = data.userId;
        
        // Verificar que el usuario existe
        const userExists = await this.repository.getUserById(userId);
        if (!userExists) {
          throw new Error('El usuario especificado no existe');
        }
      } 
      // Si se proporcionan firstName y lastName, buscar el usuario
      else if (data.firstName && data.lastName) {
        const user = await this.repository.getUserByNames(data.firstName, data.lastName);
        if (!user) {
          throw new Error(`No se encontró un usuario con el nombre "${data.firstName} ${data.lastName}". El usuario debe existir antes de agregarlo como accionista.`);
        }
        userId = user.id;
      } 
      else {
        throw new Error('Debe proporcionar userId o firstName y lastName');
      }

      // Verificar si el usuario ya está en la lista de accionistas
      const exists = await this.repository.existsByUserId(userId);
      if (exists) {
        throw new Error('El usuario ya está registrado como accionista');
      }

      // Crear el accionista con el userId encontrado/proporcionado
      const shareholderData = {
        userId,
        tipo: data.tipo,
        porcentajeParticipacion: data.porcentajeParticipacion,
        cantidadAcciones: data.cantidadAcciones,
      };

      const newShareholder = await this.repository.create(shareholderData);
      
      return {
        id: newShareholder.id,
        userId: newShareholder.user.id,
        nombre: newShareholder.user.name,
        apellido: newShareholder.user.lastName,
        cedula: newShareholder.user.cedula,
        email: newShareholder.user.email,
        imagen: newShareholder.user.image || '/placeholder-user.jpg',
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
  }

  // Actualizar accionista (solo admins)
  async updateShareholder(id: number, data: any) {
    try {
      const updatedShareholder = await this.repository.update(id, data);
      
      return {
        id: updatedShareholder.id,
        userId: updatedShareholder.user.id,
        nombre: updatedShareholder.user.name,
        apellido: updatedShareholder.user.lastName,
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
  }

  // Eliminar accionista (solo admins)
  async deleteShareholder(id: number) {
    try {
      await this.repository.delete(id);
      return { message: 'Accionista eliminado correctamente' };
    } catch (error) {
      console.error('Error deleting shareholder:', error);
      throw new Error('Error al eliminar el accionista');
    }
  }

  // Toggle seguir/dejar de seguir accionista (usuarios normales)
async toggleFollowShareholder(currentUserId: number, shareholderUserId: number) {
  try {
    if (currentUserId === shareholderUserId) {
      throw new Error('No puedes seguirte a ti mismo');
    }

    const result = await this.repository.toggleFollow(currentUserId, shareholderUserId);
    return result;
  } catch (error) {
    console.error('Error toggling follow:', error);
    throw error;
  }
}
// Toggle seguir/dejar de seguir accionista (administradores)
async toggleFollowShareholderForAdmin(currentAdminId: number, shareholderUserId: number) {
  try {
    // Los admins pueden seguir a cualquier accionista
    const result = await this.repository.toggleFollowFromAdmin(currentAdminId, shareholderUserId);
    return result;
  } catch (error) {
    console.error('Error toggling follow for admin:', error);
    throw error;
  }
}

// Obtener accionistas con información de seguimiento para usuarios
async getShareholdersS(params: {
  page: number;
  limit: number;
  tipo?: string;
  busqueda?: string;
  currentUserId?: number;
}) {
  try {
    const offset = (params.page - 1) * params.limit;
    
    const result = await this.repository.findAllWithFollowStatus({
      ...params,
      offset
    });

    console.log("resultados del controlador: ", result);
    
    // Filtrar para que el usuario no se vea a sí mismo
    if (params.currentUserId) {
      result.data = result.data.filter(shareholder => 
        shareholder.userId !== params.currentUserId
      );
    }
    
    return result;
  } catch (error) {
    console.error('Error getting shareholders:', error);
    throw error;
  }
}

// Obtener accionistas para administradores (pueden ver todos)
async getShareholdersForAdmin(params: {
  page: number;
  limit: number;
  tipo?: string;
  busqueda?: string;
  currentAdminId?: number;
}) {
  try {
    const offset = (params.page - 1) * params.limit;
    
    const result = await this.repository.findAllWithAdminFollowStatus({
      ...params,
      offset
    });
    
    return result;
  } catch (error) {
    console.error('Error getting shareholders for admin:', error);
    throw error;
  }
}

  async getAllShareholdersForAdmin(params: {
    currentAdminId?: number;
    tipo?: string;
    busqueda?: string;
  }) {
    // Llama al repo sin pasar offset ni limit
    const all = await this.repository.findAllWithoutPagination(params);

    return {
      data: all,
      pagination: {
        page:       1,
        limit:      all.length,
        total:      all.length,
        totalPages: 1
      }
    };
  }

  // Obtener estadísticas de accionistas
  async getStats() {
    try {
      return await this.repository.getStats();
    } catch (error) {
      console.error('Error getting stats:', error);
      throw new Error('Error al obtener las estadísticas');
    }
  }

  // Obtener usuarios disponibles para agregar como accionistas
  async getAvailableUsers() {
    try {
      return await this.repository.getAvailableUsers();
    } catch (error) {
      console.error('Error getting available users:', error);
      throw new Error('Error al obtener usuarios disponibles');
    }
  }
}