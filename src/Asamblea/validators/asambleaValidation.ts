import {
  asambleaSchema,
  getAsambleasQuerySchema,
  createAsambleaSchema,
  updateAsambleaSchema
} from '../zodSchema/asambleaSchema';


export const asambleaValidation = (data: any) => {
  return asambleaSchema.parse(data);
};

export const updateAsambleaValidation = (data: any) => {
  return updateAsambleaSchema.parse(data);
};

export const createAsambleaValidation = (data: any) => {
  return createAsambleaSchema.parse(data);
};

export const getAsambleaQueryValidation = (data: any) => {
  return getAsambleasQuerySchema.parse(data);
};