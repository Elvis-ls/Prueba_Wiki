import z from 'zod';

// Schema para el contenido general de la directiva
export const directivaContentSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(200, "El título no puede exceder 200 caracteres"),
  description: z.string().min(1, "La descripción es requerida").max(1000, "La descripción no puede exceder 1000 caracteres"),
  quote: z.string().min(1, "La cita es requerida").max(500, "La cita no puede exceder 500 caracteres"),
  institutionalTitle: z.string().min(1, "El título institucional es requerido").max(200, "El título institucional no puede exceder 200 caracteres"),
  institutionalContent: z.string().min(1, "El contenido institucional es requerido").max(2000, "El contenido institucional no puede exceder 2000 caracteres"),
  adminId: z.number().int().positive().optional()
});

// Schema para actualizar contenido (campos opcionales)
export const updateDirectivaContentSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(200, "El título no puede exceder 200 caracteres").optional(),
  description: z.string().min(1, "La descripción es requerida").max(1000, "La descripción no puede exceder 1000 caracteres").optional(),
  quote: z.string().min(1, "La cita es requerida").max(500, "La cita no puede exceder 500 caracteres").optional(),
  institutionalTitle: z.string().min(1, "El título institucional es requerido").max(200, "El título institucional no puede exceder 200 caracteres").optional(),
  institutionalContent: z.string().min(1, "El contenido institucional es requerido").max(2000, "El contenido institucional no puede exceder 2000 caracteres").optional(),
  adminId: z.number().int().positive().optional()
});

// Schema para miembros de la directiva
export const directivaMemberSchema = z.object({
  title: z.string().min(1, "El título del cargo es requerido").max(100, "El título no puede exceder 100 caracteres"),
  name: z.string().min(1, "El nombre es requerido").max(100, "El nombre no puede exceder 100 caracteres"),
  image: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  href: z.string().min(1, "La URL del perfil es requerida").max(200, "La URL no puede exceder 200 caracteres"),
  position: z.number().int().min(0).optional(),
  adminId: z.number().int().positive().optional()
});

// Schema para crear nuevo miembro
export const createDirectivaMemberSchema = z.object({
  title: z.string().min(1, "El título del cargo es requerido").max(100, "El título no puede exceder 100 caracteres"),
  name: z.string().min(1, "El nombre es requerido").max(100, "El nombre no puede exceder 100 caracteres"),
  image: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  href: z.string().min(1, "La URL del perfil es requerida").max(200, "La URL no puede exceder 200 caracteres"),
  position: z.number().int().min(0).optional(),
  adminId: z.number().int().positive().optional()
});

// Schema para actualizar miembro (campos opcionales)
export const updateDirectivaMemberSchema = z.object({
  title: z.string().min(1, "El título del cargo es requerido").max(100, "El título no puede exceder 100 caracteres").optional(),
  name: z.string().min(1, "El nombre es requerido").max(100, "El nombre no puede exceder 100 caracteres").optional(),
  image: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  href: z.string().min(1, "La URL del perfil es requerida").max(200, "La URL no puede exceder 200 caracteres").optional(),
  position: z.number().int().min(0).optional(),
  adminId: z.number().int().positive().optional()
});