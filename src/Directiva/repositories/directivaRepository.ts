import { prisma } from "../../prismaClient/client";

export class DirectivaRepository {
  
  // Obtener contenido general de directiva
  async getDirectivaContent() {
    const content = await prisma.directivaContent.findFirst({
      orderBy: { updatedAt: 'desc' }
    });
    
    // Si no existe contenido, crear uno por defecto
    if (!content) {
      return await this.createDefaultContent();
    }
    
    return content;
  }

  // Crear contenido por defecto
  async createDefaultContent() {
    return await prisma.directivaContent.create({
      data: {
        title: "Directiva de la Fundación",
        description: "Nuestro equipo directivo está comprometido con la excelencia financiera y el crecimiento sostenible de nuestra institución.",
        quote: "Liderando con integridad, innovación y responsabilidad para construir un futuro financiero sólido",
        institutionalTitle: "Compromiso con la Excelencia",
        institutionalContent: "Nuestra directiva trabaja bajo los más altos estándares de gobernanza corporativa, asegurando transparencia, ética y eficiencia en todas nuestras operaciones financieras. Cada miembro aporta una combinación única de experiencia, visión estratégica y compromiso con nuestros valores institucionales.",
        adminId: 1 // Admin por defecto
      }
    });
  }

  // Obtener miembros de la directiva
  async getDirectivaMembers() {
    const members = await prisma.directivaMember.findMany({
      orderBy: { position: 'asc' },
      include: {
        admin: {
          select: {
            id: true,
            names: true,
            lastNames: true
          }
        }
      }
    });

    // Si no hay miembros, crear algunos por defecto
    if (members.length === 0) {
      return await this.createDefaultMembers();
    }

    return members;
  }

  // Crear miembros por defecto
  async createDefaultMembers() {
    const defaultMembers = [
      {
        title: "Presidente de la Fundación",
        name: "Dr. Carlos Méndez",
        image: "/assets/image/Perfil.jpg",
        href: "/directiva/presidente",
        position: 1,
        adminId: 1
      },
      {
        title: "Vicepresidente",
        name: "Lic. Ana Rodríguez",
        image: "/assets/image/Perfil1.png",
        href: "/directiva/vicepresidente",
        position: 2,
        adminId: 1
      },
      {
        title: "Recursos Humanos",
        name: "Mg. Luis Fernández",
        image: "/assets/image/Perfil.jpg",
        href: "/directiva/rrhh",
        position: 3,
        adminId: 1
      }
    ];

    const createdMembers = await Promise.all(
      defaultMembers.map(member => 
        prisma.directivaMember.create({
          data: member,
          include: {
            admin: {
              select: {
                id: true,
                names: true,
                lastNames: true
              }
            }
          }
        })
      )
    );

    return createdMembers;
  }

  // Actualizar contenido de directiva
  async updateDirectivaContent(data: any, adminId: number) {
    // Buscar el contenido existente
    const existingContent = await prisma.directivaContent.findFirst();
    
    if (existingContent) {
      // Actualizar el existente
      return await prisma.directivaContent.update({
        where: { id: existingContent.id },
        data: {
          ...data,
          adminId,
          updatedAt: new Date()
        }
      });
    } else {
      // Crear nuevo si no existe
      return await prisma.directivaContent.create({
        data: {
          ...data,
          adminId
        }
      });
    }
  }

  // Obtener miembro específico
  async getDirectivaMemberById(id: number) {
    return await prisma.directivaMember.findUnique({
      where: { id },
      include: {
        admin: {
          select: {
            id: true,
            names: true,
            lastNames: true
          }
        }
      }
    });
  }

  // Crear nuevo miembro
  async createDirectivaMember(data: any, adminId: number) {
    // Obtener la siguiente posición disponible
    const lastMember = await prisma.directivaMember.findFirst({
      orderBy: { position: 'desc' }
    });
    
    const nextPosition = (lastMember?.position || 0) + 1;

    return await prisma.directivaMember.create({
      data: {
        ...data,
        position: data.position || nextPosition,
        adminId
      },
      include: {
        admin: {
          select: {
            id: true,
            names: true,
            lastNames: true
          }
        }
      }
    });
  }

  // Actualizar miembro
  async updateDirectivaMember(id: number, data: any, adminId: number) {
    return await prisma.directivaMember.update({
      where: { id },
      data: {
        ...data,
        adminId,
        updatedAt: new Date()
      },
      include: {
        admin: {
          select: {
            id: true,
            names: true,
            lastNames: true
          }
        }
      }
    });
  }

  // Eliminar miembro
  async deleteDirectivaMember(id: number) {
    return await prisma.directivaMember.delete({
      where: { id }
    });
  }

  // Actualizar múltiples miembros
  async updateMultipleMembers(membersData: any[], adminId: number) {
    const updatePromises = membersData.map((memberData, index) => {
      if (memberData.id) {
        // Actualizar miembro existente
        return prisma.directivaMember.update({
          where: { id: memberData.id },
          data: {
            title: memberData.title,
            name: memberData.name,
            image: memberData.image,
            href: memberData.href,
            position: memberData.position || index + 1,
            adminId,
            updatedAt: new Date()
          },
          include: {
            admin: {
              select: {
                id: true,
                names: true,
                lastNames: true
              }
            }
          }
        });
      } else {
        // Crear nuevo miembro
        return prisma.directivaMember.create({
          data: {
            title: memberData.title,
            name: memberData.name,
            image: memberData.image || "/assets/image/default.jpg",
            href: memberData.href || "/directiva/member",
            position: memberData.position || index + 1,
            adminId
          },
          include: {
            admin: {
              select: {
                id: true,
                names: true,
                lastNames: true
              }
            }
          }
        });
      }
    });

    return await Promise.all(updatePromises);
  }

  // Obtener estadísticas de la directiva
  async getDirectivaStats() {
    const totalMembers = await prisma.directivaMember.count();
    const lastUpdate = await prisma.directivaContent.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true }
    });

    return {
      totalMembers,
      lastUpdate: lastUpdate?.updatedAt
    };
  }
}