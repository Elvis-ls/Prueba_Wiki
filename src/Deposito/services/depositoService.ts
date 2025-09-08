import { DepositoRepository } from "../repositories/depositoRepository";

export class DepositoService {
  private repository: DepositoRepository;

  constructor() {
    this.repository = new DepositoRepository();
  }

  // servicio de crear un nuevo depósito
  async create(data: {
    userId: number;
    monto: number;
    metodo: string;
    comprobanteUrl?: string;
  }) {
    try {
      return await this.repository.create({
        userId: data.userId,
        amount: data.monto,
        method: data.metodo,
        comprobanteUrl: data.comprobanteUrl,
        status: "Pendiente",
      });
    } catch (error) {
      throw new Error(`Error al crear depósito: ${error}`);
    }
  }

  // servicio de obtener todos los depósitos de un usuario específico
  async getByUserId(userId: number) {
    try {
      return await this.repository.findByUserId(userId);
    } catch (error) {
      throw new Error(`Error al obtener depósitos del usuario: ${error}`);
    }
  }

  // servicio de obtener todos los depósitos (admin)
  async getAll(filters: { estado?: string }) {
    try {
      return await this.repository.findAll(filters);
    } catch (error) {
      throw new Error(`Error al obtener todos los depósitos: ${error}`);
    }
  }

  // servicio de actualizar estado del depósito
  async updateEstado(depositoId: number, estado: "pendiente" | "aprobado" | "rechazado") {
    try {
      return await this.repository.updateEstado(depositoId, estado);
    } catch (error) {
      throw new Error(`Error al actualizar estado del depósito: ${error}`);
    }
  }
}
