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

// ============================================
// FILE: institutionalEarningsController.ts
// ============================================
import { Request, Response } from "express";
import * as institutionalEarningsService from "../services/institutionalEarningsService";

// Obtener ganancias por año (usuarios y admins)
export const getEarningsByYearController = async (req: Request, res: Response): Promise<void> => {
  try {
    const year = parseInt(req.query.year as string);
    
    if (isNaN(year) || year < 2020 || year > 2050) {
      res.status(400).json({ 
        success: false,
        error: 'Año inválido. Debe estar entre 2020 y 2050' 
      });
      return;
    }
    
    const earnings = await institutionalEarningsService.getEarningsByYear(year);
    
    res.json({ 
      success: true,
      data: earnings,
      year 
    });
  } catch (error: any) {
    console.error('Error en controller getEarningsByYear:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Error al obtener las ganancias institucionales" 
    });
  }
};

// Obtener resumen financiero de un año (usuarios y admins)
export const getYearSummaryController = async (req: Request, res: Response): Promise<void> => {
  try {
    const year = parseInt(req.query.year as string);
    
    if (isNaN(year) || year < 2020 || year > 2050) {
      res.status(400).json({ 
        success: false,
        error: 'Año inválido' 
      });
      return;
    }
    
    const summary = await institutionalEarningsService.getYearSummary(year);
    
    res.json({ 
      success: true,
      data: summary 
    });
  } catch (error: any) {
    console.error('Error en controller getYearSummary:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Error al obtener el resumen de ganancias" 
    });
  }
};

// Obtener años disponibles (usuarios y admins)
export const getAvailableYearsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const years = await institutionalEarningsService.getAvailableYears();
    
    res.json({ 
      success: true,
      data: years 
    });
  } catch (error: any) {
    console.error('Error en controller getAvailableYears:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Error al obtener los años disponibles" 
    });
  }
};

// Actualizar ganancias específicas (solo admins)
export const updateEarningsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      res.status(400).json({ 
        success: false,
        error: 'Año o mes inválido' 
      });
      return;
    }

    const { intereses, creditos, otrosIngresos } = req.body;

    if (intereses === undefined || creditos === undefined || otrosIngresos === undefined) {
      res.status(400).json({ 
        success: false,
        error: 'Faltan campos requeridos: intereses, creditos, otrosIngresos' 
      });
      return;
    }
    
    const updatedEarnings = await institutionalEarningsService.updateEarnings(year, month, {
      intereses: Number(intereses),
      creditos: Number(creditos),
      otrosIngresos: Number(otrosIngresos)
    });
    
    res.json({ 
      success: true,
      message: 'Ganancias actualizadas correctamente',
      data: updatedEarnings 
    });
  } catch (error: any) {
    console.error('Error en controller updateEarnings:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Error al actualizar las ganancias" 
    });
  }
};

// Actualizar múltiples ganancias (solo admins)
export const updateMultipleEarningsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const year = parseInt(req.params.year);

    if (isNaN(year)) {
      res.status(400).json({ 
        success: false,
        error: 'Año inválido' 
      });
      return;
    }

    const { earnings } = req.body;

    if (!Array.isArray(earnings) || earnings.length === 0) {
      res.status(400).json({ 
        success: false,
        error: 'El campo earnings debe ser un array no vacío' 
      });
      return;
    }

    // Validar cada elemento del array
    for (const earning of earnings) {
      if (!earning.month || earning.month < 1 || earning.month > 12) {
        res.status(400).json({ 
          success: false,
          error: `Mes inválido en uno de los registros: ${earning.month}` 
        });
        return;
      }
    }
    
    const updatedEarnings = await institutionalEarningsService.updateMultipleEarnings(year, earnings);
    
    res.json({ 
      success: true,
      message: 'Ganancias actualizadas correctamente',
      data: updatedEarnings 
    });
  } catch (error: any) {
    console.error('Error en controller updateMultipleEarnings:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Error al actualizar las ganancias múltiples" 
    });
  }
};

// Resetear ganancias a valores calculados automáticamente (solo admins)
export const resetToAutoCalculatedController = async (req: Request, res: Response): Promise<void> => {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      res.status(400).json({ 
        success: false,
        error: 'Año o mes inválido' 
      });
      return;
    }

    const resetEarnings = await institutionalEarningsService.resetToAutoCalculated(year, month);
    
    res.json({ 
      success: true,
      message: 'Ganancias reseteadas a valores calculados automáticamente',
      data: resetEarnings 
    });
  } catch (error: any) {
    console.error('Error en controller resetToAutoCalculated:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Error al resetear las ganancias" 
    });
  }
};

// Sincronizar datos de un año completo (solo admins)
export const syncYearDataController = async (req: Request, res: Response): Promise<void> => {
  try {
    const year = parseInt(req.params.year);

    if (isNaN(year)) {
      res.status(400).json({ 
        success: false,
        error: 'Año inválido' 
      });
      return;
    }

    const syncedData = await institutionalEarningsService.syncYearData(year);
    
    res.json({ 
      success: true,
      message: 'Datos sincronizados correctamente',
      data: syncedData 
    });
  } catch (error: any) {
    console.error('Error en controller syncYearData:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Error al sincronizar los datos" 
    });
  }
};