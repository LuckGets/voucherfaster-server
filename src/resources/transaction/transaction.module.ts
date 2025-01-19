import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { PaymentModule } from 'src/infrastructure/payment/payment.module';
import { TransactionRelationalPersistenceModule } from 'src/infrastructure/persistence/transaction/transaction-relational.module';

@Module({
  imports: [PaymentModule, TransactionRelationalPersistenceModule],
  providers: [TransactionService],
  controllers: [TransactionController],
})
export class TransactionModule {}
