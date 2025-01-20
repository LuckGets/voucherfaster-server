import { Prisma } from '@prisma/client';
import { v7 as uuidv7 } from 'uuid';
import { orderIDArr } from './order.seed';

export const transactionSystem: Prisma.TransactionSystemCreateInput = {
  id: uuidv7(),
  system: 'omise',
};

export const transactionsOfOrders: Prisma.TransactionCreateManyInput[] = [
  {
    id: uuidv7(),
    orderId: orderIDArr[0],
    paymentId: uuidv7(),
    transactionSystemId: transactionSystem.id,
    status: 'SUCCESS',
  },
  {
    id: uuidv7(),
    orderId: orderIDArr[1],
    paymentId: uuidv7(),
    transactionSystemId: transactionSystem.id,
    status: 'SUCCESS',
  },
  {
    id: uuidv7(),
    orderId: orderIDArr[2],
    paymentId: uuidv7(),
    transactionSystemId: transactionSystem.id,
    status: 'SUCCESS',
  },
  {
    id: uuidv7(),
    orderId: orderIDArr[3],
    paymentId: uuidv7(),
    transactionSystemId: transactionSystem.id,
    status: 'SUCCESS',
  },
  {
    id: uuidv7(),
    orderId: orderIDArr[4],
    paymentId: uuidv7(),
    transactionSystemId: transactionSystem.id,
    status: 'SUCCESS',
  },
];
