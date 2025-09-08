import { z } from 'zod';

export const createUserSchemaAdmin = z.object({
  name: z.string().min(1),
  lastName: z.string().min(1),
  cedula: z.string().min(10),
  accountNumber: z.string().min(12)});