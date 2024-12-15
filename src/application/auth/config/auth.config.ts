import { registerAs } from '@nestjs/config';
import validateConfig from '../../../utils/validateConfig';
import { AllConfigTypeEnum } from '../../../config/all-config.type';
import { IsString } from 'class-validator';
import { AuthConfig } from './auth-config.type';

class EnvironmentAuthVarValidator {
  @IsString()
  GOOGLE_CLIENT_ID: string;
  @IsString()
  GOOGLE_CLIENT_SECRET: string;
  @IsString()
  GOOGLE_CALLBACK_URL: string;
}

export default registerAs<AuthConfig>(AllConfigTypeEnum.Auth, () => {
  validateConfig(process.env, EnvironmentAuthVarValidator);

  return {};
});
