import { Transaction, TransactionSystem } from '@prisma/client';
import { TransactionDomain } from '@resources/transaction/domain/transaction.domain';

export type TransactionAndSystem = Transaction & {
  transactionSystem: Partial<TransactionSystem>;
};

export class TransactionMapper {
  public static toDomain(
    transactionEntity: TransactionAndSystem,
  ): TransactionDomain {
    const transaction: TransactionDomain = new TransactionDomain();
    transaction.id = transactionEntity.id;
    transaction.status = transactionEntity.status;
    transaction.transactionSystem = transactionEntity.transactionSystem.system;
    transaction.createdAt = transactionEntity.createdAt;
    transaction.updatedAt = transactionEntity.updatedAt;
    transaction.deletedAt = transactionEntity.deletedAt;
    return transaction;
  }
}
