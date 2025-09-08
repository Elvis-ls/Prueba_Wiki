import { prisma } from '../../prismaClient/client';

interface CreateMontoContributionDTO {
  userId: number;
  year: number;
  month: number;
  amountToPay: number;
  amountPaid?: number;
}
interface UpdateStatusDTO {
  contributionId: number;
  status: 'Pendiente' | 'Aprobado' | 'Rechazado' | 'Pagado';
  adminId?: number; // Para saber qué admin aprobó/rechazó
}
//PARA CUANDO SE IMPLEMNTE LOS COMENTARIOS EN LA BD
interface UpdateCommentDTO {
  userId: number;
  year: number;
  month: number;
  comments: string;
}

export class MontoContributionService {
  async create(dto: CreateMontoContributionDTO) {
    // Validar que userId no sea undefined
    if (!dto.userId) {
      throw new Error('userId es requerido para crear una contribución');
    }

    console.log('Intentando crear/actualizar contribución:', dto); // Para debugging

    try {
      // Primero, intentar buscar si ya existe
      const existing = await prisma.montoContribution.findFirst({
        where: {
          userId: dto.userId,
          year: dto.year,
          month: dto.month
        }
      });

      if (existing) {
        // Si existe, actualizarlo
        console.log('Contribución existe, actualizando...', existing.id);
        return await prisma.montoContribution.update({
          where: { id: existing.id },
          data: {
            amountToPay: dto.amountToPay,
            amountPaid: dto.amountPaid ?? existing.amountPaid,
            status: 'Pendiente', // Resetear status cuando se cambia el monto
          }
        });
      } else {
        // Si no existe, crearlo
        console.log('Contribución no existe, creando nueva...');
        return await prisma.montoContribution.create({
          data: {
            userId: dto.userId,
            year: dto.year,
            month: dto.month,
            amountToPay: dto.amountToPay,
            amountPaid: dto.amountPaid ?? 0,
            status: 'Pendiente',
          },
        });
      }
    } catch (error: any) {
      console.error('Error en MontoContributionService:', error);
      throw error;
    }
  }
  
//PARA GUARDAR LOS COMENTARIOS DE UNA CONTRIBUCIÓN(SOLO ADMIN)
  async updateComments(dto: UpdateCommentDTO) {
    try {
      console.log('Actualizando comentarios de contribución:', dto);
      
      // Buscar la contribución existente
      const existing = await prisma.montoContribution.findFirst({
        where: {
          userId: dto.userId,
          year: dto.year,
          month: dto.month
        }
      });

      if (existing) {
        // Si existe, actualizar los comentarios
        return await prisma.montoContribution.update({
          where: { id: existing.id },
          data: {
            comments: dto.comments
          }
        });
      } else {
        // Si no existe y hay comentarios, crear el registro con monto 0
        if (dto.comments.trim()) {
          return await prisma.montoContribution.create({
            data: {
              userId: dto.userId,
              year: dto.year,
              month: dto.month,
              amountToPay: 0,
              amountPaid: 0,
              status: 'Pendiente',
              comments: dto.comments
            }
          });
        }
        return null;
      }
    } catch (error: any) {
      console.error('Error actualizando comentarios:', error);
      throw new Error(`Error al actualizar comentarios: ${error.message}`);
    }
  }


  async markAsPaid(id: number) {
    return await prisma.montoContribution.update({
      where: { id },
      data: {
        status: 'Pagado',
        paidAt: new Date(),
      },
    });
  }

  // NUEVA FUNCIÓN: Actualizar el estado de una contribución (aprobar/rechazar) y tambien actualizar el monto
  async updateStatus(dto: UpdateStatusDTO & { amountToPay?: number }) {
    try {
      console.log('Actualizando estado de contribución:', dto);
      
      const updateData: any = {
        status: dto.status,
      };

      // Si se está aprobando, también actualizar la fecha de aprobación
      if (dto.status === 'Aprobado') {
        updateData.paidAt = new Date(); // Usar paidAt como fecha de aprobación por ahora
      }

      // actualizar el monto
      if (dto.amountToPay !== undefined) {
        updateData.amountToPay = dto.amountToPay;
      }

      const updated = await prisma.montoContribution.update({
        where: { id: dto.contributionId },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      console.log('Contribución actualizada en su estado y en su monto exitosamente:', updated);
      return updated;
    } catch (error: any) {
      console.error('Error actualizando estado de contribución y su monto: ', error);
      throw new Error(`Error al actualizar el estado: ${error.message}`);
    }
  }

  // NUEVA FUNCIÓN: Buscar una contribución específica por usuario, año y mes
  async findByUserYearMonth(userId: number, year: number, month: number) {
    try {
      return await prisma.montoContribution.findFirst({
        where: {
          userId,
          year,
          month
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              lastName: true,
              email: true
            }
          }
        }
      });
    } catch (error: any) {
      console.error('Error buscando contribución específica:', error);
      throw error;
    }
  }


  async findByUser(userId: number) {
    return await prisma.montoContribution.findMany({
      where: { userId },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ]
    });
  }

  async findAll() {
    return await prisma.montoContribution.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ]
    });
  }
}