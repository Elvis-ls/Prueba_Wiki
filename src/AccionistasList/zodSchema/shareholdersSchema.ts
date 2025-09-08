// zodSchema/shareholdersSchema.ts
import z from 'zod';

export const shareholderSchema = z.object({
  userId: z.number().int().positive(),
  tipo: z.enum(["Mayoritario", "Institucional", "Minoritario"]),
  porcentajeParticipacion: z.number().min(0).max(100),
  cantidadAcciones: z.number().int().min(0),
  activo: z.boolean().optional().default(true),
});

export const updateShareholderSchema = z.object({
  tipo: z.enum(["Mayoritario", "Institucional", "Minoritario"]).optional(),
  porcentajeParticipacion: z.number().min(0).max(100).optional(),
  cantidadAcciones: z.number().int().min(0).optional(),
  activo: z.boolean().optional(),
});

// SCHEMA MODIFICADO: Permitir userId O firstName/lastName
export const createShareholderSchema = z.object({
  // Hacer userId opcional
  userId: z.number().int().positive().optional(),
  
  // Campos alternativos para buscar usuario existente
  firstName: z.string().min(1, "Nombre es requerido").optional(),
  lastName: z.string().min(1, "Apellido es requerido").optional(),
  
  // Campos de accionista
  tipo: z.enum(["Mayoritario", "Institucional", "Minoritario"]),
  porcentajeParticipacion: z.number().min(0).max(100),
  cantidadAcciones: z.number().int().min(0),
}).refine(
  (data) => {
    // Debe tener userId O (firstName Y lastName)
    return data.userId || (data.firstName && data.lastName);
  },
  {
    message: "Debe proporcionar userId o firstName y lastName",
    path: ["userId"]
  }
);

export const getShareholdersQuerySchema = z.object({
  search: z.string().optional(),
  tipo: z.enum(["Mayoritario", "Institucional", "Minoritario"]).optional(),
  page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1)).optional().default("1"),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1).max(100)).optional().default("12"),
  activo: z.string().transform(val => val === 'true').pipe(z.boolean()).optional(),
});

export const followShareholderSchema = z.object({
  followedId: z.number().int().positive(),
});