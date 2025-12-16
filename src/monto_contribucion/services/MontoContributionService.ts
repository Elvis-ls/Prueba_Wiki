import { prisma } from '../../prismaClient/client';

// 1. OBTENER ID DE MONTO_CONTRIBUCION
export const obtenerIdMontoContribucion = async (
  accionista_id: number,
  anio: number,
  mes: number
) => {
  const montoContribucion = await prisma.monto_contribucion.findFirst({
    where: {
      accionista_id,
      anio,
      mes
    },
    select: {
      id: true,
      cantidad_pagar: true,
      cantidad_pagada: true,
      pagado: true,
      estado_id: true
    }
  });

  if (!montoContribucion) {
    throw new Error(`No se encontró registro para el accionista ${accionista_id} en ${mes}/${anio}`);
  }

  return montoContribucion;
};

// 2. AGREGAR PAGO MENSUAL (ACCIONISTA)

export const agregarPagoMensual = async ({
  monto_id,
  fecha_aporte,
  cantidad_pagada,
  voucher,
  voucher_tipo
}: {
  monto_id: number;
  fecha_aporte: Date;
  cantidad_pagada: number;
  voucher: Buffer;
  voucher_tipo: string;
}) => {
  // Verificar que el monto_contribucion existe
  const montoContribucion = await prisma.monto_contribucion.findUnique({
    where: { id: monto_id }
  });

  if (!montoContribucion) {
    throw new Error("El registro de monto_contribucion no existe");
  }

  // Contar cuántos pagos ya existen
  const cantidadPagos = await prisma.aportaciones_mensuales.count({
    where: { monto_id }
  });

  if (cantidadPagos >= 4) {
    throw {
      code: "MAX_PAGOS",
      message: "Ya se alcanzó el máximo de 4 pagos para este mes"
    };
  }

  // Crear el pago (sin estado_id porque no existe en producción)
  const nuevoPago = await prisma.aportaciones_mensuales.create({
    data: {
      monto_id,
      fecha_aporte,
      aporte: cantidad_pagada,
      cantidad_pagada: 0, // Se actualiza cuando se aprueba
      mes: montoContribucion.mes,
      voucher,
      voucher_tipo
    }
  });

  return nuevoPago;
};

// ============================================
// 3. VER MONTO_CONTRIBUCION CON SUS PAGOS (ACCIONISTA/ADMIN)
// ============================================
export const obtenerMontoContribucionConPagos = async (accionista_id: number) => {
  const montosContribucion = await prisma.monto_contribucion.findMany({
    where: { accionista_id },
    include: {
      aportaciones_mensuales: {
        select: {
          id: true,
          fecha_aporte: true,
          aporte: true,
          cantidad_pagada: true,
          pagadoEn: true,
          voucher_tipo: true,
          mes: true,
          monto_id: true
          // REMOVIDOS: comentario, estado_id, estado (no existen en producción)
        },
        orderBy: { fecha_aporte: 'asc' }
      },
      estado: true,
      accionista: {
        select: {
          id: true,
          name: true,
          lastName: true,
          email: true
        }
      }
    },
    orderBy: [
      { anio: 'desc' },
      { mes: 'desc' }
    ]
  });

  // Procesar cada monto y calcular totales
  const montosConCalculos = montosContribucion.map(monto => {
    const totalAportado = monto.aportaciones_mensuales.reduce(
      (sum, p) => sum + Number(p.aporte),
      0
    );

    const totalAprobado = monto.aportaciones_mensuales.reduce(
      (sum, p) => sum + Number(p.cantidad_pagada),
      0
    );

    // Como no hay estado_id aún, todos los pagos se consideran según cantidad_pagada
    const pagosPendientes = monto.aportaciones_mensuales.filter(p => Number(p.cantidad_pagada) === 0).length;
    const pagosAprobados = monto.aportaciones_mensuales.filter(p => Number(p.cantidad_pagada) > 0).length;

    return {
      ...monto,
      totalAportado,
      totalAprobado,
      pendiente: Number(monto.cantidad_pagar) - totalAprobado,
      progreso: (totalAprobado / Number(monto.cantidad_pagar)) * 100,
      estadisticasPagos: {
        total: monto.aportaciones_mensuales.length,
        pendientes: pagosPendientes,
        aprobados: pagosAprobados,
        rechazados: 0 // No hay rechazados sin estado_id
      }
    };
  });

  // Agrupar por año y calcular totales anuales
  const montosPorAnio: Record<number, any[]> = {};
  const totalesAnuales: Record<number, number> = {};

  montosConCalculos.forEach(monto => {
    if (!montosPorAnio[monto.anio]) {
      montosPorAnio[monto.anio] = [];
      totalesAnuales[monto.anio] = 0;
    }
    montosPorAnio[monto.anio].push(monto);
    totalesAnuales[monto.anio] += monto.totalAprobado;
  });

  // Construir respuesta agrupada por año
  const resultado = Object.keys(montosPorAnio)
    .map(anio => ({
      anio: Number(anio),
      totalAprobadoAnual: totalesAnuales[Number(anio)],
      meses: montosPorAnio[Number(anio)]
    }))
    .sort((a, b) => b.anio - a.anio); // Ordenar por año descendente

  return resultado;
};

// ============================================
// 4. APROBAR/RECHAZAR UN PAGO (ADMIN)
// ============================================
export const aprobarRechazarPago = async (
  pago_id: number,
  aprobar: boolean,
  comentario?: string
) => {
  const pago = await prisma.aportaciones_mensuales.findUnique({
    where: { id: pago_id },
    include: {
      monto_contribucion: true
    }
  });

  if (!pago) {
    throw new Error("El pago no existe");
  }

  // Actualizar el pago (sin estado_id y sin comentario porque no existen en producción)
  const pagoActualizado = await prisma.aportaciones_mensuales.update({
    where: { id: pago_id },
    data: {
      cantidad_pagada: aprobar ? pago.aporte : 0,
      pagadoEn: aprobar ? new Date() : null
      // REMOVIDO: estado_id, comentario (no existen en producción)
    }
  });

  // Recalcular el total pagado del monto_contribucion
  const todosPagos = await prisma.aportaciones_mensuales.findMany({
    where: { monto_id: pago.monto_id }
  });

  const totalAprobado = todosPagos.reduce((sum, p) => {
    if (p.id === pago_id) {
      return sum + (aprobar ? Number(pago.aporte) : 0);
    }
    return sum + Number(p.cantidad_pagada);
  }, 0);

  const totalEsperado = Number(pago.monto_contribucion.cantidad_pagar);
  const estaCompleto = totalAprobado >= totalEsperado;

  // Actualizar el monto_contribucion
  await prisma.monto_contribucion.update({
    where: { id: pago.monto_id },
    data: {
      cantidad_pagada: totalAprobado,
      pagado: estaCompleto,
      pagadoEn: estaCompleto ? new Date() : null,
      comentario: comentario || pago.monto_contribucion.comentario
    }
  });

  return {
    pago: pagoActualizado,
    totalAprobado,
    estaCompleto,
    mensaje: aprobar 
      ? `Pago aprobado. Total aprobado: ${totalAprobado}/${totalEsperado}`
      : "Pago rechazado"
  };
};

// ============================================
// 5. AGREGAR COMENTARIO A MONTO_CONTRIBUCION (ADMIN)
// ============================================
export const agregarComentarioMontoContribucion = async (
  monto_id: number,
  comentario: string
) => {
  const montoActualizado = await prisma.monto_contribucion.update({
    where: { id: monto_id },
    data: { comentario }
  });

  return montoActualizado;
};

// ============================================
// 6. OBTENER VOUCHER DE UN PAGO (ADMIN)
// ============================================
export const obtenerVoucherPago = async (pago_id: number) => {
  const pago = await prisma.aportaciones_mensuales.findUnique({
    where: { id: pago_id },
    select: {
      voucher: true,
      voucher_tipo: true
    }
  });

  if (!pago || !pago.voucher) {
    throw new Error("Voucher no encontrado");
  }

  return pago;
};