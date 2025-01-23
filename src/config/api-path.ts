export enum AccountPath {
  Name = 'account',
  Base = '/account',
  Update = '/:accountId',
  Me = '/me',
  ChangePassword = ':accountId/password',
  ConfirmChangePassword = '/confirm-password',
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
  VoucherImageIdParam: 'imageId',
  AddVoucherImg: ':voucherId/images',
  UpdateVoucherImg: ':voucherId/images/:imageId',
  DeleteVoucherImgById: ':voucherId/images/:imageId',
  TagQuery: 'tag',
  CategoryQuery: 'category',
  StatusQuery: 'status',
  SellDateQuery: 'sellDate',
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
  ImageIdParam: 'imageId',
  CreatePackageImage: '/images',
  UpdatePackageImage: '/images/:imageId',
  DeletePackageImage: '/images/:imageId',
  GetPackageCategoryQuery: 'category',
  GetPackageSellDateQuery: 'sellDate',
  GetPackageStatusQuery: 'status',
} as const;

export const UsableDaysPath = {
  Name: 'usabledays',
  Base: '/usabledays',
};

export const OrderPath = {
  Name: 'orders',
  Base: '/orders',
  OrderIdParam: 'orderId',
  GetOrderById: `:orderId`,
  GetOrdersQueryCursor: 'cursor',
  GetOrdersQueryTransactionStatus: 'tstatus',
  ProcessPayment: ':orderId/payment',
} as const;

export const OrderItemPath = {
  Name: 'order-items',
  Base: '/order-items',
  Redeem: '/:itemId/redeem',
  OrderItemIdParm: 'itemId',
};

export const TransactionPath = {
  Name: 'transactions',
  Base: '/transactions',
  CreatePaymentToken: '/token',
} as const;

export const OwnerPath = {
  Name: 'owners',
  Base: '/owners',
  Image: '/images',
  ImageIdParam: 'imageId',
  UpdateImage: '/images/:imageId',
  DeleteImage: '/images/:imageId',
} as const;

export const FRONTEND_PATH = {
  VERIFIY: 'confirm-email',
  RETRIEVE_ORDER_ITEM: 'order-item',
};
