import { OrderDomain } from '@resources/order/domain/order.domain';
import { TransactionDomain } from '@resources/transaction/domain/transaction.domain';

export type UpdateTransactionData = Omit<
  TransactionDomain,
  'transactionSystem' | 'createdAt' | 'updatedAt'
>;

export type OrderIdsAndTransactions = {
  orders: OrderDomain['id'][];
  transactions: TransactionDomain[];
};

export abstract class TransactionRepository {
  abstract findAllUnSuccessTransactionAndOrderWithinTime(
    timeLimit: Date,
  ): Promise<OrderIdsAndTransactions>;
  //   abstract create(data: any): Promise<any>;
  abstract update(data: UpdateTransactionData): Promise<TransactionDomain>;
}
