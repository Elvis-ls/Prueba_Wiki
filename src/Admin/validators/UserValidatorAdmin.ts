import { createUserSchemaAdmin } from '../zodSchemaAdmin/registerSchemaAdmin';

export class UserValidatorAdmin {
  static validate(input: any) {
    const parsed = createUserSchemaAdmin.safeParse(input);
    if (!parsed.success) {
      throw parsed.error.flatten().fieldErrors;
    }
    return parsed.data;
  }
}