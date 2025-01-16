import { ApiProperty } from '@nestjs/swagger';
import { PackageVoucherDomain } from '@resources/package/domain/package-voucher.domain';
import { VoucherPromotionDomain } from '@resources/voucher/domain/voucher-promotion.domain';
import { VoucherDomain } from '@resources/voucher/domain/voucher.domain';

export class OrderItemDomain {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: String })
  qrcodeImagePath: string;
  @ApiProperty({ type: Date })
  redeemedAt?: Date;
  @ApiProperty({ type: Date })
  updatedAt?: Date;
  item:
    | OrderItemVoucherDomain
    | OrderItemPromotionDomain
    | OrderItemPackageDomain;
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
