import { z } from "zod";

export const checkUserExistsSchema = z.object({
  name: z.string().min(1),
  lastName: z.string().min(1),
  cedula: z.string().min(5),
  accountNumber: z.string().min(1)
});