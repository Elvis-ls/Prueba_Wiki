// services/financialBalanceService.ts
import { FinancialBalanceRepository } from "../repositories/financialBalanceRepository";

export class FinancialBalanceService {
  private repository: FinancialBalanceRepository;

  constructor() {
    this.repository = new FinancialBalanceRepository();
  }

  // Obtener balances por año
  async getBalancesByYear(year: number) {
    try {
      // Primero sincronizamos los datos para asegurar que estén actualizados
      await this.syncYearData(year);
      
      // Obtenemos todos los balances del año
      const balances = await this.repository.getByYear(year);
      console.log(`Balances encontrados: ${balances.length}`);
      
      // Si no hay datos para algunos meses, los creamos con valores calculados
      const months = Array.from({ length: 12 }, (_, i) => i + 1);
      const completeBalances = await Promise.all(
        months.map(async (month) => {
          const existingBalance = balances.find(b => b.month === month);
          
          if (existingBalance) {
            return existingBalance;
          }
          
          // Si no existe, lo creamos con datos calculados
          return await this.repository.syncBalanceData(year, month);
        })
      );

      return {
        year,
        shareholderIncome: completeBalances.map(balance => ({
          name: this.getMonthName(balance.month),
          month: balance.month,
          amount: balance.totalShareholderContributions,
          isOverridden: balance.isContributionsOverridden
        })),
        creditIncome: completeBalances.map(balance => ({
          name: this.getMonthName(balance.month),
          month: balance.month,
          amount: balance.totalCreditIncome,
          isOverridden: balance.isCreditIncomeOverridden
        })),
        adminNotes: completeBalances.reduce((acc, balance) => {
          if (balance.adminNotes) {
            acc[balance.month] = balance.adminNotes;
          }
          return acc;
        }, {} as Record<number, string>)
      };
    } catch (error) {
      throw new Error(`Error al obtener balances del año ${year}: ${error}`);
    }
  }

  // Obtener resumen financiero de un año
  async getYearSummary(year: number) {
    try {
      const balances = await this.repository.getByYear(year);
      
      if (balances.length === 0) {
        // Si no hay datos, sincronizamos primero
        await this.syncYearData(year);
        const newBalances = await this.repository.getByYear(year);
        return this.calculateSummary(newBalances, year);
      }
      
      return this.calculateSummary(balances, year);
    } catch (error) {
      throw new Error(`Error al obtener resumen del año ${year}: ${error}`);
    }
  }

  // Obtener años disponibles
  async getAvailableYears() {
    try {
      const years = await this.repository.getAvailableYears();
      
      // Si no hay años, crear datos para el año actual
      if (years.length === 0) {
        const currentYear = new Date().getFullYear();
        await this.syncYearData(currentYear);
        return [currentYear];
      }
      
      return years;
    } catch (error) {
      throw new Error(`Error al obtener años disponibles: ${error}`);
    }
  }

  // Actualizar balance específico (solo admins)
  async updateBalance(year: number, month: number, data: any, adminId: number) {
    try {
      // Verificar si el balance existe, si no, crearlo
      let existingBalance = await this.repository.getByYearAndMonth(year, month);
      
      if (!existingBalance) {
        existingBalance = await this.repository.syncBalanceData(year, month);
      }

      const updateData: any = {};
      
      if (data.totalShareholderContributions !== undefined) {
        updateData.totalShareholderContributions = data.totalShareholderContributions;
        updateData.isContributionsOverridden = true;
      }
      
      if (data.totalCreditIncome !== undefined) {
        updateData.totalCreditIncome = data.totalCreditIncome;
        updateData.isCreditIncomeOverridden = true;
      }
      
      if (data.adminNotes !== undefined) {
        updateData.adminNotes = data.adminNotes;
      }

      return await this.repository.updateBalance(year, month, updateData, adminId);
    } catch (error) {
      throw new Error(`Error al actualizar balance: ${error}`);
    }
  }

  // Actualizar múltiples balances
  async updateMultipleBalances(year: number, balances: any[], adminId: number) {
    try {
      const updatedBalances = [];
      
      for (const balance of balances) {
        if (balance.month >= 1 && balance.month <= 12) {
          const updated = await this.updateBalance(
            year, 
            balance.month, 
            balance, 
            adminId
          );
          updatedBalances.push(updated);
        }
      }
      
      return updatedBalances;
    } catch (error) {
      throw new Error(`Error al actualizar múltiples balances: ${error}`);
    }
  }

  // Resetear balance a valores calculados automáticamente
  async resetToAutoCalculated(year: number, month: number, adminId: number) {
    try {
      const calculatedContributions = await this.repository.calculateTotalContributions(year, month);
      const calculatedCreditIncome = await this.repository.calculateTotalCreditIncome(year, month);
      
      const resetData = {
        totalShareholderContributions: calculatedContributions,
        isContributionsOverridden: false,
        totalCreditIncome: calculatedCreditIncome,
        isCreditIncomeOverridden: false,
        adminNotes: `Reseteado automáticamente el ${new Date().toLocaleDateString()}`
      };

      return await this.repository.updateBalance(year, month, resetData, adminId);
    } catch (error) {
      throw new Error(`Error al resetear balance: ${error}`);
    }
  }

  // Métodos privados auxiliares
  private async syncYearData(year: number) {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    
    for (const month of months) {
      await this.repository.syncBalanceData(year, month);
    }
  }

  private calculateSummary(balances: any[], year: number) {
    const totalShareholderIncome = balances.reduce((sum, balance) => 
      sum + (balance.totalShareholderContributions || 0), 0
    );
    
    const totalCreditIncome = balances.reduce((sum, balance) => 
      sum + (balance.totalCreditIncome || 0), 0
    );
    
    const netProfit = totalShareholderIncome - totalCreditIncome;

    return {
      year,
      totalShareholderIncome,
      totalCreditIncome,
      netProfit,
      monthlyBreakdown: balances.map(balance => ({
        month: balance.month,
        monthName: this.getMonthName(balance.month),
        shareholderContributions: balance.totalShareholderContributions || 0,
        creditIncome: balance.totalCreditIncome || 0,
        monthlyProfit: (balance.totalShareholderContributions || 0) - (balance.totalCreditIncome || 0)
      }))
    };
  }

  private getMonthName(month: number): string {
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return monthNames[month - 1] || "";
  }
  // Método público para debugging
  async debugYear(year: number) {
    console.log(`=== DEBUG COMPLETO PARA EL AÑO ${year} ===`);
    await this.repository.debugContributionsData(year);
    
    // Verificar balances existentes
    const existingBalances = await this.repository.getByYear(year);
    console.log(`Balances existentes en FinancialBalance: ${existingBalances.length}`);
    existingBalances.forEach(balance => {
      console.log(`  Mes ${balance.month}: Contribuciones=$${balance.totalShareholderContributions}, Sobrescrito=${balance.isContributionsOverridden}`);
    });
  }
}