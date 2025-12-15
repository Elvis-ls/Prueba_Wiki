import { prisma } from '../../prismaClient/client';

interface CreateCreditoData {
    formulario_id: number;
    accionista_id: number;
    monto_aprobado: number;
    tasa_interes: number;
    plazo_meses: number;
    cuota_mensual: number;
    fecha_inicio: string;
    fecha_vencimiento: string;
}

// Crear un nuevo crédito
export const createCredito = async (data: CreateCreditoData) => {
    try {
        const credito = await prisma.credito.create({
            data: {
                formulario_id: data.formulario_id,
                accionista_id: data.accionista_id,
                monto_aprobado: data.monto_aprobado,
                tasa_interes: data.tasa_interes,
                plazo_meses: data.plazo_meses,
                cuota_mensual: data.cuota_mensual,
                fecha_inicio: new Date(data.fecha_inicio),
                fecha_vencimiento: new Date(data.fecha_vencimiento)
            }
        });

        return credito;
    } catch (error: any) {
        console.error('Error en createCredito:', error);
        throw new Error(`Error al crear crédito: ${error.message}`);
    }
};

// Obtener créditos de un accionista
export const getCreditosByAccionista = async (accionistaId: number) => {
    try {
        const creditos = await prisma.credito.findMany({
            where: { 
                accionista_id: accionistaId 
            },
            include: {
                pagos: {
                    orderBy: {
                        numero_cuota: 'asc'
                    }
                }
            },
            orderBy: { 
                createdAt: 'desc' 
            }
        });

        return {
            accionista_id: accionistaId,
            creditos: creditos
        };
    } catch (error: any) {
        console.error('Error en getCreditosByAccionista:', error);
        throw new Error(`Error al obtener créditos: ${error.message}`);
    }
};

// Obtener crédito por ID
export const getCreditoById = async (creditoId: number) => {
    try {
        const credito = await prisma.credito.findUnique({
            where: { 
                id: creditoId 
            },
            include: {
                formulario: true,
                accionista: {
                    select: {
                        id: true,
                        name: true,
                        lastName: true,
                        cedula: true
                    }
                },
                pagos: {
                    orderBy: {
                        numero_cuota: 'asc'
                    }
                }
            }
        });

        if (!credito) {
            throw new Error('Crédito no encontrado');
        }

        return credito;
    } catch (error: any) {
        console.error('Error en getCreditoById:', error);
        throw new Error(`Error al obtener crédito: ${error.message}`);
    }
};