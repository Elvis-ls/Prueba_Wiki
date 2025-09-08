import { prisma } from "../../prismaClient/client";

export class DepositoRepository {
  // modelo de crear un nuevo depósito
  async create(data: {
    userId: number;
    amount: number;
    method: string;
    comprobanteUrl?: string;
    status: string;
  }) {
    return await prisma.deposito.create({
      data: {
        userId: data.userId,
        amount: data.amount,
        method: data.method,
        comprobanteUrl: data.comprobanteUrl || null,
        status: data.status,
      },
    });
  }

  // Obtener todos los depósitos de un usuario
  async findByUserId(userId: number) {
    return await prisma.deposito.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  // Obtener todos los depósitos (uso de admin)
  async findAll(filters: { estado?: string }) {
    const where: any = {};
    if (filters.estado) {
      where.status = filters.estado;
    }

    return await prisma.deposito.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            cedula: true,
            accountNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // Actualizar estado del depósito (uso de admin)
  async updateEstado(depositoId: number, estado: string) {
    return await prisma.deposito.update({
      where: { id: depositoId },
      data: {
        status: estado,
        updatedAt: new Date(),
      },
    });
  }
}
