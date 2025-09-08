// repositories/financialBalanceRepository.ts
import { prisma } from "../../prismaClient/client";

export class FinancialBalanceRepository {
  // Obtener balances por año
  async getByYear(year: number) {
    return await prisma.financialBalance.findMany({
      where: { year },
      orderBy: { month: 'asc' }
    });
  }

  // Obtener balance específico por año y mes
  async getByYearAndMonth(year: number, month: number) {
    return await prisma.financialBalance.findUnique({
      where: {
        year_month: { year, month }
      }
    });
  }

  // Crear o actualizar balance
  async upsertBalance(data: any, adminId?: number) {
    const updateData = {
      ...data,
      lastModifiedAt: new Date(),
      lastModifiedById: adminId,
    };

    return await prisma.financialBalance.upsert({
      where: {
        year_month: { year: data.year, month: data.month }
      },
      update: updateData,
      create: {
        year: data.year,
        month: data.month,
        totalShareholderContributions: data.totalShareholderContributions || 0,
        isContributionsOverridden: data.isContributionsOverridden || false,
        totalCreditIncome: data.totalCreditIncome || 0,
        isCreditIncomeOverridden: data.isCreditIncomeOverridden || false,
        adminNotes: data.adminNotes || null,
        lastModifiedAt: new Date(),
        lastModifiedById: adminId,
      }
    });
  }

  // Actualizar balance específico (solo para admins)
  async updateBalance(year: number, month: number, data: any, adminId: number) {
    return await prisma.financialBalance.update({
      where: {
        year_month: { year, month }
      },
      data: {
        ...data,
        lastModifiedAt: new Date(),
        lastModifiedById: adminId,
      }
    });
  }

  async calculateTotalContributions(year: number, month: number) {
  try {
    console.log(`Calculando contribuciones para año: ${year}, mes: ${month}`);
    
    // Primero obtenemos todas las contribuciones para debug
    const allContributions = await prisma.montoContribution.findMany({
      where: {
        year,
        month,
        status: 'Aprobado' // Solo contar contribuciones aprobadas
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true
          }
        }
      }
    });
    
    console.log(`Contribuciones aprobadas encontradas para ${month}/${year}:`, allContributions);
    
    // AQUÍ ESTÁ EL CAMBIO PRINCIPAL: usar amountToPay en lugar de amountPaid
    const result = await prisma.montoContribution.aggregate({
      where: {
        year,
        month,
        status: 'Aprobado' // Solo contar contribuciones aprobadas
      },
      _sum: {
        amountToPay: true  // CAMBIO: amountToPay en lugar de amountPaid
      }
    });
    
    console.log(`Resultado del aggregate para ${month}/${year}:`, result);
    const total = result._sum.amountToPay || 0;
    console.log(`Total calculado para ${month}/${year}:`, total);
    
    return total;
  } catch (error) {
    console.error('Error calculating total contributions:', error);
    return 0;
  }
}

  // Calcular ingresos totales de créditos por año y mes
  async calculateTotalCreditIncome(year: number, month: number) {
    try {
      // Como mencionas que no tienes tabla de pagos de crédito,
      // por ahora devolvemos 0 o puedes implementar una lógica básica
      // basada en los créditos creados en ese mes
      
      const result = await prisma.creditForm.aggregate({
        where: {
          fechaEmision: {
            contains: `${month.toString().padStart(2, '0')}/${year}` // Asumiendo formato MM/YYYY
          }
        },
        _sum: {
          montoCredito: true
        }
      });

      // Por ahora calculamos un 5% de interés mensual como ejemplo
      // Esto deberías ajustarlo según tu lógica de negocio
      return (result._sum.montoCredito || 0) * 0.05;
    } catch (error) {
      console.error('Error calculating total credit income:', error);
      return 0;
    }
  }

  // Sincronizar datos automáticos con balances
  async syncBalanceData(year: number, month: number) {
    const calculatedContributions = await this.calculateTotalContributions(year, month);
    const calculatedCreditIncome = await this.calculateTotalCreditIncome(year, month);

    const existingBalance = await this.getByYearAndMonth(year, month);

    const balanceData = {
      year,
      month,
      totalShareholderContributions: existingBalance?.isContributionsOverridden 
        ? existingBalance.totalShareholderContributions 
        : calculatedContributions,
      isContributionsOverridden: existingBalance?.isContributionsOverridden || false,
      totalCreditIncome: existingBalance?.isCreditIncomeOverridden 
        ? existingBalance.totalCreditIncome 
        : calculatedCreditIncome,
      isCreditIncomeOverridden: existingBalance?.isCreditIncomeOverridden || false,
      adminNotes: existingBalance?.adminNotes,
    };

    return await this.upsertBalance(balanceData);
  }

  // Obtener todos los años disponibles
  async getAvailableYears() {
    const result = await prisma.financialBalance.findMany({
      select: { year: true },
      distinct: ['year'],
      orderBy: { year: 'desc' }
    });

    return result.map(item => item.year);
  }

  // Método auxiliar para obtener contribuciones por usuario en un mes específico
  async getContributionsByUserAndMonth(year: number, month: number) {
    return await prisma.montoContribution.findMany({
      where: {
        year,
        month,
        status: 'Aprobado'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            cedula: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // Método auxiliar para obtener créditos por mes
  async getCreditsByMonth(year: number, month: number) {
    const monthStr = month.toString().padStart(2, '0');
    const searchPattern = `${monthStr}/${year}`;

    return await prisma.creditForm.findMany({
      where: {
        fechaEmision: {
          contains: searchPattern
        }
      },
      orderBy: {
        creadoEn: 'desc'
      }
    });
  }
  // Método de debug para verificar datos en la base de datos
  async debugContributionsData(year: number) {
    console.log(`=== DEBUG: Verificando datos de contribuciones para el año ${year} ===`);
    
    try {
      // Obtener todas las contribuciones del año
      const allContributions = await prisma.montoContribution.findMany({
        where: { year },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              lastName: true
            }
          }
        },
        orderBy: [
          { month: 'asc' },
          { userId: 'asc' }
        ]
      });
      
      console.log(`Total de contribuciones encontradas para ${year}: ${allContributions.length}`);
      
      // Agrupar por mes y mostrar resumen
      const monthlyGrouped = allContributions.reduce((acc, contrib) => {
        if (!acc[contrib.month]) {
          acc[contrib.month] = [];
        }
        acc[contrib.month].push(contrib);
        return acc;
      }, {} as Record<number, any[]>);
      
      Object.entries(monthlyGrouped).forEach(([month, contributions]) => {
        const approvedContributions = contributions.filter(c => c.status === 'Aprobado');
        const totalApproved = approvedContributions.reduce((sum, c) => sum + (c.amountPaid || 0), 0);
        
        console.log(`Mes ${month}: ${contributions.length} contribuciones totales, ${approvedContributions.length} aprobadas, Total: $${totalApproved}`);
        approvedContributions.forEach(c => {
          console.log(`  - Usuario: ${c.user.name} ${c.user.lastName}, Monto: $${c.amountPaid}, Estado: ${c.status}`);
        });
      });
      
    } catch (error) {
      console.error('Error en debug de contribuciones:', error);
    }
  }
}