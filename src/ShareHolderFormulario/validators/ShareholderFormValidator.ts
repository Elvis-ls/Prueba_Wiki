import { createShareholderFormSchema } from "../../User/zodSchemas/create.shFormulario.schema";


export class ShareholderFormValidator {
  static validate(input: any) {
    const parsed = createShareholderFormSchema.safeParse(input);
    if (!parsed.success) {
      throw parsed.error.flatten().fieldErrors;
    }
    return parsed.data;
  }
}