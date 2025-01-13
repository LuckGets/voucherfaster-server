import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';
import { RoleEnum } from '@resources/account/types/account.type';
import { Expose, Transform } from 'class-transformer';
import { VoucherPromotionDomain } from './voucher-promotion.domain';

export enum VoucherStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

/**
 * The Domain
 * of voucher
 */
export class VoucherDomain {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: String })
  title: string;
  @Expose({
    toClassOnly: true,
  })
  @ApiProperty({ type: () => VoucherStatusEnum })
  status: VoucherStatusEnum;
  @ApiProperty({ type: () => String })
  description: string;
  @Transform(({ value }) =>
    value instanceof Decimal ? value.toNumber() : Number(value),
  )
  @ApiProperty({ type: () => Number })
  price: number;
  @ApiProperty({ type: () => Date })
  usageExpiredTime: Date;
  @ApiProperty({ type: () => Object })
  termAndCond?: { th: string[]; en: string[] };
  @ApiProperty({ type: () => Date })
  saleExpiredTime: Date;
  @ApiProperty({
    type: () => Object,
    example: [{ imgPath: 'https://picsum.photos/100/200', mainImg: true }],
  })
  img?: Partial<VoucherImgDomain>[];
  promotion?: Partial<VoucherPromotionDomain>[];
}

export type VoucherDomainCreateInput = Omit<VoucherDomain, 'img'> & {
  tagId: VoucherTagDomain['id'];
};

export class VoucherCategoryDomain {
  @Expose()
  @ApiProperty({ type: String })
  id: string;
  @Expose()
  @ApiProperty({ type: String })
  name: string;
  @Expose({
    groups: [RoleEnum.Admin],
  })
  @ApiProperty({ type: Date })
  createdAt: Date;
  @Expose({
    groups: [RoleEnum.Admin],
  })
  @ApiProperty({ type: Date })
  updatedAt: Date;
  @Expose({
    groups: [RoleEnum.Admin],
  })
  @ApiProperty({ type: Date, nullable: true })
  deletedAt?: Date;
  @Expose()
  @ApiProperty({ type: () => [VoucherTagDomain], nullable: true })
  voucherTags?: VoucherTagDomain[];
}

/**
 * The Domain
 * of voucher tag
 */
export class VoucherTagDomain {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: String })
  categoryId: string;
  @ApiProperty({ type: String })
  name: string;
  @Expose({
    groups: [RoleEnum.Admin],
  })
  @ApiProperty({ type: Date })
  createdAt: Date;
  @Expose({
    groups: [RoleEnum.Admin],
  })
  @ApiProperty({ type: Date })
  updatedAt: Date;
  @Expose({
    groups: [RoleEnum.Admin],
  })
  @ApiProperty({ type: Date, nullable: true })
  deletedAt?: Date;
}

/**
 * The Domain
 * of term and condition
 * of one voucher
 */
export class VoucherTermAndCondDomain {
  id: string;
  description: string;
  voucherId: string;
  createdAt: Date;
  updatedAt: Date;
  inactiveAt?: Date;
}
/**
 * The input type
 * for creating voucher term and condition
 */
export type VoucherTermAndCondCreateInput = Omit<
  VoucherTermAndCondDomain,
  'createdAt' | 'updatedAt' | 'inactiveAt'
>;

/**
 * The Voucher Image Domain
 */
export class VoucherImgDomain {
  id: string;
  imgPath: string;
  voucherId: string;
  mainImg: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * The input type
 * for creating voucher image
 */
export type VoucherImgCreateInput = Pick<
  VoucherImgDomain,
  'id' | 'imgPath' | 'voucherId' | 'mainImg'
>;

/**
 * The input type
 * for updating voucher image
 */
export type VoucherImgUpdateInput = Pick<VoucherImgDomain, 'imgPath'>;
