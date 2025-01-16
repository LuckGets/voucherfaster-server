import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { OmisePaymentService } from './omise/omise.payment.service';

@Module({
  providers: [{ provide: PaymentService, useClass: OmisePaymentService }],
  exports: [PaymentService],
})
export class PaymentModule {}
