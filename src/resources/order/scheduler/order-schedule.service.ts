import { Injectable } from '@nestjs/common';
import { OrderService } from '../order.service';
import { TransactionService } from '@resources/transaction/transaction.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CalculatorService } from '@utils/services/calculator.service';

@Injectable()
export class OrderSchedulerService {
  constructor(
    private readonly orderService: OrderService,
    private readonly transactionService: TransactionService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async cleanUpOrderWithoutTransaction(): Promise<void> {
    const timeLimitToFinishTransactionInMilliSecond =
      CalculatorService.multiply(30, CalculatorService.multiply(60, 1000));
    const expiredTime = new Date(
      Date.now() - timeLimitToFinishTransactionInMilliSecond,
    );
    const { orders, transactions } =
      await this.transactionService.getAllUnSuccessTransactionAndOrderWithinTime(
        expiredTime,
      );

    if (!orders || orders.length < 1) return;
    await this.orderService.deleteManyOrderWithUnsuccessTransaction(
      orders,
      transactions.map((item) => item.id),
    );
  }
}
