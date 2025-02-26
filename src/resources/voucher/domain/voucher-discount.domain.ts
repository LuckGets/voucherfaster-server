import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsPositive, IsUUID } from 'class-validator';
import { VoucherDomain } from './voucher.domain';
import { ProductDiscountDomain } from '@resources/product/domain/product.domain';

export class VoucherDiscountDomain extends ProductDiscountDomain {
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
    super({
      id,
      discountedPrice,
      createdAt,
      updatedAt,
      status: status ?? null,
    });
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
