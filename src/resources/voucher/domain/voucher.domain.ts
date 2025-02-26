import { ApiProperty } from '@nestjs/swagger';
import { VoucherDiscountDomain } from './voucher-discount.domain';
import { VoucherTagDomain } from '@resources/category/domain/tag.domain';
import { CategoryDomain } from '@resources/category/domain/category.domain';
import {
  ProductDomain,
  ProductImgDomain,
  ProductStatusEnum,
} from '@resources/product/domain/product.domain';

/**
 * The Domain
 * of voucher
 */
export class VoucherDomain extends ProductDomain {
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
    images,
    discount,
    tag,
    category,
    createdAt,
    updatedAt,
  }: {
    id: ProductDomain['id'];
    title: ProductDomain['title'];
    status: ProductDomain['status'];
    stockAmount: ProductDomain['stockAmount'];
    description: ProductDomain['description'];
    price: ProductDomain['price'];
    usableAt: ProductDomain['usableAt'];
    usableExpiredAt: ProductDomain['usableExpiredAt'];
    termAndCondition?: ProductDomain['termAndCondition'];
    sellStartedAt: ProductDomain['sellStartedAt'];
    sellExpiredAt: ProductDomain['sellExpiredAt'];
    images: ProductDomain['images'];
    discount?: ProductDomain['discount'];
    category: ProductDomain['category'];
    tag: ProductDomain['tag'];
    createdAt: ProductDomain['createdAt'];
    updatedAt: ProductDomain['updatedAt'];
  }) {
    super({
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
      images,
      discount,
      category,
      tag,
      createdAt,
      updatedAt,
    });
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
      'images',
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
      'images',
      'stockAmount',
      'usableExpiredAt',
      'sellExpiredAt',
    ];
  }
}

/**
 * The Voucher Image Domain
 */
export class VoucherImgDomain extends ProductImgDomain {
  @ApiProperty({ type: () => String })
  voucherId?: string;
}

/**
 * The input type
 * for creating voucher image
 */
export type VoucherImgCreateInput = Pick<
  ProductImgDomain,
  'id' | 'imgPath' | 'mainImg'
> & { voucherId: VoucherDomain['id'] };

/**
 * The input type
 * for updating voucher image
 */
export type VoucherImgUpdateInput = Pick<VoucherImgDomain, 'imgPath'>;
