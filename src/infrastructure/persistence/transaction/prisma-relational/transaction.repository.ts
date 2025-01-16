import { Inject } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import {
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
