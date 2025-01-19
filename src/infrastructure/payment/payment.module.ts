import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { OmisePaymentService } from './omise/omise.payment.service';
import { ConfigModule } from '@nestjs/config';
import paymentConfig from './config/payment.config';

@Module({
  imports: [ConfigModule.forFeature(paymentConfig)],
  providers: [{ provide: PaymentService, useClass: OmisePaymentService }],
  exports: [PaymentService],
})
export class PaymentModule {}
