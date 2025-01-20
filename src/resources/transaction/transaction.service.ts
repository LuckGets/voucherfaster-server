import { Injectable } from '@nestjs/common';
import { PaymentService } from 'src/infrastructure/payment/payment.service';
import {
  TransactionDomain,
  TransactionStatusEnum,
} from './domain/transaction.domain';
import { TransactionRepository } from 'src/infrastructure/persistence/transaction/transaction.repository';
import { ErrorApiResponse } from 'src/common/core-api-response';

@Injectable()
export class TransactionService {
  constructor(
    private paymentService: PaymentService,
    private transactionRepository: TransactionRepository,
  ) {}

  public async processPayment({
    token,
    amount,
    description,
    transactionId,
  }: {
    token: string;
    amount: number;
    description: string;
    transactionId: TransactionDomain['id'];
  }): Promise<TransactionDomain> {
    const payment = await this.paymentService.makePayment(
      token,
      amount,
      description,
    );

    if (payment.status === 'successful') {
      return this.transactionRepository.update({
        id: transactionId,
        status: TransactionStatusEnum.SUCCESS,
        paymentId: payment.id,
      });
    }

    throw ErrorApiResponse.conflictRequest(
      `Could not proceed transaction as the payment status: ${payment.status}`,
    );
  }

  public async getAllUnSuccessTransactionAndOrderWithinTime(timeLimit: Date) {
    if (!timeLimit || timeLimit instanceof Date)
      throw ErrorApiResponse.conflictRequest('Invalid time limit provided.');

    return this.transactionRepository.findAllUnSuccessTransactionAndOrderWithinTime(
      timeLimit,
    );
  }
}
