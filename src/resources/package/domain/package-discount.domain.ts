import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsPositive, IsString, IsUUID } from 'class-validator';
import { PackageVoucherDomain } from './package-voucher.domain';
import { RoleEnum } from '@resources/account/types/account.type';
import {
  ProductDiscountDomain,
  ProductDiscountStatusEnum,
} from '@resources/product/domain/product.domain';

export class PackageDiscountDomain extends ProductDiscountDomain {
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
    status: PackageDiscountDomain['status'];
  }) {
    super({
      id,
      discountedPrice,
      createdAt,
      updatedAt,
      status: status ?? null,
    });
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
