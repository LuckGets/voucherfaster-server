import { UpdateOwnerPasswordForRedeem } from '@resources/owner/dto/update-owner.dto';

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

const CATEGORIES_CONST = {
  NAME: 'categories',
  PARAM_ID: 'categoryId',
  TAG_NAME: 'tags',
  PARAM_TAG_ID: 'tagId',
};

export const CategoryPath = {
  Name: `${CATEGORIES_CONST.NAME}`,
  Base: `/${CATEGORIES_CONST.NAME}`,
  GetManyTag: `/:${CATEGORIES_CONST.PARAM_ID}/${CATEGORIES_CONST.TAG_NAME}`,
  CreateTag: `/:${CATEGORIES_CONST.PARAM_ID}/${CATEGORIES_CONST.TAG_NAME}`,
  UpdateTag: `:${CATEGORIES_CONST.PARAM_ID}/${CATEGORIES_CONST.TAG_NAME}/:${CATEGORIES_CONST.PARAM_TAG_ID}`,
  CategoryQuery: 'category',
} as const;

// const VoucherDiscountPathName = 'discount';

// export const VoucherDiscountPath = {
//   Name: `${VoucherDiscountPathName}`,
//   Base: `/${VoucherDiscountPathName}`,
//   DeleteDiscount: `:${VoucherPath.VoucherIdParm}/${VoucherDiscountPathName}/:promotionId`,
//   CreateDiscount: `:${VoucherPath.VoucherIdParm}/${VoucherDiscountPathName}`,
//   UpdateDiscount: `:${VoucherPath.VoucherIdParm}/${VoucherDiscountPathName}/:promotionId`,
// } as const;

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
  GetById: '/:itemId',
  GetBySearchContent: '/search/:search',
  OrderItemIdParm: 'itemId',
  SortQuery: 'sort',
  CategoryQuery: 'category',
  StatusQuery: 'status',
  TypeQuery: 'type',
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
};
