import { ApiProperty } from '@nestjs/swagger';
import { RoleEnum } from '@resources/account/types/account.type';
import { Expose } from 'class-transformer';

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
  code: string;
  @ApiProperty({ type: String })
  title: string;
  @ApiProperty({ type: () => VoucherStatusEnum })
  status: VoucherStatusEnum;
  @ApiProperty({ type: () => String })
  description: string;
  @ApiProperty({ type: () => String })
  price: number;
  @ApiProperty({ type: () => Date })
  usageExpiredTime: Date;
  @ApiProperty({ type: () => Object })
  termAndCond?: { th: string[]; en: string[] };
  @ApiProperty({ type: () => Date })
  saleExpiredTime: Date;
}

export type VoucherDomainCreateInput = Omit<VoucherDomain, 'img'> & {
  tagId: VoucherTagDomain['id'];
};

export class VoucherCategoryDomain {
  @ApiProperty({ type: String })
  id: string;
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
