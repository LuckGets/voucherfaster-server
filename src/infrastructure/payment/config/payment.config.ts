import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';
import { PAYMENT_CONFIG, PaymentConfig } from './payment-config.type';
import { AllConfigTypeEnum } from 'src/config/all-config.type';
import validateConfig from '@utils/validateConfig';

class EnvironmentPaymentVarValidator {
  @IsString()
  OMISE_SECRET_KEY: string;

  @IsString()
  OMISE_PUBLIC_KEY: string;
}

export default registerAs<PaymentConfig>(AllConfigTypeEnum.Payment, () => {
  validateConfig(process.env, EnvironmentPaymentVarValidator);
  return {
    [PAYMENT_CONFIG.SECRET_KEY]: process.env.OMISE_SECRET_KEY,
    [PAYMENT_CONFIG.PUBLIC_KEY]: process.env.OMISE_PUBLIC_KEY,
  };
});
