import { z } from 'zod';

export const creditRequestSchema = z.object({
  cedula: z.string().min(10),
  nombres: z.string(),
  apellidos: z.string(),
  email: z.string().email(),
  direccion: z.string().optional(),
  pais: z.string().optional(),
  ciudad: z.string().optional(),
  provincia: z.string().optional(),
  canton: z.string().optional(),
  estadoCivil: z.string().optional(),
  tituloProfesional: z.string().optional(),
  numeroTelefono: z.string().optional(),
  discapacidad: z.string(),
  fechaEmision: z.string(),
  montoCredito: z.number(),
  tipodeCredito: z.string(),
});