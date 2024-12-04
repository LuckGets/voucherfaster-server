import { registerAs } from '@nestjs/config';
import { IsEnum, IsOptional, IsInt, Max, IsString } from 'class-validator';
import validateConfig from 'src/utils/validateConfig';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVarValidator {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment;

  @IsInt()
  @Max(65535)
  @IsOptional()
  APP_PORT: number;

  @IsString()
  @IsOptional()
  API_PREFIX: string;
}

export default registerAs('app', () => {
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
