import { checkUserExistsSchema } from '../zodSchemas/checkUserExists.schema';

export const validateCheckUserExistsData = (data: any) => {
  const parsed = checkUserExistsSchema.safeParse(data);
  if (!parsed.success) {
    throw parsed.error;
  }
  return parsed.data;
};
