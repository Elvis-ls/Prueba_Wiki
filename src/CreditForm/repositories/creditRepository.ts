import { prisma } from '../../prismaClient/client';

export class CreditRepository {
    async createCredit(data: any) {
        return await prisma.creditForm.create({ data });
    }

    async getCreditsByUser(cedula: string) {
        return await prisma.creditForm.findMany({
            where: { cedula },
            include: { garantes: true },
            orderBy: { creadoEn: 'desc' },
        });
    }

    async findById(numeroDocumento: number) {
        return await prisma.creditForm.findUnique({
            where: { numeroDocumento },
            include: { garantes: true },
        });
    }
}