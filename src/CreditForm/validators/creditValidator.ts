import { creditRequestSchema } from '../zodSchema/creditValidatorsSchema';

export const validateCredit = (data: any) => {
    return creditRequestSchema.parse(data);
}