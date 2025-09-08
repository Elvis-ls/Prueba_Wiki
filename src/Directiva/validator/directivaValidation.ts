import { 
  directivaContentSchema, 
  updateDirectivaContentSchema,
  directivaMemberSchema,
  updateDirectivaMemberSchema,
  createDirectivaMemberSchema
} from '../zodSchema/directivaSchema';

export const directivaContentValidation = (data: any) => {
  return directivaContentSchema.parse(data);
};

export const updateDirectivaContentValidation = (data: any) => {
  return updateDirectivaContentSchema.parse(data);
};

export const directivaMemberValidation = (data: any) => {
  return directivaMemberSchema.parse(data);
};

export const updateDirectivaMemberValidation = (data: any) => {
  return updateDirectivaMemberSchema.parse(data);
};

export const createDirectivaMemberValidation = (data: any) => {
  return createDirectivaMemberSchema.parse(data);
};