export type Role = {
  User: 'USER';
  Admin: 'ADMIN';
};

export enum AccountProviderEnum {
  Local = 'LOCAL',
  Google = 'GOOGLE',
}

export type AccountProvider = AccountProviderEnum;
