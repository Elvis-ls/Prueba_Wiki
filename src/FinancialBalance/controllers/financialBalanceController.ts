import { Request, Response } from "express";
import { FinancialBalanceService } from "../services/financialBalanceService";
import { 
  getFinancialBalanceQueryValidation, 
  updateFinancialBalanceValidation 
} from "../validator/financialBalanceValidation";

export class FinancialBalanceController {
  private service: FinancialBalanceService;

  constructor() {
    this.service = new FinancialBalanceService();
  }

  // Obtener balances por año (usuarios y admins)
  getBalancesByYear = async (req: Request, res: Response): Promise<void> => {
    try {
      const { year } = getFinancialBalanceQueryValidation(req.query);
      
      const balances = await this.service.getBalancesByYear(year);
      
      res.json({ 
        success: true,
        data: balances,
        year 
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || "Error al obtener los balances financieros" 
      });
    }
  };

  // Obtener resumen financiero de un año (usuarios y admins)
  getYearSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const { year } = getFinancialBalanceQueryValidation(req.query);
      
      const summary = await this.service.getYearSummary(year);
      
      res.json({ 
        success: true,
        data: summary 
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || "Error al obtener el resumen financiero" 
      });
    }
  };

  // Obtener años disponibles (usuarios y admins)
  getAvailableYears = async (req: Request, res: Response): Promise<void> => {
    try {
      const years = await this.service.getAvailableYears();
      
      res.json({ 
        success: true,
        data: years 
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || "Error al obtener los años disponibles" 
      });
    }
  };

  // Actualizar balance específico (solo admins)
  updateBalance = async (req: Request, res: Response): Promise<void> => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      
      // Usar un adminId por defecto o extraerlo del body si es necesario
      const adminId = req.body.adminId || 1; // Valor por defecto

      if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        res.status(400).json({ 
          success: false,
          error: 'Año o mes inválido' 
        });
        return;
      }

      const validatedData = updateFinancialBalanceValidation(req.body);
      
      const updatedBalance = await this.service.updateBalance(year, month, validatedData, adminId);
      
      res.json({ 
        success: true,
        message: 'Balance actualizado correctamente',
        data: updatedBalance 
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || "Error al actualizar el balance" 
      });
    }
  };

  // Actualizar múltiples balances (solo admins)
  updateMultipleBalances = async (req: Request, res: Response): Promise<void> => {
    try {
      const year = parseInt(req.params.year);
      
      // Usar un adminId por defecto o extraerlo del body si es necesario
      const adminId = req.body.adminId || 1; // Valor por defecto

      if (isNaN(year)) {
        res.status(400).json({ 
          success: false,
          error: 'Año inválido' 
        });
        return;
      }

      const { balances } = req.body;

      if (!Array.isArray(balances)) {
        res.status(400).json({ 
          success: false,
          error: 'Se esperaba un array de balances' 
        });
        return;
      }

      const updatedBalances = await this.service.updateMultipleBalances(year, balances, adminId);
      
      res.json({ 
        success: true,
        message: 'Balances actualizados correctamente',
        data: updatedBalances 
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || "Error al actualizar los balances" 
      });
    }
  };

  // Resetear balance a valores calculados automáticamente (solo admins)
  resetToAutoCalculated = async (req: Request, res: Response): Promise<void> => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      
      // Usar un adminId por defecto o extraerlo del body si es necesario
      const adminId = req.body.adminId || 1; // Valor por defecto

      if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        res.status(400).json({ 
          success: false,
          error: 'Año o mes inválido' 
        });
        return;
      }

      const resetBalance = await this.service.resetToAutoCalculated(year, month, adminId);
      
      res.json({ 
        success: true,
        message: 'Balance reseteado a valores calculados automáticamente',
        data: resetBalance 
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || "Error al resetear el balance" 
      });
    }
  };
}