import { ApiProperty } from '@nestjs/swagger';
import { RoleEnum } from '@resources/account/types/account.type';
import { Expose, Transform } from 'class-transformer';
import { IsPositive, IsString, IsUUID } from 'class-validator';
import { VoucherDomain } from './voucher.domain';

// Enum for voucher discount
export enum VoucherDiscountStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class VoucherDiscountDomain {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: Number })
  discountedPrice: number;
  @Expose({ groups: [RoleEnum.Admin] })
  createdAt?: Date;
  @ApiProperty({ type: Date })
  @Expose({ groups: [RoleEnum.Admin] })
  updatedAt?: Date;
  @ApiProperty({ type: () => VoucherDiscountStatusEnum })
  status: VoucherDiscountStatusEnum;
  @ApiProperty({ type: Date })
  @Expose({ groups: [RoleEnum.Admin] })
  deletedAt?: Date;

  constructor({
    id,
    discountedPrice,
    createdAt,
    updatedAt,
    status,
  }: {
    id?: VoucherDiscountDomain['id'];
    discountedPrice: VoucherDiscountDomain['discountedPrice'];
    createdAt?: VoucherDiscountDomain['createdAt'];
    updatedAt?: VoucherDiscountDomain['updatedAt'];
    status: VoucherDiscountDomain['status'];
  }) {
    this.id = id;
    this.discountedPrice = discountedPrice;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.status = status ?? null;
  }
}

export class VoucherDiscountCreateInput {
  @IsUUID(7)
  @ApiProperty({ type: String })
  id: string;
  @IsUUID(7)
  @ApiProperty({ type: String })
  voucherId: VoucherDomain['id'];
  @IsPositive()
  @Transform(({ value }) => Number(value))
  @ApiProperty({ type: Number })
  discountedPrice: number;
}
