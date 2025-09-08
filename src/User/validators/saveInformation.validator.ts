import { saveInformationSchema } from "../zodSchemas/saveInformation.schema";

export const validateSaveInformationData = (data: any) => {
  const parsed = saveInformationSchema.safeParse(data);
  if (!parsed.success) {
    throw parsed.error;
  }
  return parsed.data;
};