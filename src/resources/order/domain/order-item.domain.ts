import { ApiProperty } from '@nestjs/swagger';
import { AccountDomain } from '@resources/account/domain/account.domain';
import {
  PackageImgDomain,
  PackageVoucherDomain,
} from '@resources/package/domain/package-voucher.domain';
import { VoucherPromotionDomain } from '@resources/voucher/domain/voucher-promotion.domain';
import {
  VoucherCategoryDomain,
  VoucherDomain,
  VoucherImgDomain,
} from '@resources/voucher/domain/voucher.domain';
import { OrderDomain } from './order.domain';

export type OrderItemDetailPromotionField = {
  promotionId: VoucherPromotionDomain['id'];
  name: VoucherPromotionDomain['name'];
};

export type OrderItemDetailPackageField = {
  packageId: PackageVoucherDomain['id'];
  name: PackageVoucherDomain['title'];
  reward: boolean;
};

export class OrderItemDetails {
  id:
    | VoucherDomain['id']
    | VoucherPromotionDomain['id']
    | PackageVoucherDomain['id'];
  title: VoucherDomain['title'];
  price: number;
  category: VoucherCategoryDomain['name'];
  usableExpiredAt: Date | string;
  img: VoucherImgDomain['imgPath'] | PackageImgDomain['imgPath'];
  promotion?: OrderItemDetailPromotionField;
  package?: OrderItemDetailPackageField;

  public static getVoucherRequiredFields(): Array<keyof OrderItemDetails> {
    return ['id', 'title', 'price', 'category', 'usableExpiredAt', 'img'];
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
  REDEEMED_AT = 'code',
  FULLNAME = 'fullname',
  EMAIL = 'email',
}

export const ORDER_ITEM_SORT_MAP_TO_DB = {
  [OrderItemSortEnum.CREATED_AT]: 'updatedAt',
  [OrderItemSortEnum.EXPIRED_AT]: 'expiredAt',
  [OrderItemSortEnum.REDEEMED_AT]: 'code',
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
}

export class OrderItemPromotionDomain {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: () => VoucherPromotionDomain })
  promotionVoucher: Partial<VoucherPromotionDomain>;
}

export class OrderItemPackageDomain {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: () => PackageVoucherDomain })
  package: Partial<PackageVoucherDomain>;
}
