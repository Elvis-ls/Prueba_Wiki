import {
  capacitacionSchema,
  getCapacitacionesQuerySchema,
  createCapacitacionSchema,
  updateCapacitacionSchema
} from '../zodSchema/capacitacionSchema';


export const capacitacionValidation = (data: any) => {
  return capacitacionSchema.parse(data);
};

export const updateCapacitacionValidation = (data: any) => {
  return updateCapacitacionSchema.parse(data);
};

export const createCapacitacionValidation = (data: any) => {
  return createCapacitacionSchema.parse(data);
};

export const getCapacitacionQueryValidation = (data: any) => {
  return getCapacitacionesQuerySchema.parse(data);
};