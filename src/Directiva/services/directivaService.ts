import { DirectivaRepository } from "../repositories/directivaRepository";

export class DirectivaService {
  private repository: DirectivaRepository;

  constructor() {
    this.repository = new DirectivaRepository();
  }

  // Obtener contenido completo de directiva
  async getDirectivaContent() {
    try {
      const content = await this.repository.getDirectivaContent();
      
      return {
        sectionContent: {
          title: content.title,
          description: content.description,
          quote: content.quote
        },
        institutionalMessage: {
          title: content.institutionalTitle,
          content: content.institutionalContent
        },
        metadata: {
          lastUpdated: content.updatedAt,
          updatedBy: content.adminId
        }
      };
    } catch (error) {
      throw new Error(`Error al obtener el contenido de la directiva: ${error}`);
    }
  }

  // Obtener miembros de la directiva
  async getDirectivaMembers() {
    try {
      const members = await this.repository.getDirectivaMembers();
      
      return members.map(member => ({
        id: member.id,
        title: member.title,
        name: member.name,
        image: member.image || "/assets/image/default.jpg",
        href: member.href,
        position: member.position,
        lastUpdated: member.updatedAt,
        updatedBy: {
          id: member.admin.id,
          name: `${member.admin.names} ${member.admin.lastNames}`
        }
      }));
    } catch (error) {
      throw new Error(`Error al obtener los miembros de la directiva: ${error}`);
    }
  }

  // Actualizar contenido de directiva
  async updateDirectivaContent(data: any, adminId: number) {
    try {
      const updateData = {
        title: data.title,
        description: data.description,
        quote: data.quote,
        institutionalTitle: data.institutionalTitle,
        institutionalContent: data.institutionalContent
      };

      const updatedContent = await this.repository.updateDirectivaContent(updateData, adminId);
      
      return {
        success: true,
        content: updatedContent,
        message: 'Contenido actualizado correctamente'
      };
    } catch (error) {
      throw new Error(`Error al actualizar el contenido de la directiva: ${error}`);
    }
  }

  // Crear nuevo miembro
  async createDirectivaMember(data: any, adminId: number) {
    try {
      const newMember = await this.repository.createDirectivaMember(data, adminId);
      
      return {
        id: newMember.id,
        title: newMember.title,
        name: newMember.name,
        image: newMember.image,
        href: newMember.href,
        position: newMember.position,
        createdAt: newMember.createdAt,
        updatedBy: {
          id: newMember.admin.id,
          name: `${newMember.admin.names} ${newMember.admin.lastNames}`
        }
      };
    } catch (error) {
      throw new Error(`Error al crear el miembro de la directiva: ${error}`);
    }
  }

  // Actualizar miembro específico
  async updateDirectivaMember(id: number, data: any, adminId: number) {
    try {
      // Verificar que el miembro existe
      const existingMember = await this.repository.getDirectivaMemberById(id);
      if (!existingMember) {
        throw new Error('Miembro no encontrado');
      }

      const updatedMember = await this.repository.updateDirectivaMember(id, data, adminId);
      
      return {
        id: updatedMember.id,
        title: updatedMember.title,
        name: updatedMember.name,
        image: updatedMember.image,
        href: updatedMember.href,
        position: updatedMember.position,
        lastUpdated: updatedMember.updatedAt,
        updatedBy: {
          id: updatedMember.admin.id,
          name: `${updatedMember.admin.names} ${updatedMember.admin.lastNames}`
        }
      };
    } catch (error) {
      throw new Error(`Error al actualizar el miembro de la directiva: ${error}`);
    }
  }

  // Eliminar miembro
  async deleteDirectivaMember(id: number) {
    try {
      // Verificar que el miembro existe
      const existingMember = await this.repository.getDirectivaMemberById(id);
      if (!existingMember) {
        throw new Error('Miembro no encontrado');
      }

      await this.repository.deleteDirectivaMember(id);
      
      return {
        success: true,
        message: 'Miembro eliminado correctamente'
      };
    } catch (error) {
      throw new Error(`Error al eliminar el miembro de la directiva: ${error}`);
    }
  }

  // Actualizar múltiples miembros
  async updateMultipleMembers(membersData: any[], adminId: number) {
    try {
      if (!Array.isArray(membersData) || membersData.length === 0) {
        throw new Error('Se requiere un array válido de miembros');
      }

      // Validar datos básicos
      for (const member of membersData) {
        if (!member.title || !member.name) {
          throw new Error('Todos los miembros deben tener título y nombre');
        }
      }

      const updatedMembers = await this.repository.updateMultipleMembers(membersData, adminId);
      
      return updatedMembers.map(member => ({
        id: member.id,
        title: member.title,
        name: member.name,
        image: member.image,
        href: member.href,
        position: member.position,
        lastUpdated: member.updatedAt,
        updatedBy: {
          id: member.admin.id,
          name: `${member.admin.names} ${member.admin.lastNames}`
        }
      }));
    } catch (error) {
      throw new Error(`Error al actualizar múltiples miembros: ${error}`);
    }
  }

  // Obtener datos completos de la directiva (contenido + miembros)
  async getCompleteDirectiva() {
    try {
      const [content, members] = await Promise.all([
        this.getDirectivaContent(),
        this.getDirectivaMembers()
      ]);

      return {
        content,
        members,
        stats: await this.repository.getDirectivaStats()
      };
    } catch (error) {
      throw new Error(`Error al obtener los datos completos de la directiva: ${error}`);
    }
  }

  // Validar permisos de usuario
  validateUserPermissions(userRole: string, action: string) {
    const adminRoles = ['admin', 'Administrador', 'administrador'];
    const isAdmin = adminRoles.some(role => 
      userRole?.toLowerCase().includes(role.toLowerCase())
    );

    if (action === 'read') {
      // Todos pueden leer
      return true;
    }

    if (action === 'write' || action === 'edit' || action === 'delete') {
      // Solo admins pueden escribir/editar/eliminar
      return isAdmin;
    }

    return false;
  }
}