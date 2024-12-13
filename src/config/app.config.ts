import { registerAs } from '@nestjs/config';
import { IsOptional, IsInt, Max, IsString } from 'class-validator';
import validateConfig from 'src/utils/validateConfig';
import { AllConfigTypeEnum } from './all-config.type';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVarValidator {
  @IsInt()
  @Max(65535)
  @IsOptional()
  APP_PORT: number;

  @IsString()
  @IsOptional()
  API_PREFIX: string;
}

export default registerAs(AllConfigTypeEnum.App, () => {
  validateConfig(process.env, EnvironmentVarValidator);

  return {
    nodeEnv: process.env.NODE_ENV || Environment.Development,
    host: process.env.SERVER_HOST || 'localhost',
    name: process.env.APP_NAME || 'voucherfaster',
    desc: process.env.APP_DESC || 'The server for voucherfaster project',
    workingDir: process.cwd(),
    port: process.env.APP_PORT ? parseInt(process.env.APP_PORT) : 8000,
    apiPrefix: process.env.API_PREFIX || 'api',
    apiVersion: process.env.API_VERSION || 'v1',
  };
});
