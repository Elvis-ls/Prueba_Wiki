// controllers/institutionalEarningsController.ts
import { Request, Response } from "express";
import { InstitutionalEarningsService } from "../services/institutionalEarningsService";
import { 
  getInstitutionalEarningsQueryValidation, 
  updateInstitutionalEarningsValidation,
  bulkUpdateEarningsValidation
} from '../validator/institutionalEarningsValidation';

export class InstitutionalEarningsController {
  private service: InstitutionalEarningsService;

  constructor() {
    this.service = new InstitutionalEarningsService();
  }

  // Obtener ganancias por año (usuarios y admins)
  getEarningsByYear = async (req: Request, res: Response): Promise<void> => {
    try {
      const { year } = getInstitutionalEarningsQueryValidation(req.query);
      
      const earnings = await this.service.getEarningsByYear(year);
      
      res.json({ 
        success: true,
        data: earnings,
        year 
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || "Error al obtener las ganancias institucionales" 
      });
    }
  };

  // Obtener resumen financiero de un año (usuarios y admins)
  getYearSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const { year } = getInstitutionalEarningsQueryValidation(req.query);
      
      const summary = await this.service.getYearSummary(year);
      
      res.json({ 
        success: true,
        data: summary 
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || "Error al obtener el resumen de ganancias" 
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

  // Actualizar ganancias específicas (solo admins)
  updateEarnings = async (req: Request, res: Response): Promise<void> => {
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

      const validatedData = updateInstitutionalEarningsValidation(req.body);
      
      const updatedEarnings = await this.service.updateEarnings(year, month, validatedData);
      
      res.json({ 
        success: true,
        message: 'Ganancias actualizadas correctamente',
        data: updatedEarnings 
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || "Error al actualizar las ganancias" 
      });
    }
  };

  // Actualizar múltiples ganancias (solo admins)
  updateMultipleEarnings = async (req: Request, res: Response): Promise<void> => {
    try {
      const year = parseInt(req.params.year);

      if (isNaN(year)) {
        res.status(400).json({ 
          success: false,
          error: 'Año inválido' 
        });
        return;
      }

      const validatedData = bulkUpdateEarningsValidation(req.body);
      
      const updatedEarnings = await this.service.updateMultipleEarnings(year, validatedData.earnings);
      
      res.json({ 
        success: true,
        message: 'Ganancias actualizadas correctamente',
        data: updatedEarnings 
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || "Error al actualizar las ganancias múltiples" 
      });
    }
  };

  // Resetear ganancias a valores calculados automáticamente (solo admins)
  resetToAutoCalculated = async (req: Request, res: Response): Promise<void> => {
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

      const resetEarnings = await this.service.resetToAutoCalculated(year, month);
      
      res.json({ 
        success: true,
        message: 'Ganancias reseteadas a valores calculados automáticamente',
        data: resetEarnings 
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || "Error al resetear las ganancias" 
      });
    }
  };

  // Sincronizar datos de un año completo (solo admins)
  syncYearData = async (req: Request, res: Response): Promise<void> => {
    try {
      const year = parseInt(req.params.year);

      if (isNaN(year)) {
        res.status(400).json({ 
          success: false,
          error: 'Año inválido' 
        });
        return;
      }

      const syncedData = await this.service.syncYearData(year);
      
      res.json({ 
        success: true,
        message: 'Datos sincronizados correctamente',
        data: syncedData 
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || "Error al sincronizar los datos" 
      });
    }
  };
}