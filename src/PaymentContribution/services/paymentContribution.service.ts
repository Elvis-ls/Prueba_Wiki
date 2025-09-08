import { prisma } from '../../prismaClient/client';

export class PaymentContributionService {
  async registerPayment(data: {
    userId: number;
    year: number;
    month: number;
    amount: number;
  }) {
    const record = await prisma.montoContribution.findUnique({
      where: {
        userId_year_month: {
          userId: data.userId,
          year: data.year,
          month: data.month,
        },
      },
    });

    if (!record) {
      throw new Error('Registro de contribución no encontrado');
    }

    const amountPaid = record.amountPaid + data.amount;
    const status = amountPaid >= record.amountToPay ? 'Pagado' : 'Pendiente';

    return await prisma.montoContribution.update({
      where: {
        userId_year_month: {
          userId: data.userId,
          year: data.year,
          month: data.month,
        },
      },
      data: {
        amountPaid,
        status,
        paidAt: status === 'Pagado' ? new Date() : null,
      },
    });
  }
}