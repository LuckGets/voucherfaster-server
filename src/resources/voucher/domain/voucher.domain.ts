import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';
import { Transform } from 'class-transformer';
import { VoucherDiscountDomain } from './voucher-discount.domain';
import { ObjectHelper } from '@utils/services/object.helper';
import { VoucherTagDomain } from '@resources/category/domain/tag.domain';
import { CategoryDomain } from '@resources/category/domain/category.domain';

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
  @ApiProperty({ type: () => Object, enum: VoucherStatusEnum })
  status: VoucherStatusEnum;
  @ApiProperty({ type: Number })
  stockAmount: number;
  @ApiProperty({ type: () => String })
  description: string;
  @Transform(({ value }) =>
    value instanceof Decimal ? value.toNumber() : Number(value),
  )
  @ApiProperty({ type: () => Number })
  price: number;
  @ApiProperty({ type: () => Date })
  usableAt: Date;
  @ApiProperty({ type: () => Date })
  usableExpiredAt: Date;
  @ApiProperty({ type: () => String })
  termAndCondition?: string;
  @ApiProperty({ type: () => Date })
  sellStartedAt: Date;
  @ApiProperty({ type: () => Date })
  sellExpiredAt: Date;
  @ApiProperty({
    type: () => Object,
    example: [{ imgPath: 'https://picsum.photos/100/200', mainImg: true }],
  })
  img?: Partial<VoucherImgDomain>[];
  @ApiProperty({ type: () => Object, nullable: true })
  discount?: VoucherDiscountDomain;
  @ApiProperty({ type: () => String })
  category: CategoryDomain['name'];
  @ApiProperty({ type: () => String })
  tag: VoucherTagDomain['name'];

  constructor({
    id,
    title,
    status,
    stockAmount,
    description,
    price,
    usableAt,
    usableExpiredAt,
    termAndCondition,
    sellStartedAt,
    sellExpiredAt,
    img,
    discount,
    tag,
    category,
  }: {
    id: string;
    title: string;
    status: VoucherStatusEnum;
    stockAmount: number;
    description: string;
    price: number;
    usableAt: Date;
    usableExpiredAt: Date;
    termAndCondition: string;
    sellStartedAt: Date;
    sellExpiredAt: Date;
    img: Partial<VoucherImgDomain>[];
    discount: VoucherDiscountDomain;
    category: CategoryDomain['name'];
    tag: VoucherTagDomain['name'];
  }) {
    this.id = id;
    this.title = title;
    this.status = status;
    this.stockAmount = stockAmount;
    this.description = description;
    this.price = price;
    this.usableAt = usableAt;
    this.usableExpiredAt = usableExpiredAt;
    this.termAndCondition = termAndCondition;
    this.sellStartedAt = sellStartedAt;
    this.sellExpiredAt = sellExpiredAt;
    this.img = [...img];
    this.discount = ObjectHelper.isObjectEmpty(discount)
      ? null
      : { ...discount };
    this.category = category;
    this.tag = tag;
  }

  public static requiredFieldForDetail(): Array<keyof VoucherDomain> {
    return [
      'id',
      'title',
      'description',
      'price',
      'status',
      'category',
      'tag',
      'price',
      'discount',
      'img',
      'stockAmount',
      'termAndCondition',
      'usableExpiredAt',
      'sellExpiredAt',
    ];
  }

  public static requiredFieldForList(): Array<keyof VoucherDomain> {
    return [
      'id',
      'title',
      'description',
      'price',
      'status',
      'category',
      'tag',
      'price',
      'img',
      'stockAmount',
      'usableExpiredAt',
      'sellExpiredAt',
    ];
  }
}

/**
 * The Voucher Image Domain
 */
export class VoucherImgDomain {
  @ApiProperty({ type: () => String })
  id: string;
  @ApiProperty({ type: () => String })
  imgPath: string;
  @ApiProperty({ type: () => String })
  voucherId: string;
  @ApiProperty({ type: () => Boolean })
  mainImg: boolean;
  @ApiProperty({ type: () => Date })
  createdAt: Date;
  @ApiProperty({ type: () => Date })
  updatedAt: Date;
  @ApiProperty({ type: () => Date })
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
