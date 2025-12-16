// Agregar esta nueva función al final del archivo shareholdersService.ts

// Verificar si un accionista tiene 6 meses de antigüedad
export const checkSixMonthsAntiquity = async (shareholderId: number) => {
  try {
    const shareholder = await prisma.lista_accionista.findUnique({
      where: { 
        id: shareholderId,
        activo: true  // Solo verificar accionistas activos
      },
      select: {
        id: true,
        fechaIngreso: true
      }
    });

    if (!shareholder) {
      throw new Error('Accionista no encontrado o inactivo');
    }

    // Calcular la fecha de hace 6 meses
    const fechaActual = new Date();
    const fechaSeisMesesAtras = new Date();
    fechaSeisMesesAtras.setMonth(fechaActual.getMonth() - 6);

    // Verificar si la fecha de ingreso es anterior a hace 6 meses
    const tiene6meses = shareholder.fechaIngreso <= fechaSeisMesesAtras;

    // Calcular días exactos de antigüedad (opcional para debugging)
    const tiempoTranscurrido = fechaActual.getTime() - shareholder.fechaIngreso.getTime();
    const diasTranscurridos = Math.floor(tiempoTranscurrido / (1000 * 60 * 60 * 24));

    return {
      id: shareholder.id,
      tiene6meses: tiene6meses,
      fechaIngreso: shareholder.fechaIngreso,
      diasTranscurridos: diasTranscurridos,
      fechaVerificacion: fechaActual
    };

  } catch (error: any) {
    console.error('Error al verificar antigüedad de 6 meses:', error);
    throw error;
  }
};