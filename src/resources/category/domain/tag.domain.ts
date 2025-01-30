import { ApiProperty } from '@nestjs/swagger';
import { CategoryDomain } from './category.domain';

/**
 * The Domain
 * of voucher tag
 */
export class VoucherTagDomain {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: String })
  category: CategoryDomain['name'];
  @ApiProperty({ type: String })
  name: string;
  @ApiProperty({ type: Date })
  createdAt: Date;
  @ApiProperty({ type: Date })
  updatedAt: Date;
  @ApiProperty({ type: Date, nullable: true })
  deletedAt?: Date;

  constructor({
    id,
    name,
    category,
    createdAt,
    updatedAt,
    deletedAt,
  }: {
    id: VoucherTagDomain['id'];
    name: VoucherTagDomain['name'];
    category: VoucherTagDomain['category'];
    createdAt: VoucherTagDomain['createdAt'];
    updatedAt: VoucherTagDomain['updatedAt'];
    deletedAt: VoucherTagDomain['deletedAt'];
  }) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt ?? null;
  }
}
