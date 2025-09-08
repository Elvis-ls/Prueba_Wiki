import { z } from 'zod';

export const capacitacionSchema = z.object({
  fecha: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Fecha inválida",
  }),
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
  tematica: z.string().min(3),
  
  detalles: z.object({
    agenda: z.array(z.string()),
    descripcion: z.string().min(3),
    materiales: z.array(z.string()),
    requisitos: z.array(z.string()),
    contacto: z.string().email(),
    telefono: z.string().refine((val) => /^\+?\d{6,15}$/.test(val), {
      message: "Teléfono inválido",
    }),
    enlace: z.string().url().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  }),
});

export const createCapacitacionSchema = z.object({
  fecha: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Fecha inválida",
  }),
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
  tematica: z.string().min(3),
  
  detalles: z.object({
    agenda: z.array(z.string()),
    descripcion: z.string().min(3),
    materiales: z.array(z.string()),
    requisitos: z.array(z.string()),
    contacto: z.string().email(),
    telefono: z.string().refine((val) => /^\+?\d{6,15}$/.test(val), {
      message: "Teléfono inválido",
    }),
    enlace: z.string().url().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  }),
});

// schema validator para la actualizacion de una capacitacion
export const updateCapacitacionSchema = createCapacitacionSchema.partial();
export type UpdateCapacitacionData = z.infer<typeof updateCapacitacionSchema>;

// shchema validator para recibir Capacitacion
export const getCapacitacionesQuerySchema = z.object({
  search: z.string().optional(),
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