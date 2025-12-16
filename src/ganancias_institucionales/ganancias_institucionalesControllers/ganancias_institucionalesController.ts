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