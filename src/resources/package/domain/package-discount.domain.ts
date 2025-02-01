import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsPositive, IsString, IsUUID } from 'class-validator';
import { PackageVoucherDomain } from './package-voucher.domain';
import { RoleEnum } from '@resources/account/types/account.type';

export enum PackageDiscountStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class PackageDiscountDomain {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: Number })
  discountedPrice: number;
  @ApiProperty({ type: Date })
  createdAt?: Date;
  @ApiProperty({ type: Date })
  updatedAt?: Date;
  @ApiProperty({ type: () => PackageDiscountStatusEnum })
  status: PackageDiscountStatusEnum;

  @Expose({ groups: [RoleEnum.Admin] })
  @ApiProperty({ type: Date })
  deletedAt?: Date;

  constructor({
    id,
    discountedPrice,
    createdAt,
    updatedAt,
    status,
  }: {
    id?: string;
    discountedPrice: number;
    createdAt?: Date;
    updatedAt?: Date;
    status: PackageDiscountStatusEnum;
  }) {
    this.id = id;
    this.discountedPrice = discountedPrice;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.status = status;
  }
}

export class DiscountPackageCreateInput {
  @IsUUID(7)
  @ApiProperty({ type: String })
  id: string;
  @IsString()
  @ApiProperty({ type: String })
  name: string;
  @IsUUID(7)
  @ApiProperty({ type: String })
  packageId: PackageVoucherDomain['id'];
  @IsPositive()
  @Transform(({ value }) => Number(value))
  @ApiProperty({ type: Number })
  discountedPrice: number;
}
