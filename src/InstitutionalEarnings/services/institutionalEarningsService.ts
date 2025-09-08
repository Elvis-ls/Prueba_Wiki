// services/institutionalEarningsService.ts
import { InstitutionalEarningsRepository } from "../repositories/institutionalEarningsRepository";

export class InstitutionalEarningsService {
  private repository: InstitutionalEarningsRepository;

  constructor() {
    this.repository = new InstitutionalEarningsRepository();
  }

  // Obtener ganancias por año (para usuarios y admins)
  async getEarningsByYear(year: number) {
    try {
      console.log(`=== SERVICE: Obteniendo ganancias para el año ${year} ===`);
      
      let earnings = await this.repository.getByYear(year);
      console.log('Datos raw del repository:', earnings);
      
      // Si no hay datos para algunos meses, sincronizar automáticamente
      if (earnings.length < 12) {
        console.log(`Solo se encontraron ${earnings.length} meses, sincronizando faltantes...`);
        
        const existingMonths = earnings.map(e => e.month);
        const missingMonths = Array.from({length: 12}, (_, i) => i + 1)
          .filter(month => !existingMonths.includes(month));
        
        console.log('Meses faltantes:', missingMonths);
        
        // Sincronizar meses faltantes
        for (const month of missingMonths) {
          await this.repository.syncEarningsData(year, month);
        }
        
        // Obtener datos actualizados
        earnings = await this.repository.getByYear(year);
        console.log('Datos después de sincronización:', earnings);
      }

      // CAMBIO IMPORTANTE: Devolver array directo en lugar de objeto estructurado
      // El frontend espera un array de objetos mensuales
      const monthlyEarnings = earnings.map(earning => ({
        month: earning.month,
        intereses: Number(earning.intereses) || 0,
        creditos: Number(earning.creditos) || 0,
        otrosIngresos: Number(earning.otrosIngresos) || 0,
        
      }));

      console.log('Datos formateados para el frontend:', monthlyEarnings);
      console.log(`=== SERVICE: Completado para año ${year} ===`);
      
      // Devolver el array directo que espera el frontend
      return monthlyEarnings;

    } catch (error) {
      console.error('Error getting earnings by year:', error);
      throw new Error('Error al obtener las ganancias del año');
    }
  }

  // Obtener resumen de un año específico
  async getYearSummary(year: number) {
    try {
      return await this.repository.getYearSummary(year);
    } catch (error) {
      console.error('Error getting year summary:', error);
      throw new Error('Error al obtener el resumen del año');
    }
  }

  // Obtener años disponibles
  async getAvailableYears() {
    try {
      const years = await this.repository.getAvailableYears();
      
      // Si no hay años, agregar el año actual
      if (years.length === 0) {
        const currentYear = new Date().getFullYear();
        // Crear datos iniciales para el año actual
        for (let month = 1; month <= 12; month++) {
          await this.repository.syncEarningsData(currentYear, month);
        }
        return [currentYear];
      }
      
      return years;
    } catch (error) {
      console.error('Error getting available years:', error);
      throw new Error('Error al obtener los años disponibles');
    }
  }

  // Actualizar ganancias específicas (solo admins)
  async updateEarnings(year: number, month: number, data: any) {
    try {
      return await this.repository.updateEarnings(year, month, data);
    } catch (error) {
      console.error('Error updating earnings:', error);
      throw new Error('Error al actualizar las ganancias');
    }
  }

  // Actualizar múltiples ganancias de un año (solo admins)
  async updateMultipleEarnings(year: number, earningsData: any[]) {
    try {
      return await this.repository.updateMultipleEarnings(year, earningsData);
    } catch (error) {
      console.error('Error updating multiple earnings:', error);
      throw new Error('Error al actualizar las ganancias múltiples');
    }
  }

  // Resetear a valores calculados automáticamente (solo admins)
  async resetToAutoCalculated(year: number, month: number) {
    try {
      return await this.repository.resetToAutoCalculated(year, month);
    } catch (error) {
      console.error('Error resetting to auto calculated:', error);
      throw new Error('Error al resetear a valores automáticos');
    }
  }

  // Sincronizar todos los datos de un año
  async syncYearData(year: number) {
    try {
      const syncPromises = [];
      for (let month = 1; month <= 12; month++) {
        syncPromises.push(this.repository.syncEarningsData(year, month));
      }
      
      await Promise.all(syncPromises);
      return await this.getEarningsByYear(year);
    } catch (error) {
      console.error('Error syncing year data:', error);
      throw new Error('Error al sincronizar los datos del año');
    }
  }
}