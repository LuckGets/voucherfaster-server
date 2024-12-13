import { AuthConfig } from '../application/auth/config/auth-config.type';
import { AppConfig } from './app-config.type';

export enum AllConfigTypeEnum {
  App = 'app',
  Auth = 'auth',
}

export type AllConfigType = {
  app: AppConfig;
  auth: AuthConfig;
};
