import { ApiProperty } from '@nestjs/swagger';
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

export type OrderItemDetailPromotionField = {
  name: VoucherPromotionDomain['name'];
};

export type OrderItemDetailPackageField = {
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

  public static getVoucherRequiredFields(): string[] {
    return ['id', 'title', 'price', 'category', 'usageExpiredTime', 'img'];
  }
  public static getPromotionRequiredFields(): string[] {
    return [...this.getVoucherRequiredFields(), 'promotion'];
  }
  public static getPackageRequiredFields(): string[] {
    return [...this.getVoucherRequiredFields(), 'package'];
  }
}

export class OrderItemDomain {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: String })
  qrcodeImagePath: string;
  @ApiProperty({ type: String })
  code: string;
  @ApiProperty({ type: Date })
  redeemedAt?: Date;
  @ApiProperty({ type: Date })
  updatedAt?: Date;
  @ApiProperty({ type: () => OrderItemDetails })
  detail: OrderItemDetails;
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
