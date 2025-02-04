import { ApiProperty } from '@nestjs/swagger';
import { RoleEnum } from '@resources/account/types/account.type';
import { Expose } from 'class-transformer';
import { PackageDiscountDomain } from './package-discount.domain';
import { CategoryDomain } from '@resources/category/domain/category.domain';
import { VoucherTagDomain } from '@resources/category/domain/tag.domain';
import { isUUID } from 'class-validator';

export enum PackageStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class PackageQuotaVoucherDomain {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: String })
  voucherId: string;
  @ApiProperty({ type: Number })
  amount: number;
  @ApiProperty({ type: String })
  packageId?: string;

  @ApiProperty({ type: Date, nullable: true })
  updatedAt?: Date;
  deletedAt?: Date;

  constructor({
    id,
    amount,
    voucherId,
    packageId,
    updatedAt,
    deletedAt,
  }: {
    id: PackageQuotaVoucherDomain['id'];
    voucherId: PackageQuotaVoucherDomain['voucherId'];
    amount: PackageQuotaVoucherDomain['amount'];
    packageId?: PackageQuotaVoucherDomain['packageId'];
    updatedAt?: PackageQuotaVoucherDomain['updatedAt'];
    deletedAt?: PackageQuotaVoucherDomain['deletedAt'];
  }) {
    this.id = id;
    this.amount = amount;
    this.voucherId = voucherId;
    if (packageId && isUUID(packageId)) this.packageId = packageId;

    if (updatedAt) this.updatedAt = updatedAt;

    if (deletedAt) this.deletedAt = deletedAt;
  }
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
  @ApiProperty({ type: () => [PackageQuotaVoucherDomain] })
  quotaVouchers: PackageQuotaVoucherDomain[];
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
    quotaVouchers,
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
    quotaVouchers: PackageQuotaVoucherDomain[];
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
    this.quotaVouchers = quotaVouchers;
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
      'quotaVouchers',
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

  @ApiProperty({ type: Date, nullable: true })
  updatedAt?: Date;

  deletedAt?: Date;

  constructor({
    id,
    amount,
    voucherId,
    deletedAt,
    img,
    packageId,
    updatedAt,
  }: {
    id: PackageRewardVoucherDomain['id'];
    voucherId: PackageRewardVoucherDomain['voucherId'];
    amount: PackageRewardVoucherDomain['amount'];
    packageId?: PackageRewardVoucherDomain['packageId'];
    img?: PackageRewardVoucherDomain['img'];
    updatedAt?: PackageRewardVoucherDomain['updatedAt'];
    deletedAt?: PackageRewardVoucherDomain['deletedAt'];
  }) {
    this.id = id;
    this.voucherId = voucherId;
    this.amount = amount;
    if (packageId) this.packageId = packageId;
    this.img = img;
    if (updatedAt) this.updatedAt = updatedAt;
    if (deletedAt) this.deletedAt = deletedAt;
  }
}

export type PackageRewardVoucherCreateInput = {
  id: string;
  rewardVoucherId: string;
  amount: number;
  packageId?: string;
  img?: string;
};
