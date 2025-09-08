// validator/shareholdersValidation.ts
import { 
  shareholderSchema, 
  updateShareholderSchema, 
  createShareholderSchema,
  getShareholdersQuerySchema,
  followShareholderSchema
} from '../zodSchema/shareholdersSchema';

export const shareholderValidation = (data: any) => {
  return shareholderSchema.parse(data);
};

export const updateShareholderValidation = (data: any) => {
  return updateShareholderSchema.parse(data);
};

export const createShareholderValidation = (data: any) => {
  return createShareholderSchema.parse(data);
};

export const getShareholdersQueryValidation = (data: any) => {
  return getShareholdersQuerySchema.parse(data);
};

export const followShareholderValidation = (data: any) => {
  return followShareholderSchema.parse(data);
};