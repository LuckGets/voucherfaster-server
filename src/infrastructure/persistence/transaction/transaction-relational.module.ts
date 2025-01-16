import { Module } from '@nestjs/common';
import { PrismaModule } from '../config/prisma.module';
import { TransactionRepository } from './transaction.repository';
import { TransactionRelationalPrismaORMRepository } from './prisma-relational/transaction.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: TransactionRepository,
      useClass: TransactionRelationalPrismaORMRepository,
    },
  ],
  exports: [TransactionRepository],
})
export class TransactionRelationalPersistenceModule {}
