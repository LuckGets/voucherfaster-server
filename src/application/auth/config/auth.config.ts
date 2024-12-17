import { registerAs } from '@nestjs/config';
import validateConfig from '../../../utils/validateConfig';
import { AllConfigTypeEnum } from '../../../config/all-config.type';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { AuthConfig } from './auth-config.type';

class EnvironmentAuthVarValidator {
  @IsString()
  ACCESS_TOKEN_EXPIRES_IN: string;

  @IsNumber()
  @Min(10)
  @Max(14)
  BCRYPT_SALT_ROUND: number;
  @IsString()
  @IsNotEmpty()
  VERIFY_EMAIL_SECRET: string;
  @IsString()
  @Matches(/^\d{1}[d]$/)
  @IsOptional()
  VERIFY_EMAIL_EXPIRE_TIME: string;
}

export default registerAs<AuthConfig>(AllConfigTypeEnum.Auth, () => {
  validateConfig(process.env, EnvironmentAuthVarValidator);

  return {
    accessTokenExpireTime: process.env.ACCESS_TOKEN_EXPIRES_IN,
    bcryptSaltRound: Number(process.env.BCRYPT_SALT_ROUND) || 11,
    verifyEmailSecret: process.env.ACCESS_TOKEN_EXPIRES_IN,
    verifyEmailExpiredTime: process.env.VERIFY_EMAIL_EXPIRE_TIME ?? '3d',
  };
});
