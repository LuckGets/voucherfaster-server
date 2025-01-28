import { ApiProperty } from '@nestjs/swagger';
import { AccountDomain } from '@resources/account/domain/account.domain';
import {
  PackageImgDomain,
  PackageVoucherDomain,
} from '@resources/package/domain/package-voucher.domain';
import { VoucherDiscountDomain } from '@resources/voucher/domain/voucher-discount.domain';
import {
  VoucherCategoryDomain,
  VoucherDomain,
  VoucherImgDomain,
} from '@resources/voucher/domain/voucher.domain';
import { OrderDomain } from '../../order/domain/order.domain';
import { PackageDiscountDomain } from '@resources/package/domain/package-discount.domain';

export type OrderItemDetailDiscountField = {
  discountId: VoucherDiscountDomain['id'] | PackageDiscountDomain['id'];
};

export type OrderItemDetailPackageField = {
  packageId: PackageVoucherDomain['id'];
  name: PackageVoucherDomain['title'];
  reward: boolean;
};

export class OrderItemDetails {
  voucherId: VoucherDomain['id'];
  title: VoucherDomain['title'];
  price:
    | VoucherDomain['price']
    | PackageVoucherDomain['price']
    | VoucherDiscountDomain['discountedPrice']
    | PackageDiscountDomain['discountedPrice'];
  category: VoucherCategoryDomain['name'];
  usableExpiredAt: Date | string;
  img: VoucherImgDomain['imgPath'] | PackageImgDomain['imgPath'];
  discount?: OrderItemDetailDiscountField;
  package?: OrderItemDetailPackageField;

  public static getVoucherRequiredFields(): Array<keyof OrderItemDetails> {
    return [
      'voucherId',
      'title',
      'price',
      'category',
      'usableExpiredAt',
      'img',
    ];
  }
  public static getPromotionRequiredFields(): string[] {
    return [...this.getVoucherRequiredFields(), 'promotion'];
  }
  public static getPackageRequiredFields(): string[] {
    return [...this.getVoucherRequiredFields(), 'package'];
  }
}

export enum OrderItemRedeemStatusEnum {
  ALL = 'ALL',
  REDEEMABLE = 'REDEEMABLE',
  REDEEMED = 'REDEEMED',
  EXPIRED = 'EXPIRED',
}

export enum OrderItemTypeEnum {
  VOUCHER = 'VOUCHER',
  PROMOTION = 'PROMOTION',
  PACKAGE = 'PACKAGE',
  ALL = 'ALL',
}

export enum OrderItemSortEnum {
  CREATED_AT = 'createdat',
  EXPIRED_AT = 'expired',
  CODE = 'code',
  FULLNAME = 'fullname',
  EMAIL = 'email',
}

export const ORDER_ITEM_SORT_MAP_TO_DB = {
  [OrderItemSortEnum.CREATED_AT]: 'createdAt',
  [OrderItemSortEnum.EXPIRED_AT]: 'expiredAt',
  [OrderItemSortEnum.CODE]: 'code',
  [OrderItemSortEnum.FULLNAME]: 'fullname',
  [OrderItemSortEnum.EMAIL]: 'email',
} as const;

export class OrderItemDomain {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: String })
  qrcodeImagePath: string;
  @ApiProperty({ type: String })
  code: string;
  @ApiProperty({ type: String })
  order?: Pick<OrderDomain, 'account' | 'transaction' | 'usableDay' | 'id'>;
  @ApiProperty({ type: Date })
  usableAt: Date;
  @ApiProperty({ type: () => Date })
  usableExpiredAt: Date;
  @ApiProperty({ type: Date, nullable: true })
  redeemedAt?: Date | string;
  @ApiProperty({ type: Date })
  updatedAt?: Date;
  @ApiProperty({ type: () => OrderItemDetails })
  detail: OrderItemDetails;

  public static waitForUploadQrCodeImagePath(): string {
    return 'WAITFORUPLOAD';
  }

  public static defaultQrCodeImagePath(): string {
    return 'd22pq9rbvhh9yl.cloudfront.net/qrcode-img/order-item-ID:019488cd-a13d-764f-be0d-0f1db340e5f9';
  }
}

export class OrderItemVoucherDomain {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: () => VoucherDomain })
  voucher: Partial<VoucherDomain>;
  discount?: VoucherDiscountDomain;
}
export class OrderItemPackageDomain {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: () => PackageVoucherDomain })
  package: Partial<PackageVoucherDomain>;
  discount?: PackageDiscountDomain;
}
