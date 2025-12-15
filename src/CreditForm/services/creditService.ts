import { prisma } from '../../prismaClient/client';

interface CreateCreditData {
  creditFormId: number;
  userId: number;
  montoAprobado: number;
  tasaInteres: number;
  plazoMeses: number;
  cuotaMensual: number;
  fechaInicio: string;
  fechaVencimiento: string;
  notas?: string;
}

interface UpdateCreditData {
  montoAprobado?: number;
  tasaInteres?: number;
  plazoMeses?: number;
  cuotaMensual?: number;
  fechaInicio?: string;
  fechaVencimiento?: string;
  status?: string;
  notas?: string;
}

// Obtener todos los créditos
export const getAllCredits = async () => {
  try {
    const credits = await prisma.credit.findMany({
      include: {
        user: {
          select: {
            name: true,
            lastName: true,
            cedula: true
          }
        },
        creditForm: {
          select: {
            numeroDocumento: true,
            nombres: true,
            apellidos: true,
            tipodeCredito: true
          }
        }
      },
      orderBy: {
        fechaAprobacion: 'desc'
      }
    });

    return credits.map(credit => ({
      id: credit.id,
      creditFormId: credit.creditFormId,
      userId: credit.userId,
      userName: `${credit.user.name} ${credit.user.lastName}`,
      cedula: credit.user.cedula,
      solicitante: `${credit.creditForm?.nombres} ${credit.creditForm?.apellidos}`,
      tipodeCredito: credit.creditForm?.tipodeCredito,
      montoAprobado: credit.montoAprobado,
      tasaInteres: credit.tasaInteres,
      plazoMeses: credit.plazoMeses,
      cuotaMensual: credit.cuotaMensual,
      fechaAprobacion: credit.fechaAprobacion,
      fechaInicio: credit.fechaInicio,
      fechaVencimiento: credit.fechaVencimiento,
      status: credit.status,
      notas: credit.notas
    }));
  } catch (error: any) {
    console.error('Error en getAllCredits:', error);
    throw new Error(`Error al obtener todos los créditos: ${error.message}`);
  }
};

// Crear un nuevo crédito
export const createCredit = async (data: CreateCreditData) => {
  try {
    // Verificar que el usuario existe
    const userExists = await prisma.users.findUnique({
      where: { id: data.userId }
    });

    if (!userExists) {
      throw new Error('El usuario especificado no existe');
    }

    // Verificar que el CreditForm existe
    const creditFormExists = await prisma.creditForm.findUnique({
      where: { numeroDocumento: data.creditFormId }
    });

    if (!creditFormExists) {
      throw new Error('El formulario de crédito especificado no existe');
    }

    // Verificar que no existe ya un crédito para ese CreditForm
    const existingCredit = await prisma.credit.findUnique({
      where: { creditFormId: data.creditFormId }
    });

    if (existingCredit) {
      throw new Error('Ya existe un crédito aprobado para ese formulario');
    }

    // Validaciones de negocio
    if (data.montoAprobado <= 0) {
      throw new Error('El monto aprobado debe ser mayor a 0');
    }

    if (data.tasaInteres < 0 || data.tasaInteres > 100) {
      throw new Error('La tasa de interés debe estar entre 0 y 100');
    }

    if (data.plazoMeses <= 0) {
      throw new Error('El plazo en meses debe ser mayor a 0');
    }

    const newCredit = await prisma.credit.create({
      data: {
        creditFormId: data.creditFormId,
        userId: data.userId,
        montoAprobado: data.montoAprobado,
        tasaInteres: data.tasaInteres,
        plazoMeses: data.plazoMeses,
        cuotaMensual: data.cuotaMensual,
        fechaInicio: new Date(data.fechaInicio),
        fechaVencimiento: new Date(data.fechaVencimiento),
        notas: data.notas
      },
      include: {
        user: {
          select: {
            name: true,
            lastName: true
          }
        }
      }
    });

    return {
      id: newCredit.id,
      creditFormId: newCredit.creditFormId,
      userId: newCredit.userId,
      userName: `${newCredit.user.name} ${newCredit.user.lastName}`,
      montoAprobado: newCredit.montoAprobado,
      tasaInteres: newCredit.tasaInteres,
      plazoMeses: newCredit.plazoMeses,
      cuotaMensual: newCredit.cuotaMensual,
      fechaAprobacion: newCredit.fechaAprobacion,
      fechaInicio: newCredit.fechaInicio,
      fechaVencimiento: newCredit.fechaVencimiento,
      status: newCredit.status,
      notas: newCredit.notas
    };
  } catch (error: any) {
    console.error('Error en createCredit:', error);
    throw new Error(`Error al crear el crédito: ${error.message}`);
  }
};

// Actualizar un crédito
export const updateCredit = async (id: number, data: UpdateCreditData) => {
  try {
    // Verificar que el crédito existe
    const existingCredit = await prisma.credit.findUnique({
      where: { id }
    });

    if (!existingCredit) {
      throw new Error('Crédito no encontrado');
    }

    // Validaciones si se están actualizando ciertos campos
    if (data.montoAprobado !== undefined && data.montoAprobado <= 0) {
      throw new Error('El monto aprobado debe ser mayor a 0');
    }

    if (data.tasaInteres !== undefined && (data.tasaInteres < 0 || data.tasaInteres > 100)) {
      throw new Error('La tasa de interés debe estar entre 0 y 100');
    }

    if (data.plazoMeses !== undefined && data.plazoMeses <= 0) {
      throw new Error('El plazo en meses debe ser mayor a 0');
    }

    const updateData: any = { ...data };
    
    if (data.fechaInicio) {
      updateData.fechaInicio = new Date(data.fechaInicio);
    }
    
    if (data.fechaVencimiento) {
      updateData.fechaVencimiento = new Date(data.fechaVencimiento);
    }

    const updatedCredit = await prisma.credit.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            lastName: true
          }
        }
      }
    });

    return {
      id: updatedCredit.id,
      creditFormId: updatedCredit.creditFormId,
      userId: updatedCredit.userId,
      userName: `${updatedCredit.user.name} ${updatedCredit.user.lastName}`,
      montoAprobado: updatedCredit.montoAprobado,
      tasaInteres: updatedCredit.tasaInteres,
      plazoMeses: updatedCredit.plazoMeses,
      cuotaMensual: updatedCredit.cuotaMensual,
      fechaAprobacion: updatedCredit.fechaAprobacion,
      fechaInicio: updatedCredit.fechaInicio,
      fechaVencimiento: updatedCredit.fechaVencimiento,
      status: updatedCredit.status,
      notas: updatedCredit.notas
    };
  } catch (error: any) {
    console.error('Error en updateCredit:', error);
    throw new Error(`Error al actualizar el crédito: ${error.message}`);
  }
};

// Eliminar un crédito
export const deleteCredit = async (id: number) => {
  try {
    const existingCredit = await prisma.credit.findUnique({
      where: { id }
    });

    if (!existingCredit) {
      throw new Error('Crédito no encontrado');
    }

    await prisma.credit.delete({
      where: { id }
    });

    return { message: 'Crédito eliminado exitosamente' };
  } catch (error: any) {
    console.error('Error en deleteCredit:', error);
    throw new Error(`Error al eliminar el crédito: ${error.message}`);
  }
};

// Obtener créditos por ID de usuario
export const getCreditsByUserId = async (userId: number) => {
  try {
    // Verificar que el usuario existe
    const userExists = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!userExists) {
      throw new Error('Usuario no encontrado');
    }

    const credits = await prisma.credit.findMany({
      where: { userId },
      include: {
        creditForm: {
          select: {
            numeroDocumento: true,
            tipodeCredito: true
          }
        }
      },
      orderBy: {
        fechaAprobacion: 'desc'
      }
    });

    return credits.map(credit => ({
      id: credit.id,
      creditFormId: credit.creditFormId,
      numeroDocumento: credit.creditForm?.numeroDocumento,
      tipodeCredito: credit.creditForm?.tipodeCredito,
      montoAprobado: credit.montoAprobado,
      tasaInteres: credit.tasaInteres,
      plazoMeses: credit.plazoMeses,
      cuotaMensual: credit.cuotaMensual,
      fechaAprobacion: credit.fechaAprobacion,
      fechaInicio: credit.fechaInicio,
      fechaVencimiento: credit.fechaVencimiento,
      status: credit.status
    }));
  } catch (error: any) {
    console.error('Error en getCreditsByUserId:', error);
    throw new Error(`Error al obtener créditos del usuario: ${error.message}`);
  }
};

// Obtener crédito por ID
export const getCreditById = async (id: number) => {
  try {
    const credit = await prisma.credit.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            lastName: true,
            cedula: true
          }
        },
        creditForm: {
          select: {
            numeroDocumento: true,
            nombres: true,
            apellidos: true,
            tipodeCredito: true,
            montoCredito: true
          }
        }
      }
    });

    if (!credit) {
      throw new Error('Crédito no encontrado');
    }

    return {
      id: credit.id,
      creditFormId: credit.creditFormId,
      userId: credit.userId,
      userName: `${credit.user.name} ${credit.user.lastName}`,
      cedula: credit.user.cedula,
      solicitante: `${credit.creditForm?.nombres} ${credit.creditForm?.apellidos}`,
      numeroDocumento: credit.creditForm?.numeroDocumento,
      tipodeCredito: credit.creditForm?.tipodeCredito,
      montoSolicitado: credit.creditForm?.montoCredito,
      montoAprobado: credit.montoAprobado,
      tasaInteres: credit.tasaInteres,
      plazoMeses: credit.plazoMeses,
      cuotaMensual: credit.cuotaMensual,
      fechaAprobacion: credit.fechaAprobacion,
      fechaInicio: credit.fechaInicio,
      fechaVencimiento: credit.fechaVencimiento,
      status: credit.status,
      notas: credit.notas
    };
  } catch (error: any) {
    console.error('Error en getCreditById:', error);
    throw new Error(`Error al obtener el crédito: ${error.message}`);
  }
};