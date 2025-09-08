import { z } from 'zod';

export const asambleaSchema = z.object({
  fecha: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Fecha inválida",
  }),
  tipo: z.string().min(3),
  modalidad: z.string().min(3),
  lugar: z.string().min(3),
  horaInicio: z.string().refine(
    (val) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val),
    { message: "Hora inicio inválida (HH:mm)" }
  ),
  horaFin: z.string().refine(
    (val) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val),
    { message: "Hora fin inválida (HH:mm)" }
  ),
  detalles: z.object({
    agenda: z.array(z.string()),
    documentos: z.array(z.string()),
    requisitos: z.array(z.string()),
    contacto: z.string().email(),
    telefono: z.string().refine((val) => /^\+?\d{6,15}$/.test(val), {
      message: "Teléfono inválido",
    }),
  }),
});

export const createAsambleaSchema = z.object({
  fecha: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Fecha inválida",
  }),
  tipo: z.string().min(3),
  modalidad: z.string().min(3),
  lugar: z.string().min(3),
  horaInicio: z.string().refine(
    (val) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val),
    { message: "Hora inicio inválida (HH:mm)" }
  ),
  horaFin: z.string().refine(
    (val) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val),
    { message: "Hora fin inválida (HH:mm)" }
  ),
  detalles: z.object({
    agenda: z.array(z.string()),
    documentos: z.array(z.string()),
    requisitos: z.array(z.string()),
    contacto: z.string().email(),
    telefono: z.string().refine((val) => /^\+?\d{6,15}$/.test(val), {
      message: "Teléfono inválido",
    }),
  }),
});

// schema validator para la actualizacion de una asamblea
export const updateAsambleaSchema = createAsambleaSchema.partial();
export type UpdateAsambleaData = z.infer<typeof updateAsambleaSchema>;

// shchema validator para recibir asamblea
export const getAsambleasQuerySchema = z.object({
  search: z.string().optional(),
  tipo: z.enum(["Ordinaria", "Extraordinaria"]).optional(),
  modalidad: z.enum(["Presencial", "Online", "Híbrida"]).optional(),
  año: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1900).max(2100))
    .optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1))
    .optional()
    .default("1"),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100))
    .optional()
    .default("12"),
});