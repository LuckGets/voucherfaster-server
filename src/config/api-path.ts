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
  TagQuery: 't',
  CategoryQuery: 'c',
  StatusQuery: 's',
  SellDateQuery: 'sd',
  DiscountQuery: 'd',
} as const;

export const CATEGORIES_CONST = {
  NAME: 'categories',
  PARAM_ID: 'categoryId',
  TAG_NAME: 'tags',
  PARAM_TAG_ID: 'tagId',
};

export const CategoryPath = {
  Name: `${CATEGORIES_CONST.NAME}`,
  Base: `/${CATEGORIES_CONST.NAME}`,
  GetCategoryById: `/:${CATEGORIES_CONST.PARAM_ID}`,
  UpdateCategory: `:${CATEGORIES_CONST.PARAM_ID}`,
  DeleteCategory: `/:${CATEGORIES_CONST.PARAM_ID}`,
  GetManyTag: `${CATEGORIES_CONST.TAG_NAME}`,
  CreateTag: `/:${CATEGORIES_CONST.PARAM_ID}/${CATEGORIES_CONST.TAG_NAME}`,
  UpdateTag: `:${CATEGORIES_CONST.PARAM_ID}/${CATEGORIES_CONST.TAG_NAME}`,
  CategoryQuery: 'category',
} as const;

export const PACKAGE_CONST = {
  NAME: 'packages',
  PARAM_ID: 'packageId',
  QUOTA_PARAM_ID: 'quotaId',
  REWARD_PARAM_ID: 'rewardId',
} as const;

export const PackageVoucherPath = {
  Base: `/${PACKAGE_CONST.NAME}`,
  GetPackageById: `:${PACKAGE_CONST.PARAM_ID}`,
  UpdatePackage: `:${PACKAGE_CONST.PARAM_ID}`,
  PackageParamId: `${PACKAGE_CONST.PARAM_ID}`,
  DeletePackage: `:${PACKAGE_CONST.PARAM_ID}`,
  ImageIdParam: 'imageId',
  CreatePackageImage: '/images',
  UpdatePackageImage: '/images/:imageId',
  DeletePackageImage: '/images/:imageId',
  GetPackageCategoryQuery: 'c',
  GetPackageTagQuery: 't',
  GetPackageSellDateQuery: 'sd',
  GetPackageStatusQuery: 's',
  GetPackageDiscountQuery: 'd',
  AddNewQuotaVoucher: `:${PACKAGE_CONST.PARAM_ID}/quotas`,
  UpdateQuotaVoucher: `:${PACKAGE_CONST.PARAM_ID}/quotas`,
  DeleteQuotaVoucher: `:${PACKAGE_CONST.PARAM_ID}/quotas/:${PACKAGE_CONST.QUOTA_PARAM_ID}`,
  AddNewRewardVoucher: `:${PACKAGE_CONST.PARAM_ID}/rewards`,
  UpdateRewardVoucher: `:${PACKAGE_CONST.PARAM_ID}/rewards`,
  DeleteRewardVoucher: `:${PACKAGE_CONST.PARAM_ID}/rewards/:${PACKAGE_CONST.REWARD_PARAM_ID}`,
} as const;

export const PRODUCT_CONST = {
  BASE: '/products',
};

export const ProductPath = {
  Base: `${PRODUCT_CONST.BASE}`,
  GetManyProduct: `${PRODUCT_CONST.BASE}`,
  CategoryQuery: 'c',
  TagQuery: 't',
  StatusQuery: 's',
  DiscountQuery: 'd',
  SellDateQuery: 'sd',
  SortQuery: 'sort',
};

export const OrderPath = {
  Name: 'orders',
  Base: '/orders',
  Me: '/me',
  OrderIdParam: 'orderId',
  GetOrderById: `:orderId`,
  GetOrdersQueryCursor: 'cursor',
  GetOrdersQueryTransactionStatus: 'tstatus',
  ProcessPayment: ':orderId/payment',
} as const;

export const ORDER_ITEM_CONST = {
  NAME: 'order-items',
  PARAM_ID: 'itemId',
  SEARCH: 'search',
};

export const OrderItemPath = {
  Name: `${ORDER_ITEM_CONST.NAME}`,
  Base: '/order-items',
  GetById: `/:${ORDER_ITEM_CONST.PARAM_ID}`,
  GetBySearchContent: `/search/:${ORDER_ITEM_CONST.SEARCH}`,
  ResendQRCode: `/:${ORDER_ITEM_CONST.PARAM_ID}/resend`,
  UpdateOrderItem: `/:${ORDER_ITEM_CONST.PARAM_ID}`,
  SortQuery: 's',
  CategoryQuery: 'c',
  StatusQuery: 's',
  TypeQuery: 't',
};

export const RedeemItemPath = {
  Name: 'redeem',
  Base: '/redeem',
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
  GetPasswordForRedeem: '/password',
  UpdateOwnerPasswordForRedeem: '/password',
  ImageIdParam: 'imageId',
  UpdateImage: '/images/:imageId',
  DeleteImage: '/images/:imageId',
} as const;

export const FRONTEND_PATH = {
  VERIFIY: 'confirm-email',
  REDEEM_ORDER_ITEM: 'redeem-order-item',
  GOOGLE_SUCCESS: 'google-success',
};
