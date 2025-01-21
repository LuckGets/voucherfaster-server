import { Inject } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import {
  OrderIdsAndTransactions,
  TransactionRepository,
  UpdateTransactionData,
} from '../transaction.repository';
import { TransactionDomain } from '@resources/transaction/domain/transaction.domain';
import { TransactionMapper } from './transaction.mapper';
import { Prisma } from '@prisma/client';

export class TransactionRelationalPrismaORMRepository
  implements TransactionRepository
{
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}

  private transactionSystemJoinQuery: Prisma.TransactionInclude = {
    transactionSystem: true,
  };

  async findAllUnSuccessTransactionAndOrderWithinTime(
    timeLimit: Date,
  ): Promise<OrderIdsAndTransactions> {
    const transactionsList = await this.prismaService.transaction.findMany({
      where: {
        AND: [
          {
            status: {
              not: {
                equals: 'SUCCESS',
              },
            },
          },
          {
            deletedAt: {
              equals: null,
            },
          },
          {
            createdAt: {
              lte: timeLimit,
            },
          },
        ],
      },
      include: {
        order: true,
      },
    });

    return transactionsList.reduce(
      (acc, curr) => {
        const { order, ...transactionData } = curr;
        acc.orders.push(order.id);
        acc.transactions.push(TransactionMapper.toDomain(transactionData));
        return acc;
      },
      {
        orders: [],
        transactions: [],
      },
    );
  }

  async update(payload: UpdateTransactionData): Promise<TransactionDomain> {
    const { id, ...data } = payload;

    const updatedTransaction = await this.prismaService.transaction.update({
      where: { id },
      data,
      include: {
        ...this.transactionSystemJoinQuery,
      },
    });
    return TransactionMapper.toDomain(updatedTransaction);
  }
}
