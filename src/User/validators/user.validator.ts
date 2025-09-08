import { userUpdateSchema } from "../zodSchemas/register.schema";

export const validateUserUpdateData = (data: any) => {
  return userUpdateSchema.parse(data);
};