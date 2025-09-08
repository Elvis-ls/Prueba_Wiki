// zodSchema/institutionalEarningsSchema.ts
import z from 'zod';

export const institutionalEarningsSchema = z.object({
  year: z.number().int().min(2020).max(2050),
  month: z.number().int().min(1).max(12),
  intereses: z.number().min(0).optional(),
  creditos: z.number().min(0).optional(),
  otrosIngresos: z.number().min(0).optional(),
  interesesModified: z.boolean().optional(),
  creditosModified: z.boolean().optional(),
  otrosModified: z.boolean().optional(),
});

export const updateInstitutionalEarningsSchema = z.object({
  intereses: z.number().min(0).optional(),
  creditos: z.number().min(0).optional(),
  otrosIngresos: z.number().min(0).optional(),
});

export const getInstitutionalEarningsQuerySchema = z.object({
  year: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(2020).max(2050)),
});

export const bulkUpdateEarningsSchema = z.object({
  earnings: z.array(z.object({
    month: z.number().int().min(1).max(12),
    intereses: z.number().min(0),
    creditos: z.number().min(0),
    otrosIngresos: z.number().min(0),
  }))
});