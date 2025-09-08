import z from 'zod';

export const financialBalanceSchema = z.object({
  year: z.number().int().min(2020).max(2050),
  month: z.number().int().min(1).max(12),
  totalShareholderContributions: z.number().min(0).optional(),
  isContributionsOverridden: z.boolean().optional(),
  totalCreditIncome: z.number().min(0).optional(),
  isCreditIncomeOverridden: z.boolean().optional(),
  adminNotes: z.string().optional(),
});

export const updateFinancialBalanceSchema = z.object({
  totalShareholderContributions: z.number().min(0).optional(),
  totalCreditIncome: z.number().min(0).optional(),
  adminNotes: z.string().optional(),
});

export const getFinancialBalanceQuerySchema = z.object({
  year: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(2020).max(2050)),
});