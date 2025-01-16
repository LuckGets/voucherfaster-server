import { Prisma } from '@prisma/client';
import { v7 as uuidv7 } from 'uuid';

export const usableDaysAfterPurchased: Prisma.UsableDaysAfterPurchasedCreateInput =
  {
    id: uuidv7(),
    usableDays: 3,
  };
