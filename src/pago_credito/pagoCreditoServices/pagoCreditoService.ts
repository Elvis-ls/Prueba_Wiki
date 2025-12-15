import { prisma } from '../../prismaClient/client';

interface RegistrarPagoData {
    credito_id: number;
    numero_cuota: number;
    monto_pagado: number;
    fecha_pago: string;
}

// Registrar un pago
export const registrarPago = async (data: RegistrarPagoData) => {
    try {
        const pago = await prisma.pago_credito.update({
            where: {
                credito_id_numero_cuota: {
                    credito_id: data.credito_id,
                    numero_cuota: data.numero_cuota
                }
            },
            data: {
                monto_pagado: data.monto_pagado,
                fecha_pago: new Date(data.fecha_pago),
                estado: 'Pagado'
            }
        });

        return pago;
    } catch (error: any) {
        console.error('Error en registrarPago:', error);
        throw new Error(`Error al registrar pago: ${error.message}`);
    }
};

// Obtener pagos de un crédito
export const getPagosByCredito = async (creditoId: number) => {
    try {
        const pagos = await prisma.pago_credito.findMany({
            where: { 
                credito_id: creditoId 
            },
            orderBy: { 
                numero_cuota: 'asc' 
            }
        });

        return pagos;
    } catch (error: any) {
        console.error('Error en getPagosByCredito:', error);
        throw new Error(`Error al obtener pagos: ${error.message}`);
    }
};

// Obtener estado de pagos de un accionista
export const getEstadoPagosAccionista = async (accionistaId: number) => {
    try {
        // Obtener todos los créditos del accionista con sus pagos
        const creditos = await prisma.credito.findMany({
            where: { 
                accionista_id: accionistaId 
            },
            include: {
                pagos: {
                    where: {
                        estado: {
                            in: ['Pendiente', 'Vencido']
                        }
                    },
                    orderBy: {
                        fecha_vencimiento: 'asc'
                    }
                }
            }
        });

        // Verificar si tiene pagos vencidos o pendientes atrasados
        const fechaActual = new Date();
        let alDiaCreditos = true;

        for (const credito of creditos) {
            for (const pago of credito.pagos) {
                if (pago.estado === 'Vencido' || (pago.estado === 'Pendiente' && pago.fecha_vencimiento < fechaActual)) {
                    alDiaCreditos = false;
                    break;
                }
            }
            if (!alDiaCreditos) break;
        }

        return {
            accionista_id: accionistaId,
            alDiaCreditos: alDiaCreditos
        };
    } catch (error: any) {
        console.error('Error en getEstadoPagosAccionista:', error);
        throw new Error(`Error al obtener estado de pagos: ${error.message}`);
    }
};