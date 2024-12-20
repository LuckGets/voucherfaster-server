import { registerAs } from '@nestjs/config';
import { ClientConfig } from './client-config.type';
import { AllConfigTypeEnum } from '../all-config.type';

export default registerAs<ClientConfig>(AllConfigTypeEnum.Client, () => {
  return {
    domain: process.env.CLIENT_DOMAIN || 'http://localhost:5173',
    verifyEmailPath: '/confirm-email',
    changePasswordPath: '/change-password',
  };
});
