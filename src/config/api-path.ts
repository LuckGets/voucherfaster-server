export enum AccountPath {
  Name = 'account',
  Base = '/account',
  Update = '/:accountId',
  Me = '/me',
  ChangePassword = ':accountId/password',
  ConfirmChangePassword = '/password/confirm',
  AccountIdParam = 'accountId',
  Verify = '/verify',
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
  Base = 'auth/google',
  Login = '/login',
  Callback = '/callback',
}

export const VoucherPath = {
  Name: 'vouchers',
  Base: '/vouchers',
  VoucherIdParm: 'voucherId',
  GetVoucherId: ':voucherId',
  UpdateVoucher: ':voucherId',
  SearchVoucher: 'search/:search',
  SearchVoucherParam: 'search',
  AddVoucherImg: ':voucherId/images',
  UpdateVoucherImg: ':voucherId/images/:imageId',
  TagQuery: 'tag',
  CategoryQuery: 'category',
} as const;

export const VoucherCategoryPath = {
  Name: 'categories',
  Base: '/categories',
  TagsName: 'tags',
  CreateTag: ':categoryId/tags',
  UpdateTag: ':categoryId/tags/:tagId',
  CategoryQuery: 'category',
} as const;

export const VoucherPromotionPath = {
  Name: 'promotions',
  Base: '/promotions',
  GetManyPromotion: `/promotions`,
  PromotionParmId: 'promotionId',
  PromotionNameQuery: 'name',
  GetPromotionById: `:${VoucherPath.VoucherIdParm}/promotions/:promotionId`,
  DeletePromotion: `:${VoucherPath.VoucherIdParm}/promotions/:promotionId`,
  CreatePromotion: `:${VoucherPath.VoucherIdParm}/promotions`,
  UpdatePromotion: `:${VoucherPath.VoucherIdParm}/promotions/:promotionId`,
} as const;

export const PackageVoucherPath = {
  Name: 'packages',
  Base: '/packages',
  GetPackageById: ':packageId',
  UpdatePackage: ':packageId',
  PackageParamId: 'packageId',
  DeletePackage: ':packageId',
  CreatePackageImage: '/images',
} as const;

export const OwnerPath = {
  Name: 'owners',
  Base: '/owners',
  Image: '/images',
  UpdateImage: '/images/:imageId',
} as const;
