import { z } from 'zod';

export const userUpdateSchema = z.object({
  email: z.string().email("Formato de correo inválido").optional(),
  phone: z.string().min(10, "Teléfono debe tener al menos 10 dígitos").optional(),
  description: z.string().optional(),
  password: z.string().min(10, "La contraseña debe tener al menos 10 caracteres").optional(),
  confirmPassword: z.string().min(10).optional(),
  birthDate: z.string().optional().refine(
    (val) => !val || !isNaN(Date.parse(val)),
    { message: "Fecha inválida" }
  ),
  fingerprintCode: z.string().min(1, "Código de huella inválido").optional(),
  ultimosDigitosCarnet: z.string().length(4, "Debe tener exactamente 4 dígitos").optional()
}).refine((data) => !data.password || data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});