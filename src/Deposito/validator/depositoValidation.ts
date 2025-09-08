import {
  depositoSchema,
  getDepositosQuerySchema,
  updateDepositoSchema
} from '../zodSchema/depositoSchema';

export const depositoValidation = (data: any) => {
  return depositoSchema.parse(data);
};

export const updateDepositoValidation = (data: any) => {
  return updateDepositoSchema.parse(data);
};

export const getDepositoQueryValidation = (data: any) => {
  return getDepositosQuerySchema.parse(data);
};
