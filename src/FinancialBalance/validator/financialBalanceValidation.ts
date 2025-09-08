import { 
  financialBalanceSchema, 
  updateFinancialBalanceSchema, 
  getFinancialBalanceQuerySchema 
} from '../zodSchema/financialBalanceSchema';

export const financialBalanceValidation = (data: any) => {
  return financialBalanceSchema.parse(data);
};

export const updateFinancialBalanceValidation = (data: any) => {
  return updateFinancialBalanceSchema.parse(data);
};

export const getFinancialBalanceQueryValidation = (data: any) => {
  return getFinancialBalanceQuerySchema.parse(data);
};