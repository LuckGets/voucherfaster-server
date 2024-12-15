import { AuthGoogleConfig } from '../application/auth-google/config/auth-google-config.type';
import { AuthConfig } from '../application/auth/config/auth-config.type';
import { AppConfig } from './app-config.type';

export enum AllConfigTypeEnum {
  App = 'app',
  Auth = 'auth',
  Google = 'google',
}

export type AllConfigType = {
  app: AppConfig;
  auth: AuthConfig;
  google: AuthGoogleConfig;
};
