export enum RoleEnum {
  User = 'USER',
  Admin = 'ADMIN',
  Me = 'ME',
}

export type Role = Exclude<RoleEnum, RoleEnum.Me>;

export enum AccountProviderEnum {
  Local = 'LOCAL',
  Google = 'GOOGLE',
}

export type AccountProvider = AccountProviderEnum;
