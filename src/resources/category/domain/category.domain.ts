import { ApiProperty } from '@nestjs/swagger';
import { VoucherTagDomain } from './tag.domain';

export class CategoryDomain {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: String })
  name: string;
  @ApiProperty({ type: Date })
  createdAt: Date;
  @ApiProperty({ type: Date })
  updatedAt: Date;
  @ApiProperty({ type: Date, nullable: true })
  deletedAt?: Date;
  @ApiProperty({ type: () => [VoucherTagDomain], nullable: true })
  voucherTags?: VoucherTagDomain[];

  constructor({
    id,
    name,
    createdAt,
    updatedAt,
    deletedAt,
    voucherTags,
  }: {
    id: CategoryDomain['id'];
    name: CategoryDomain['name'];
    createdAt: CategoryDomain['createdAt'];
    updatedAt: CategoryDomain['updatedAt'];
    deletedAt?: CategoryDomain['deletedAt'];
    voucherTags?: CategoryDomain['voucherTags'];
  }) {
    this.id = id;
    this.name = name;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt ?? null;
    this.voucherTags = voucherTags.length > 0 ? voucherTags : [];
  }
}
