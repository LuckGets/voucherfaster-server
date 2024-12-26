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

export const VoucherPath = {
  Name: 'vouchers',
  Base: '/vouchers',
  VoucherIdParm: 'voucherId',
  GetVoucherId: ':voucherId',
  UpdateVoucher: ':voucherId',
  AddVoucherImg: ':voucherId/images',
  UpdateVoucherImg: ':voucherId/images/:imageId',
  TagsName: 'tags',
  TagQuery: 'tag',
  CreateTag: '/categories/:categoryId/tags',
  Category: '/categories',
  CategoryQuery: 'category',
  UpdateTag: '/categories/:categoryId/tags/:tagId',
} as const;
