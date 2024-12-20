import { MailConfig } from '@application/mail/config/mail-config.type';
import { AuthGoogleConfig } from '../application/auth-google/config/auth-google-config.type';
import { AuthConfig } from '../application/auth/config/auth-config.type';
import { AppConfig } from './app-config.type';
import { ClientConfig } from './client/client-config.type';
import { AccountConfig } from '@resources/account/config/account-config.type';

export enum AllConfigTypeEnum {
  App = 'app',
  Client = 'client',
  Auth = 'auth',
  Google = 'google',
  Mail = 'mail',
  Account = 'account',
}

export type AllConfigType = {
  app: AppConfig;
  auth: AuthConfig;
  google: AuthGoogleConfig;
  mail: MailConfig;
  client: ClientConfig;
  account: AccountConfig;
};
