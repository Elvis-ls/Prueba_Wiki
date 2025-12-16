import { prisma } from "../../prismaClient/client";

export const getEarningsByYear = async (year: number) => {
  try {
    console.log(`=== SERVICE: Obteniendo ganancias para el año ${year} ===`);
    
    let earnings = await prisma.ganancias_institucionales.findMany({
      where: { year },
      orderBy: { month: 'asc' }
    });
    
    console.log('Datos raw de la BD:', earnings);
    
    // Si no hay datos para algunos meses, crear registros vacíos
    if (earnings.length < 12) {
      console.log(`Solo se encontraron ${earnings.length} meses, creando faltantes...`);
      
      const existingMonths = earnings.map((e: any) => e.month);
      const missingMonths = Array.from({length: 12}, (_, i) => i + 1)
        .filter(month => !existingMonths.includes(month));
      
      console.log('Meses faltantes:', missingMonths);
      
      // Crear meses faltantes
      for (const month of missingMonths) {
        await prisma.ganancias_institucionales.create({
          data: {
            year,
            month,
            intereses: 0,
            creditos: 0,
            otrosIngresos: 0,
            interesesModified: false,
            creditosModified: false,
            otrosModified: false
          }
        });
      }
      
      // Obtener datos actualizados
      earnings = await prisma.ganancias_institucionales.findMany({
        where: { year },
        orderBy: { month: 'asc' }
      });
      console.log('Datos después de crear faltantes:', earnings);
    }

    // Formatear datos para el frontend
    const monthlyEarnings = earnings.map((earning: any) => ({
      month: earning.month,
      intereses: Number(earning.intereses) || 0,
      creditos: Number(earning.creditos) || 0,
      otrosIngresos: Number(earning.otrosIngresos) || 0,
    }));

    console.log('Datos formateados para el frontend:', monthlyEarnings);
    console.log(`=== SERVICE: Completado para año ${year} ===`);
    
    return monthlyEarnings;

  } catch (error) {
    console.error('Error getting earnings by year:', error);
    throw new Error('Error al obtener las ganancias del año');
  }
};

export const getYearSummary = async (year: number) => {
  try {
    const earnings = await prisma.ganancias_institucionales.findMany({
      where: { year },
      orderBy: { month: 'asc' }
    });
    
    const totalIntereses = earnings.reduce((sum, item) => sum + Number(item.intereses), 0);
    const totalCreditos = earnings.reduce((sum, item) => sum + Number(item.creditos), 0);
    const totalOtrosIngresos = earnings.reduce((sum, item) => sum + Number(item.otrosIngresos), 0);
    const totalAnual = totalIntereses + totalCreditos + totalOtrosIngresos;

    return {
      year,
      totalAnual,
      totalIntereses,
      totalCreditos,
      totalOtrosIngresos,
      monthlyData: earnings.map(item => ({
        month: item.month,
        intereses: Number(item.intereses),
        creditos: Number(item.creditos),
        otros: Number(item.otrosIngresos),
        total: Number(item.intereses) + Number(item.creditos) + Number(item.otrosIngresos),
        lastModified: item.lastModifiedAt
      }))
    };
  } catch (error) {
    console.error('Error getting year summary:', error);
    throw new Error('Error al obtener el resumen del año');
  }
};

export const getAvailableYears = async () => {
  try {
    const result = await prisma.ganancias_institucionales.findMany({
      select: { year: true },
      distinct: ['year'],
      orderBy: { year: 'desc' }
    });

    const years = result.map(item => item.year);
    
    // Si no hay años, agregar el año actual
    if (years.length === 0) {
      const currentYear = new Date().getFullYear();
      // Crear datos iniciales para el año actual
      for (let month = 1; month <= 12; month++) {
        await prisma.ganancias_institucionales.create({
          data: {
            year: currentYear,
            month,
            intereses: 0,
            creditos: 0,
            otrosIngresos: 0
          }
        });
      }
      return [currentYear];
    }
    
    return years;
  } catch (error) {
    console.error('Error getting available years:', error);
    throw new Error('Error al obtener los años disponibles');
  }
};

export const updateEarnings = async (
  year: number, 
  month: number, 
  data: {
    intereses?: number;
    creditos?: number;
    otrosIngresos?: number;
  }
) => {
  try {
    return await prisma.ganancias_institucionales.update({
      where: {
        year_month: { year, month }
      },
      data: {
        intereses: data.intereses,
        creditos: data.creditos,
        otrosIngresos: data.otrosIngresos,
        interesesModified: true,
        creditosModified: true,
        otrosModified: true,
        updatedAt: new Date(),
        lastModifiedAt: new Date(),
      }
    });
  } catch (error) {
    console.error('Error updating earnings:', error);
    throw new Error('Error al actualizar las ganancias');
  }
};

export const updateMultipleEarnings = async (
  year: number, 
  earningsData: Array<{
    month: number;
    intereses: number;
    creditos: number;
    otrosIngresos: number;
  }>
) => {
  try {
    const updatePromises = earningsData.map(monthData => 
      prisma.ganancias_institucionales.upsert({
        where: {
          year_month: { year, month: monthData.month }
        },
        update: {
          intereses: monthData.intereses,
          creditos: monthData.creditos,
          otrosIngresos: monthData.otrosIngresos,
          interesesModified: true,
          creditosModified: true,
          otrosModified: true,
          updatedAt: new Date(),
          lastModifiedAt: new Date(),
        },
        create: {
          year,
          month: monthData.month,
          intereses: monthData.intereses,
          creditos: monthData.creditos,
          otrosIngresos: monthData.otrosIngresos,
          interesesModified: true,
          creditosModified: true,
          otrosModified: true,
        }
      })
    );

    return await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error updating multiple earnings:', error);
    throw new Error('Error al actualizar las ganancias múltiples');
  }
};

export const resetToAutoCalculated = async (year: number, month: number) => {
  try {
    return await prisma.ganancias_institucionales.update({
      where: {
        year_month: { year, month }
      },
      data: {
        intereses: 0,
        creditos: 0,
        otrosIngresos: 0,
        interesesModified: false,
        creditosModified: false,
        otrosModified: false,
        updatedAt: new Date(),
        lastModifiedAt: new Date(),
      }
    });
  } catch (error) {
    console.error('Error resetting to auto calculated:', error);
    throw new Error('Error al resetear a valores automáticos');
  }
};

export const syncYearData = async (year: number) => {
  try {
    const syncPromises = [];
    for (let month = 1; month <= 12; month++) {
      syncPromises.push(
        prisma.ganancias_institucionales.upsert({
          where: {
            year_month: { year, month }
          },
          update: {
            updatedAt: new Date()
          },
          create: {
            year,
            month,
            intereses: 0,
            creditos: 0,
            otrosIngresos: 0
          }
        })
      );
    }
    
    await Promise.all(syncPromises);
    return await getEarningsByYear(year);
  } catch (error) {
    console.error('Error syncing year data:', error);
    throw new Error('Error al sincronizar los datos del año');
  }
};
