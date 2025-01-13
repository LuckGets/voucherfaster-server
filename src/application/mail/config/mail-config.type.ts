export type MailConfig = {
  port: number;
  host?: string;
  user?: string;
  password?: string;
  encryptKey: string;
  defaultEmail?: string;
  defaultName?: string;
  secure: boolean;
};
