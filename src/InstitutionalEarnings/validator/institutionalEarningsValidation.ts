// validator/institutionalEarningsValidation.ts
import { 
  institutionalEarningsSchema, 
  updateInstitutionalEarningsSchema, 
  getInstitutionalEarningsQuerySchema,
  bulkUpdateEarningsSchema 
} from '../zodSchema/institutionalEarningsSchema';

export const institutionalEarningsValidation = (data: any) => {
  return institutionalEarningsSchema.parse(data);
};

export const updateInstitutionalEarningsValidation = (data: any) => {
  return updateInstitutionalEarningsSchema.parse(data);
};

export const getInstitutionalEarningsQueryValidation = (data: any) => {
  return getInstitutionalEarningsQuerySchema.parse(data);
};

export const bulkUpdateEarningsValidation = (data: any) => {
  return bulkUpdateEarningsSchema.parse(data);
};