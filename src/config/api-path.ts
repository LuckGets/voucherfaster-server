export enum AccountPath {
  Name = 'account',
  Base = '/account',
  Update = '/:accountId',
  Me = '/me',
  ChangePassword = ':accountId/password',
  ConfirmChangePassword = '/password/confirm',
  AccountIdParam = 'accountId',
  Verify = ':accountId/verify',
}
export enum AuthPath {
  Name = 'auth',
  Base = '/auth',
  Login = '/login',
  Register = '/register',
  Refresh = '/refresh',
  Logout = '/logout',
}

export enum AuthGooglePath {
  Login = '/login',
  Callback = '/callback',
}

export enum VoucherPath {
  Name = 'vouchers',
  Base = '/vouchers',
  TagsName = 'tags',
  Tag = '/categories/:categoryId/tags',
  Category = '/categories',
  UpdateTag = '/categories/:categoryId/tags/:tagId',
}
