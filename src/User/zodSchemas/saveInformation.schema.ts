import { z } from 'zod';

export const saveInformationSchema = z.object({
  name: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  description: z.string().optional(),
  addressHome: z.string().optional(),
  areaPosition: z.string().optional(),
  location: z.string().optional(),
  image: z.string().optional(),
  accountNumber: z.string().min(1).optional(),
});