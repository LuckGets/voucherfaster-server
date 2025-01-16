import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';
import { PaymentConfig } from './payment-config.type';
import { AllConfigTypeEnum } from 'src/config/all-config.type';
import validateConfig from '@utils/validateConfig';

class EnvironmentPaymentVarValidator {
  @IsString()
  OMISE_SECRET_KEY: string;
}

export default registerAs<PaymentConfig>(AllConfigTypeEnum.Payment, () => {
  validateConfig(process.env, EnvironmentPaymentVarValidator);
  return {
    paymentSecretKey: process.env.OMISE_SECRET_KEY,
  };
});
