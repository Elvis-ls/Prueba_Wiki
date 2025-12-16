import { prisma } from '../../prismaClient/client';

interface InviteReferralData {
    invitador_id: number;
    nombres: string;
    apellidos: string;
    email: string;
    cedula: string;
    telefono?: string;
}

// Invitar un nuevo referido
export const inviteReferral = async (data: InviteReferralData) => {
    try {
        // Validaciones básicas
        if (!data.invitador_id || data.invitador_id <= 0) {
            throw new Error('ID de invitador es requerido');
        }

        if (!data.nombres || data.nombres.trim().length < 2) {
            throw new Error('El nombre debe tener al menos 2 caracteres');
        }

        if (!data.apellidos || data.apellidos.trim().length < 2) {
            throw new Error('Los apellidos deben tener al menos 2 caracteres');
        }

        if (!data.email || !data.email.includes('@')) {
            throw new Error('Debe proporcionar un email válido');
        }

        if (!data.cedula || data.cedula.trim().length < 8) {
            throw new Error('La cédula debe tener al menos 8 caracteres');
        }

        // Verificar que el invitador existe
        const invitadorExists = await prisma.accionista.findUnique({
            where: { id: data.invitador_id }
        });

        if (!invitadorExists) {
            throw new Error('El accionista invitador no existe');
        }

        // Verificar si ya existe una invitación con el mismo email o cédula
        const existingReferral = await prisma.referidos.findFirst({
            where: {
                OR: [
                    { email: data.email.trim().toLowerCase() },
                    { cedula: data.cedula.trim() }
                ]
            }
        });

        if (existingReferral) {
            throw new Error('Ya existe una invitación para este email o cédula');
        }

        // Verificar si ya es accionista
        const existingAccionista = await prisma.accionista.findFirst({
            where: {
                OR: [
                    { email: data.email.trim().toLowerCase() },
                    { cedula: data.cedula.trim() }
                ]
            }
        });

        if (existingAccionista) {
            throw new Error('Esta persona ya es accionista de la empresa');
        }

        const referral = await prisma.referidos.create({
            data: {
                invitador_id: data.invitador_id,
                nombres: data.nombres.trim(),
                apellidos: data.apellidos.trim(),
                email: data.email.trim().toLowerCase(),
                cedula: data.cedula.trim(),
                telefono: data.telefono?.trim(),
                estado: 'Pendiente'
            },
            include: {
                invitador: {
                    select: {
                        id: true,
                        name: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        return {
            id: referral.id,
            invitador_id: referral.invitador_id,
            nombres: referral.nombres,
            apellidos: referral.apellidos,
            email: referral.email,
            cedula: referral.cedula,
            telefono: referral.telefono,
            estado: referral.estado,
            fecha_invitacion: referral.fecha_invitacion,
            invitador: {
                nombre_completo: `${referral.invitador.name} ${referral.invitador.lastName}`,
                email: referral.invitador.email
            }
        };
    } catch (error: any) {
        console.error('Error en inviteReferral:', error);
        throw new Error(`Error al invitar referido: ${error.message}`);
    }
};

// Obtener referidos de un accionista
export const getReferralsByAccionista = async (accionistaId: number) => {
    try {
        if (!accionistaId || accionistaId <= 0) {
            throw new Error('ID de accionista inválido');
        }

        // Verificar que el accionista existe
        const accionistaExists = await prisma.accionista.findUnique({
            where: { id: accionistaId }
        });

        if (!accionistaExists) {
            throw new Error('Accionista no encontrado');
        }

        const referrals = await prisma.referidos.findMany({
            where: { 
                invitador_id: accionistaId 
            },
            include: {
                referido: {
                    select: {
                        id: true,
                        name: true,
                        lastName: true,
                        email: true,
                        createdAt: true
                    }
                }
            },
            orderBy: { 
                fecha_invitacion: 'desc' 
            }
        });

        return referrals.map(referral => ({
            id: referral.id,
            nombres: referral.nombres,
            apellidos: referral.apellidos,
            nombre_completo: `${referral.nombres} ${referral.apellidos}`,
            email: referral.email,
            cedula: referral.cedula,
            telefono: referral.telefono,
            estado: referral.estado,
            fecha_invitacion: referral.fecha_invitacion,
            fecha_registro: referral.fecha_registro,
            referido_registrado: referral.referido ? {
                id: referral.referido.id,
                nombre_completo: `${referral.referido.name} ${referral.referido.lastName}`,
                email: referral.referido.email,
                fecha_registro: referral.referido.createdAt
            } : null
        }));
    } catch (error: any) {
        console.error('Error en getReferralsByAccionista:', error);
        throw new Error(`Error al obtener referidos: ${error.message}`);
    }
};

// Actualizar estado de referido (para admin)
export const updateReferralStatus = async (referralId: number, newStatus: string, referido_id?: number) => {
    try {
        if (!referralId || referralId <= 0) {
            throw new Error('ID de referido inválido');
        }

        const validStatuses = ['Pendiente', 'Registrado', 'Rechazado'];
        if (!validStatuses.includes(newStatus)) {
            throw new Error('Estado inválido. Use: Pendiente, Registrado, Rechazado');
        }

        const existingReferral = await prisma.referidos.findUnique({
            where: { id: referralId }
        });

        if (!existingReferral) {
            throw new Error('Referido no encontrado');
        }

        const updateData: any = {
            estado: newStatus,
            updatedAt: new Date()
        };

        // Si el estado es "Registrado" y se proporciona referido_id
        if (newStatus === 'Registrado') {
            updateData.fecha_registro = new Date();
            
            if (referido_id) {
                // Verificar que el accionista referido existe
                const referidoExists = await prisma.accionista.findUnique({
                    where: { id: referido_id }
                });

                if (!referidoExists) {
                    throw new Error('El accionista referido no existe');
                }

                updateData.referido_id = referido_id;
            }
        }

        const updatedReferral = await prisma.referidos.update({
            where: { id: referralId },
            data: updateData,
            include: {
                invitador: {
                    select: {
                        name: true,
                        lastName: true,
                        email: true
                    }
                },
                referido: {
                    select: {
                        id: true,
                        name: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        return {
            id: updatedReferral.id,
            nombres: updatedReferral.nombres,
            apellidos: updatedReferral.apellidos,
            email: updatedReferral.email,
            cedula: updatedReferral.cedula,
            estado: updatedReferral.estado,
            fecha_invitacion: updatedReferral.fecha_invitacion,
            fecha_registro: updatedReferral.fecha_registro,
            invitador: `${updatedReferral.invitador.name} ${updatedReferral.invitador.lastName}`,
            referido_registrado: updatedReferral.referido ? 
                `${updatedReferral.referido.name} ${updatedReferral.referido.lastName}` : null
        };
    } catch (error: any) {
        console.error('Error en updateReferralStatus:', error);
        throw new Error(`Error al actualizar estado del referido: ${error.message}`);
    }
};

// Obtener todos los referidos (para admin)
export const getAllReferrals = async (page: number = 1, limit: number = 10, estado?: string) => {
    try {
        const skip = (page - 1) * limit;

        const whereCondition: any = {};
        if (estado && ['Pendiente', 'Registrado', 'Rechazado'].includes(estado)) {
            whereCondition.estado = estado;
        }

        const [referrals, total] = await Promise.all([
            prisma.referidos.findMany({
                where: whereCondition,
                skip,
                take: limit,
                include: {
                    invitador: {
                        select: {
                            id: true,
                            name: true,
                            lastName: true,
                            email: true
                        }
                    },
                    referido: {
                        select: {
                            id: true,
                            name: true,
                            lastName: true,
                            email: true
                        }
                    }
                },
                orderBy: { 
                    fecha_invitacion: 'desc' 
                }
            }),
            prisma.referidos.count({ where: whereCondition })
        ]);

        const formattedReferrals = referrals.map(referral => ({
            id: referral.id,
            invitador_id: referral.invitador_id,
            nombres: referral.nombres,
            apellidos: referral.apellidos,
            nombre_completo: `${referral.nombres} ${referral.apellidos}`,
            email: referral.email,
            cedula: referral.cedula,
            telefono: referral.telefono,
            estado: referral.estado,
            fecha_invitacion: referral.fecha_invitacion,
            fecha_registro: referral.fecha_registro,
            invitador: {
                id: referral.invitador.id,
                nombre_completo: `${referral.invitador.name} ${referral.invitador.lastName}`,
                email: referral.invitador.email
            },
            referido_registrado: referral.referido ? {
                id: referral.referido.id,
                nombre_completo: `${referral.referido.name} ${referral.referido.lastName}`,
                email: referral.referido.email
            } : null
        }));

        return {
            referrals: formattedReferrals,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        };
    } catch (error: any) {
        console.error('Error en getAllReferrals:', error);
        throw new Error(`Error al obtener todos los referidos: ${error.message}`);
    }
};

// Obtener estadísticas de referidos
export const getReferralStats = async () => {
    try {
        const [totalReferrals, pendingReferrals, registeredReferrals, rejectedReferrals, topInviters] = await Promise.all([
            prisma.referidos.count(),
            prisma.referidos.count({ where: { estado: 'Pendiente' } }),
            prisma.referidos.count({ where: { estado: 'Registrado' } }),
            prisma.referidos.count({ where: { estado: 'Rechazado' } }),
            prisma.referidos.groupBy({
                by: ['invitador_id'],
                _count: {
                    id: true
                },
                orderBy: {
                    _count: {
                        id: 'desc'
                    }
                },
                take: 5
            })
        ]);

        // Obtener información de los top invitadores
        const topInvitersWithInfo = await Promise.all(
            topInviters.map(async (inviter) => {
                const accionista = await prisma.accionista.findUnique({
                    where: { id: inviter.invitador_id },
                    select: {
                        name: true,
                        lastName: true,
                        email: true
                    }
                });

                return {
                    invitador_id: inviter.invitador_id,
                    nombre_completo: accionista ? `${accionista.name} ${accionista.lastName}` : 'No encontrado',
                    email: accionista?.email || 'No encontrado',
                    total_referidos: inviter._count.id
                };
            })
        );

        const conversionRate = totalReferrals > 0 ? 
            ((registeredReferrals / totalReferrals) * 100).toFixed(2) : '0.00';

        return {
            totalReferrals,
            pendingReferrals,
            registeredReferrals,
            rejectedReferrals,
            conversionRate: `${conversionRate}%`,
            topInviters: topInvitersWithInfo
        };
    } catch (error: any) {
        console.error('Error en getReferralStats:', error);
        throw new Error(`Error al obtener estadísticas de referidos: ${error.message}`);
    }
};