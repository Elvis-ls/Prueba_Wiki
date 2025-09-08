/* NO SE ESTA USANDO ESTA CLASE */

import { createNewsSchema } from '../zodSchemas/news.schema';

export const validateNewsData = (data: any) => {
  const parsed = createNewsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }
  return { success: true, data: parsed.data };
};