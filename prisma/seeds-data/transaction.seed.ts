import { Prisma } from '@prisma/client';
import { v7 as uuidv7 } from 'uuid';

export const transactionSystem: Prisma.TransactionSystemCreateInput = {
  id: uuidv7(),
  system: 'omise',
};
