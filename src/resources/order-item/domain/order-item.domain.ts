import { ApiProperty } from '@nestjs/swagger';
import {
  PackageImgDomain,
  PackageVoucherDomain,
} from '@resources/package/domain/package-voucher.domain';
import { VoucherDiscountDomain } from '@resources/voucher/domain/voucher-discount.domain';
import {
  VoucherDomain,
  VoucherImgDomain,
} from '@resources/voucher/domain/voucher.domain';
import { OrderDomain } from '../../order/domain/order.domain';
import { PackageDiscountDomain } from '@resources/package/domain/package-discount.domain';
import { CategoryDomain } from '@resources/category/domain/category.domain';

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
  category: CategoryDomain['name'];
  img: VoucherImgDomain['imgPath'] | PackageImgDomain['imgPath'];
  discountId?: VoucherDiscountDomain['id'] | PackageDiscountDomain['id'];
  package?: OrderItemDetailPackageField;

  constructor({
    voucherId,
    title,
    price,
    category,
    img,
    discountId,
    packageDetail,
  }: {
    voucherId: OrderItemDetails['voucherId'];
    title: OrderItemDetails['title'];
    price: OrderItemDetails['price'];
    category: OrderItemDetails['category'];
    img: OrderItemDetails['img'];
    discountId?: OrderItemDetails['discountId'];
    packageDetail?: OrderItemDetails['package'];
  }) {
    this.voucherId = voucherId;
    this.title = title;
    this.price = price;
    this.category = category;
    this.img = img;
    this.discountId = discountId;
    this.package = packageDetail;
  }

  public static getVoucherRequiredFields(): Array<keyof OrderItemDetails> {
    return ['voucherId', 'title', 'price', 'category', 'img'];
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
  @ApiProperty({ type: Number })
  countNumber: number;
  @ApiProperty({ type: String })
  order?: Pick<OrderDomain, 'account' | 'transaction' | 'id'>;
  @ApiProperty({ type: Date })
  usableAt: Date;
  @ApiProperty({ type: () => Date })
  usableExpiredAt: Date;
  @ApiProperty({ type: Date, nullable: true })
  redeemedAt?: Date | string;
  @ApiProperty({ type: Date })
  updatedAt?: Date;
  @ApiProperty({ type: () => Object })
  detail: OrderItemDetails;

  constructor({
    id,
    qrcodeImagePath,
    code,
    countNumber,
    order,
    usableAt,
    usableExpiredAt,
    redeemedAt,
    updatedAt,
    detail,
  }: {
    id: OrderItemDomain['id'];
    qrcodeImagePath: OrderItemDomain['qrcodeImagePath'];
    code: OrderItemDomain['code'];
    countNumber: OrderItemDomain['countNumber'];
    order?: OrderItemDomain['order'];
    usableAt: OrderItemDomain['usableAt'];
    usableExpiredAt: OrderItemDomain['usableExpiredAt'];
    redeemedAt?: OrderItemDomain['redeemedAt'];
    updatedAt?: OrderItemDomain['updatedAt'];
    detail: OrderItemDomain['detail'];
  }) {
    this.id = id;
    this.qrcodeImagePath = qrcodeImagePath;
    this.code = code;
    this.countNumber = countNumber;
    this.order = order;
    this.usableAt = usableAt;
    this.usableExpiredAt = usableExpiredAt;
    this.redeemedAt = redeemedAt;
    this.updatedAt = updatedAt;
    this.detail = detail;
  }

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
