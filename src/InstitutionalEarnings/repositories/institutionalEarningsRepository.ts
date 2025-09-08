// repositories/institutionalEarningsRepository.ts
import { prisma } from "../../prismaClient/client";


export class InstitutionalEarningsRepository {
  
  // Obtener ganancias por año
  async getByYear(year: number) {
    return await prisma.institutionalEarnings.findMany({
      where: { year },
      orderBy: { month: 'asc' }
    });
  }

  // Obtener ganancia específica por año y mes
  async getByYearAndMonth(year: number, month: number) {
    return await prisma.institutionalEarnings.findUnique({
      where: {
        year_month: { year, month }
      }
    });
  }

  // Crear o actualizar ganancias
  async upsertEarnings(data: any) {
    const updateData = {
      ...data,
      updatedAt: new Date(),
      lastModifiedAt: new Date(),
    };

    return await prisma.institutionalEarnings.upsert({
      where: {
        year_month: { year: data.year, month: data.month }
      },
      update: updateData,
      create: {
        year: data.year,
        month: data.month,
        intereses: data.intereses || 0,
        creditos: data.creditos || 0,
        otrosIngresos: data.otrosIngresos || 0,
        interesesModified: data.interesesModified || false,
        creditosModified: data.creditosModified || false,
        otrosModified: data.otrosModified || false,
      }
    });
  }

  // Actualizar ganancias específicas (solo para admins)
  async updateEarnings(year: number, month: number, data: any) {
    return await prisma.institutionalEarnings.update({
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
  }

  // Actualizar múltiples ganancias para un año
  async updateMultipleEarnings(year: number, earningsData: any[]) {
    const updatePromises = earningsData.map(monthData => 
      this.upsertEarnings({
        year,
        month: monthData.month,
        intereses: monthData.intereses,
        creditos: monthData.creditos,
        otrosIngresos: monthData.otrosIngresos,
        interesesModified: true,
        creditosModified: true,
        otrosModified: true,
      })
    );

    return await Promise.all(updatePromises);
  }

  // Calcular ganancias automáticas por intereses (puedes personalizar esta lógica)
  async calculateAutoInterests(year: number, month: number) {
    try {
      // Ejemplo: calcular intereses basados en créditos pendientes
      // Esta es una lógica de ejemplo que debes ajustar según tu negocio
      const result = await prisma.creditForm.aggregate({
        where: {
          fechaEmision: {
            contains: `${month.toString().padStart(2, '0')}/${year}`
          }
        },
        _sum: {
          montoCredito: true
        }
      });

      // Ejemplo: 3% de interés mensual sobre créditos otorgados
      return (result._sum.montoCredito || 0) * 0.03;
    } catch (error) {
      console.error('Error calculating auto interests:', error);
      return 0;
    }
  }

  // Calcular ganancias automáticas por créditos
  async calculateAutoCredits(year: number, month: number) {
    try {
      // Ejemplo: comisiones por créditos otorgados
      const result = await prisma.creditForm.aggregate({
        where: {
          fechaEmision: {
            contains: `${month.toString().padStart(2, '0')}/${year}`
          }
        },
        _sum: {
          montoCredito: true
        }
      });

      // Ejemplo: 2% de comisión sobre créditos otorgados
      return (result._sum.montoCredito || 0) * 0.02;
    } catch (error) {
      console.error('Error calculating auto credits:', error);
      return 0;
    }
  }

  // Calcular otros ingresos automáticos
  async calculateAutoOtherIncome(year: number, month: number) {
    try {
      // Ejemplo: ingresos por contribuciones de accionistas
      const result = await prisma.montoContribution.aggregate({
        where: {
          year,
          month,
          status: 'Aprobado'
        },
        _sum: {
          amountToPay: true
        }
      });

      // Ejemplo: 1% de las contribuciones como otros ingresos
      return (result._sum.amountToPay || 0) * 0.01;
    } catch (error) {
      console.error('Error calculating auto other income:', error);
      return 0;
    }
  }

  // Sincronizar datos automáticos con ganancias existentes
  async syncEarningsData(year: number, month: number) {
    const calculatedInterests = await this.calculateAutoInterests(year, month);
    const calculatedCredits = await this.calculateAutoCredits(year, month);
    const calculatedOtherIncome = await this.calculateAutoOtherIncome(year, month);

    const existingEarnings = await this.getByYearAndMonth(year, month);

    const earningsData = {
      year,
      month,
      intereses: existingEarnings?.interesesModified 
        ? existingEarnings.intereses 
        : calculatedInterests,
      creditos: existingEarnings?.creditosModified 
        ? existingEarnings.creditos 
        : calculatedCredits,
      otrosIngresos: existingEarnings?.otrosModified 
        ? existingEarnings.otrosIngresos 
        : calculatedOtherIncome,
      interesesModified: existingEarnings?.interesesModified || false,
      creditosModified: existingEarnings?.creditosModified || false,
      otrosModified: existingEarnings?.otrosModified || false,
    };

    return await this.upsertEarnings(earningsData);
  }

  // Obtener todos los años disponibles
  async getAvailableYears() {
    const result = await prisma.institutionalEarnings.findMany({
      select: { year: true },
      distinct: ['year'],
      orderBy: { year: 'desc' }
    });

    return result.map(item => item.year);
  }

  // Resetear a valores calculados automáticamente
  async resetToAutoCalculated(year: number, month: number) {
    const calculatedInterests = await this.calculateAutoInterests(year, month);
    const calculatedCredits = await this.calculateAutoCredits(year, month);
    const calculatedOtherIncome = await this.calculateAutoOtherIncome(year, month);

    return await this.upsertEarnings({
      year,
      month,
      intereses: calculatedInterests,
      creditos: calculatedCredits,
      otrosIngresos: calculatedOtherIncome,
      interesesModified: false,
      creditosModified: false,
      otrosModified: false,
    });
  }

  // Obtener resumen anual
  async getYearSummary(year: number) {
    const earnings = await this.getByYear(year);
    
    const totalIntereses = earnings.reduce((sum, item) => sum + item.intereses, 0);
    const totalCreditos = earnings.reduce((sum, item) => sum + item.creditos, 0);
    const totalOtrosIngresos = earnings.reduce((sum, item) => sum + item.otrosIngresos, 0);
    const totalAnual = totalIntereses + totalCreditos + totalOtrosIngresos;

    return {
      year,
      totalAnual,
      totalIntereses,
      totalCreditos,
      totalOtrosIngresos,
      monthlyData: earnings.map(item => ({
        month: item.month,
        intereses: item.intereses,
        creditos: item.creditos,
        otros: item.otrosIngresos,
        total: item.intereses + item.creditos + item.otrosIngresos,
        lastModified: item.lastModifiedAt
      }))
    };
  }
}