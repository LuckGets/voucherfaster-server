import { ApiProperty } from '@nestjs/swagger';
import { RoleEnum } from '@resources/account/types/account.type';
import { Expose } from 'class-transformer';
import { PackageDiscountDomain } from './package-discount.domain';
import { CategoryDomain } from '@resources/category/domain/category.domain';
import { VoucherTagDomain } from '@resources/category/domain/tag.domain';

export enum PackageStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class PackageVoucherDomain {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: String })
  category: CategoryDomain['name'];
  @ApiProperty({ type: String })
  tag: VoucherTagDomain['name'];
  @ApiProperty({ type: () => String })
  description: string;
  @ApiProperty({ type: String })
  quotaVoucherId: string;
  @ApiProperty({ type: Number })
  quotaAmount: number;
  @ApiProperty({ type: Number })
  stockAmount: number;
  @ApiProperty({ type: Number })
  price: number;
  @ApiProperty({ type: () => [PackageRewardVoucherDomain] })
  rewardVouchers: PackageRewardVoucherDomain[];
  @ApiProperty({ type: () => [PackageImgDomain] })
  images: Pick<PackageImgDomain, 'id' | 'mainImg' | 'imgPath'>[];
  @ApiProperty({ type: String })
  title: string;
  @ApiProperty({ type: () => String })
  termAndCondition?: string;
  @ApiProperty({ type: Date })
  sellStartedAt: Date;
  @ApiProperty({ type: Date })
  sellExpiredAt: Date;
  @ApiProperty({ type: Date })
  usableAt: Date;
  @ApiProperty({ type: Date })
  usableExpiredAt: Date;
  @ApiProperty({ type: Date })
  createdAt?: Date;
  @ApiProperty({ type: Date })
  updatedAt?: Date;
  @ApiProperty({ type: () => PackageStatusEnum })
  @Expose({ groups: [RoleEnum.Admin] })
  status: PackageStatusEnum;
  @ApiProperty({ type: () => PackageDiscountDomain })
  discount?: PackageDiscountDomain;

  constructor({
    id,
    category,
    description,
    images,
    price,
    discount,
    status,
    quotaAmount,
    quotaVoucherId,
    sellExpiredAt,
    sellStartedAt,
    stockAmount,
    title,
    tag,
    rewardVouchers,
    termAndCondition,
    usableAt,
    usableExpiredAt,
    createdAt,
    updatedAt,
  }: {
    id: PackageVoucherDomain['id'];
    category: PackageVoucherDomain['category'];
    description: PackageVoucherDomain['description'];
    images: PackageVoucherDomain['images'];
    price: PackageVoucherDomain['price'];
    discount: PackageVoucherDomain['discount'];
    tag: PackageVoucherDomain['tag'];
    status: PackageVoucherDomain['status'];
    quotaAmount: PackageVoucherDomain['quotaAmount'];
    quotaVoucherId: PackageVoucherDomain['quotaVoucherId'];
    sellExpiredAt: PackageVoucherDomain['sellExpiredAt'];
    sellStartedAt: PackageVoucherDomain['sellStartedAt'];
    stockAmount: PackageVoucherDomain['stockAmount'];
    title: PackageVoucherDomain['title'];
    rewardVouchers?: PackageVoucherDomain['rewardVouchers'];
    termAndCondition: PackageVoucherDomain['termAndCondition'];
    usableAt: PackageVoucherDomain['usableAt'];
    usableExpiredAt: PackageVoucherDomain['usableExpiredAt'];
    createdAt?: PackageVoucherDomain['createdAt'];
    updatedAt?: PackageVoucherDomain['updatedAt'];
  }) {
    this.id = id;
    this.category = category;
    this.description = description;
    this.images = images;
    this.price = price;
    this.discount = discount;
    this.status = status;
    this.tag = tag;
    this.quotaAmount = quotaAmount;
    this.quotaVoucherId = quotaVoucherId;
    this.sellExpiredAt = sellExpiredAt;
    this.sellStartedAt = sellStartedAt;
    this.stockAmount = stockAmount;
    this.title = title;
    if (rewardVouchers) this.rewardVouchers = rewardVouchers;
    this.termAndCondition = termAndCondition;
    this.usableAt = usableAt;
    this.usableExpiredAt = usableExpiredAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public static getRequiredFieldForList(): Array<keyof PackageVoucherDomain> {
    return [
      'id',
      'category',
      'description',
      'images',
      'price',
      'status',
      'quotaAmount',
      'quotaVoucherId',
      'sellExpiredAt',
      'sellStartedAt',
      'stockAmount',
      'title',
      'usableAt',
      'usableExpiredAt',
      'createdAt',
    ];
  }

  public static getRequiredFieldForDetail(): Array<keyof PackageVoucherDomain> {
    return [...this.getRequiredFieldForList(), 'termAndCondition'];
  }
}

export class PackageImgDomain {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: String })
  imgPath: string;
  @ApiProperty({ type: Boolean })
  mainImg: boolean;
  @ApiProperty({ type: Date })
  createdAt?: Date;
  @ApiProperty({ type: Date })
  updatedAt?: Date;
}

export type PackageImgCreateInput = {
  id: string;
  imgPath: string;
  mainImg: boolean;
  packageId: PackageVoucherDomain['id'];
};

export class PackageRewardVoucherDomain {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: String })
  voucherId: string;
  @ApiProperty({ type: Number })
  amount: number;
  @ApiProperty({ type: String })
  packageId?: string;
  @ApiProperty({ type: String, nullable: true })
  img?: string;
}

export type PackageRewardVoucherCreateInput = {
  id: string;
  rewardVoucherId: string;
  amount: number;
  packageId?: string;
  img?: string;
};
