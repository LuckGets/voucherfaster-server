import { registerAs } from '@nestjs/config';
import { OwnerConfig } from './owner-config.type';
import { AllConfigTypeEnum } from 'src/config/all-config.type';
import validateConfig from '@utils/validateConfig';
import { IsString } from 'class-validator';

class EnvironmentOwnerVarValidator {
  @IsString()
  PASSWORD_FOR_REDEEM_SECRET: string;
}

export default registerAs<OwnerConfig>(AllConfigTypeEnum.Owner, () => {
  validateConfig(process.env, EnvironmentOwnerVarValidator);

  return {
    passwordForRedeemSecret: process.env.PASSWORD_FOR_REDEEM_SECRET,
  };
});
