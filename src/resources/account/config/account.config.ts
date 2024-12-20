import { registerAs } from '@nestjs/config';
import validateConfig from '@utils/validateConfig';
import { AllConfigTypeEnum } from 'src/config/all-config.type';
import { AccountConfig } from './account-config.type';
import { IsOptional, IsString, Matches } from 'class-validator';

class EnvironmentAccountVarValidator {
  @IsString()
  CHANGE_PASSWORD_SECRET: string;

  @IsString()
  @Matches(/^\d{1}d$/)
  @IsOptional()
  CHANGE_PASSWORD_EXPIRED: string;
}

export default registerAs<AccountConfig>(AllConfigTypeEnum.Account, () => {
  validateConfig(process.env, EnvironmentAccountVarValidator);
  return {
    changePasswordSecret: process.env.CHANGE_PASSWORD_SECRET,
    changePasswordExpiredTime: process.env.CHANGE_PASSWORD_EXPIRED || '7d',
  };
});
