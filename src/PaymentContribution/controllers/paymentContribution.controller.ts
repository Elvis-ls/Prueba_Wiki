import { Request, Response, NextFunction } from 'express';
import { PaymentContributionService } from '../services/paymentContribution.service';

export class PaymentContributionController {
  constructor(private paymentService: PaymentContributionService) {}

  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, year, month, amount } = req.body;

      const updated = await this.paymentService.registerPayment({
        userId: parseInt(userId),
        year: parseInt(year),
        month: parseInt(month),
        amount: parseFloat(amount),
      });

      res.status(200).json({ message: 'Pago registrado correctamente', updated });
    } catch (error) {
      next(error);
    }
  }
}