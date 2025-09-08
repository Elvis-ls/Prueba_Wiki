import { createAdminSchema } from "../zodSchemaAdmin/createAdminSchema";

export class AdminValidator {
  static validate(input: any) {
    const parsed = createAdminSchema.safeParse(input);
    if (!parsed.success) {
      throw parsed.error.flatten().fieldErrors;
    }
    return parsed.data;
  }
}