import { z } from 'zod';

export const depositoSchema = z.object({
  userId: z.number(),
  monto: z.number().min(10),
  metodo: z.string().min(3),
  comprobanteUrl: z
    .string()
    .url("Debe ser una URL válida")
    .optional()
    .or(z.literal("")) // permitir vacío
}).refine(
  (data) => {
    if (data.metodo === "Transferencia Bancaria") {
      return !!data.comprobanteUrl;
    }
    return true;
  },
  {
    message: "El comprobante es obligatorio para transferencias bancarias.",
    path: ["comprobanteUrl"],
  }
);


export const getDepositosQuerySchema = z.object({
  estado: z.enum(['pendiente', 'aprobado', 'rechazado']).optional(),
  userId: z.string().optional(), // para filtrar por usuario
});

export const updateDepositoSchema = z.object({
  estado: z.enum(['pendiente', 'aprobado', 'rechazado']),
});
