
import { Request, Response } from "express";
import { getEstadoSolicitudPorAccionista } from "../services/solicitudcreditoServices";

/**
 * Obtener el estado de la solicitud de paquete financiero por accionista_id
 */
export const getEstadoSolicitudController = async (req: Request, res: Response) => {
  try {
    const { accionistaId } = req.params;

    const accionistaIdNum = parseInt(accionistaId);
    if (isNaN(accionistaIdNum)) {
      res.status(400).json({ 
        success: false, 
        error: 'El accionistaId debe ser un número válido' 
      });
      return;
    }

    const resultado = await getEstadoSolicitudPorAccionista(accionistaIdNum);
    
    res.status(200).json({ 
      success: true, 
      data: resultado 
    });
  } catch (error: any) {
    console.error('Error al obtener estado de la solicitud:', error);
    res.status(500).json({ 
      success: false, 
      error: "Error al obtener el estado de la solicitud" 
    });
  }
};