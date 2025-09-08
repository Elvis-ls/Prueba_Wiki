/* NO SE ESTA USANDO ESTA CLASE */

import { z } from 'zod';

export const createNewsSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(255, 'El título es demasiado largo'),
  publicationDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'La fecha de publicación debe ser una fecha válida',
  }),
  summary: z.string().min(1, 'El resumen es requerido').max(1000, 'El resumen es demasiado largo'),
  content: z.string().min(1, 'El contenido es requerido'),
  imageUrl: z.string().url('La URL de la imagen debe ser válida').optional(),
  imageSize: z.string().optional(),
  isPublished: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});