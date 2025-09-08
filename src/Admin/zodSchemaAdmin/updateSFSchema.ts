import { z } from 'zod';

export const updateShareholderFormSchema = z.object({
  estado: z.enum(['pendiente', 'aceptado', 'rechazado']),
  comentariosRechazo: z.string().optional(),
});