import { registerAs } from '@nestjs/config';
import validateConfig from '../../../utils/validateConfig';
import { AllConfigTypeEnum } from '../../../config/all-config.type';
import { IsString } from 'class-validator';

class EnvironmentAuthVarValidator {
  @IsString()
  GOOGLE_CLIENT_ID: string;
  @IsString()
  GOOGLE_CLIENT_SECRET: string;
  @IsString()
  GOOGLE_CALLBACK_URL: string;
}

export default registerAs(AllConfigTypeEnum.Auth, () => {
  validateConfig(process.env, EnvironmentAuthVarValidator);

  return {
    googleClientID: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleCallbackURL: process.env.GOOGLE_CALLBACK_URL,
  };
});
