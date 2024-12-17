import { registerAs } from '@nestjs/config';
import { MailConfig } from './mail-config.type';
import { AllConfigTypeEnum } from 'src/config/all-config.type';
import validateConfig from '@utils/validateConfig';
import { IsBoolean, IsInt, IsString, Min } from 'class-validator';

class EnvironmentMailVarValidator {
  @IsInt()
  @Min(0)
  MAIL_PORT: number;
  @IsString()
  MAIL_HOST: string;
  @IsString()
  MAIL_USER: string;
  @IsString()
  MAIL_PASSWORD: string;
  @IsBoolean()
  MAIL_IGNORE_TLS: boolean;
  @IsBoolean()
  MAIL_SECURE: boolean;
}

export default registerAs<MailConfig>(AllConfigTypeEnum.Mail, () => {
  validateConfig(process.env, EnvironmentMailVarValidator);
  return {
    port: process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : 587,
    host: process.env.MAIL_HOST,
    user: process.env.MAIL_USER,
    password: process.env.MAIL_PASSWORD,
    ignoreTLS: process.env.MAIL_IGNORE_TLS === 'true',
    secure: process.env.MAIL_SECURE === 'true',
  };
});
