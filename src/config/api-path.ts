export enum AccountPath {
  Name = 'account',
  Base = '/account',
  Update = '/:accountId',
  ChangePassword = ':accountId/password',
  Reverify = '/:accountId/reverify',
  AccountIdParam = 'accountId',
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
