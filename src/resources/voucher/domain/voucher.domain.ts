import { ApiProperty } from '@nestjs/swagger';
import { RoleEnum } from '@resources/account/types/account.type';
import { Expose } from 'class-transformer';

export enum VoucherStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class VoucherDomain {
  @ApiProperty({ type: String })
  id: string;
  code: string;
  title: string;
  status: VoucherStatusEnum;
  description: string;
  price: number;
  usageExpiredTime: Date;
  termAndCond?: { th: string[]; en: string[] };
  saleExpiredTime: Date;
  img: { path: string; mainImg: boolean }[];
}

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
