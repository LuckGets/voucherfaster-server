import { TransactionDomain } from '@resources/transaction/domain/transaction.domain';

export type UpdateTransactionData = Omit<
  TransactionDomain,
  'transactionSystem' | 'createdAt' | 'updatedAt'
>;

export abstract class TransactionRepository {
  //   abstract create(data: any): Promise<any>;
  abstract update(data: UpdateTransactionData): Promise<TransactionDomain>;
}
