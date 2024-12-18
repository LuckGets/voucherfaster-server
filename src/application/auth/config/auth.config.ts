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
  MinLength,
} from 'class-validator';
import { AuthConfig } from './auth-config.type';

class EnvironmentAuthVarValidator {
  @IsString()
  @MinLength(8)
  ACCESS_TOKEN_SECRET: string;
  @IsString()
  @Matches(/^\d{1,2}m$/)
  ACCESS_TOKEN_EXPIRES_IN: string;

  @IsString()
  @MinLength(8)
  REFRESH_TOKEN_SECRET: string;
  @IsString()
  @Matches(/^\d{1,2}d$/)
  REFRESH_TOKEN_EXPIRES_IN: string;
  @IsNumber()
  @Min(10)
  @Max(14)
  BCRYPT_SALT_ROUND: number;
  @IsString()
  @IsNotEmpty()
  VERIFY_EMAIL_SECRET: string;
  @IsString()
  @Matches(/^\d{1}d$/)
  @IsOptional()
  VERIFY_EMAIL_EXPIRE_TIME: string;
}

export default registerAs<AuthConfig>(AllConfigTypeEnum.Auth, () => {
  validateConfig(process.env, EnvironmentAuthVarValidator);

  return {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    accessTokenExpireTime: process.env.ACCESS_TOKEN_EXPIRES_IN,
    refreshTokenExpireTime: process.env.REFRESH_TOKEN_EXPIRES_IN,
    bcryptSaltRound: Number(process.env.BCRYPT_SALT_ROUND) || 11,
    verifyEmailSecret: process.env.ACCESS_TOKEN_EXPIRES_IN,
    verifyEmailExpiredTime: process.env.VERIFY_EMAIL_EXPIRE_TIME ?? '3d',
  };
});
