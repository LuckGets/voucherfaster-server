import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { Decimal } from '@prisma/client/runtime/library';
import { RoleEnum } from '@resources/account/types/account.type';
import { CategoryDomain } from '@resources/category/domain/category.domain';
import { VoucherTagDomain } from '@resources/category/domain/tag.domain';
import { ObjectHelper } from '@utils/services/object.helper';

export enum ProductStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum ProductDiscountStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class ProductImgDomain {
  @ApiProperty({ type: () => String })
  id: string;
  @ApiProperty({ type: () => String })
  imgPath: string;
  @ApiProperty({ type: () => Boolean })
  mainImg: boolean;
  @ApiProperty({ type: () => Date })
  createdAt: Date;
  @ApiProperty({ type: () => Date })
  updatedAt: Date;
  @ApiProperty({ type: () => Date })
  deletedAt?: Date;

  constructor({
    id,
    imgPath,
    mainImg,
    createdAt,
    updatedAt,
  }: {
    id: ProductImgDomain['id'];
    imgPath: ProductImgDomain['imgPath'];
    mainImg: ProductImgDomain['mainImg'];
    createdAt?: ProductImgDomain['createdAt'];
    updatedAt?: ProductImgDomain['updatedAt'];
  }) {
    this.id = id;
    this.imgPath = imgPath;
    this.mainImg = mainImg;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

export class ProductDiscountDomain {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: Number })
  discountedPrice: number;
  @Expose({ groups: [RoleEnum.Admin] })
  createdAt?: Date;
  @ApiProperty({ type: Date })
  @Expose({ groups: [RoleEnum.Admin] })
  updatedAt?: Date;
  @ApiProperty({ type: () => ProductDiscountStatusEnum })
  status: ProductDiscountStatusEnum;
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
    id?: ProductDiscountDomain['id'];
    discountedPrice: ProductDiscountDomain['discountedPrice'];
    createdAt?: ProductDiscountDomain['createdAt'];
    updatedAt?: ProductDiscountDomain['updatedAt'];
    status: ProductDiscountDomain['status'];
  }) {
    this.id = id;
    this.discountedPrice = discountedPrice;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.status = status ?? null;
  }
}

export class ProductDomain {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: String })
  title: string;
  @ApiProperty({ type: () => Object, enum: ProductStatusEnum })
  status: ProductStatusEnum;
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
  images: Partial<ProductImgDomain>[];
  @ApiProperty({ type: () => Object, nullable: true })
  discount?: ProductDiscountDomain;
  @ApiProperty({ type: () => String })
  category: CategoryDomain['name'];
  @ApiProperty({ type: () => String })
  tag: VoucherTagDomain['name'];
  @ApiProperty({ type: () => Date })
  createdAt: Date;
  @ApiProperty({ type: () => Date })
  updatedAt: Date;

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
    termAndCondition: ProductDomain['termAndCondition'];
    sellStartedAt: ProductDomain['sellStartedAt'];
    sellExpiredAt: ProductDomain['sellExpiredAt'];
    images: Partial<ProductImgDomain>[];
    discount?: ProductDiscountDomain;
    category: CategoryDomain['name'];
    tag: VoucherTagDomain['name'];
    createdAt: ProductDomain['createdAt'];
    updatedAt: ProductDomain['updatedAt'];
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
    this.images = [...images];
    this.discount = ObjectHelper.isObjectEmpty(discount)
      ? null
      : { ...discount };
    this.category = category;
    this.tag = tag;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public static requiredFieldForDetail(): Array<keyof ProductDomain> {
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

  public static requiredFieldForList(): Array<keyof ProductDomain> {
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

export type ProductDomainList = {
  products: ProductDomain[];
  totalCount: number;
};
