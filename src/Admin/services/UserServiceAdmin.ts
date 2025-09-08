import { prisma } from '../../prismaClient/client';

interface CreateUserDTO {
  name: string;
  lastName: string;
  cedula: string;
  accountNumber: string;
}

export class UserServiceAdmin {
  async createUser(data: CreateUserDTO): Promise<void> {
    await prisma.users.create({
      data: {
        ...data,
        status: 'PENDIENTE',
      },
    });
  }
}