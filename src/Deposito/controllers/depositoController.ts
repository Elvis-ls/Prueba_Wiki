import { Response } from "express";
import { AuthRequest } from '../../../src/User/interfaces/authRequest';
import { DepositoService } from "../services/depositoService";
import { depositoValidation, getDepositoQueryValidation, updateDepositoValidation } from "../validator/depositoValidation";

export class DepositoController {
  private service: DepositoService;

  constructor() {
    this.service = new DepositoService();
  }

  // Mismo usuario accionista. Crear un nuevo depósito 
  async createDeposito(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: "No autorizado" });
        return;
      }

      const validatedData = depositoValidation({ ...req.body, userId });

      const nuevoDeposito = await this.service.create(validatedData);
      res.status(201).json({ success: true, data: nuevoDeposito });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message || "Error al crear depósito" });
    }
  }

  // Mismo usuario accionista. Obtener depósitos del usuario autenticado
  async getUserDepositos(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: "No autorizado" });
        return;
      }

      const filtros = getDepositoQueryValidation(req.query); 
      const depositos = await this.service.getByUserId(userId); 

      res.json({ success: true, data: depositos });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "Error al obtener depósitos" });
    }
  }

  // Duda de implementacion. Obtener todos los depósitos
  async getAllDepositos(req: AuthRequest, res: Response): Promise<void> {
    try {
      const filtros = getDepositoQueryValidation(req.query);
      const depositos = await this.service.getAll(filtros);
      res.json({ success: true, data: depositos });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "Error al obtener todos los depósitos" });
    }
  }

  // Duda de implementacion. Cambiar estado del depósito (admin)
  async updateEstadoDeposito(req: AuthRequest, res: Response): Promise<void> {
    try {
      const depositoId = parseInt(req.params.id);
      if (isNaN(depositoId)) {
        res.status(400).json({ success: false, error: "ID inválido" });
        return;
      }

      const data = updateDepositoValidation(req.body);

      const updated = await this.service.updateEstado(depositoId, data.estado);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message || "Error al actualizar estado" });
    }
  }
}
