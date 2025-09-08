// Usaddo para el logeo de los accionistas
import { loginSchema } from "../zodSchemas/login.schema";

export const validateLoginData = (data: any) => {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    throw parsed.error;
  }
  return parsed.data;
};