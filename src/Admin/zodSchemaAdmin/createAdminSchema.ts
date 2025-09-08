import { z } from 'zod';

export const createAdminSchema = z.object({
  names: z.string().min(1),
  lastNames: z.string().min(1),
  cedula: z.string().min(10).max(11),
  accountNumber: z.string().min(1),
  ultimosDigitosCarnet: z.string().min(1).max(4),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  phone: z.string().optional(),
  addressHome: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  areaPosition: z.string().optional(),
  institutionLevel: z.string().optional(),
  fingerprintCode: z.string().optional(),
  birthDate: z.coerce.date().optional(),
  image: z.string().optional()
});