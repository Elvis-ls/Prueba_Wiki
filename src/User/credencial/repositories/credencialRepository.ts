import { prisma } from '../../../prismaClient/client';

export class CredencialRepository {
    async findById(userId: number) {
        return await prisma.users.findUnique({
            where: { id: userId },
            select: { credencialPath: true }
        });
    }

    async getAll() {
        return await prisma.users.findMany({
            select: { id: true, name: true, email: true, credencialPath: true }
        });
    }

    async updateCredencial(userId: number, filePath: string) {
        return await prisma.users.update({
            where: { id: userId },
            data: { credencialPath: filePath }
        });
    }

    async deleteCredencial(userId: number) {
        return await prisma.users.update({
            where: { id: userId },
            data: { credencialPath: null }
        });
    }
}
