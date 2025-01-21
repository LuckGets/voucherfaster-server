import { AllConfigTypeEnum } from 'src/config/all-config.type';

export type PaymentConfig = {
  paymentSecretKey: string;
  paymentPublicSecretKey: string;
};

export const PAYMENT_CONFIG = {
  SECRET_KEY: `paymentSecretKey`,
  PUBLIC_KEY: `paymentPublicSecretKey`,
} as const;
