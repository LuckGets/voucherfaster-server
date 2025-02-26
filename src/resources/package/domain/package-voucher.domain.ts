import { ApiProperty } from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import { ProductDomain } from '@resources/product/domain/product.domain';

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

export class PackageVoucherDomain extends ProductDomain {
  @ApiProperty({ type: () => [PackageQuotaVoucherDomain] })
  quotaVouchers: PackageQuotaVoucherDomain[];
  @ApiProperty({ type: () => [PackageRewardVoucherDomain] })
  rewardVouchers: PackageRewardVoucherDomain[];

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
    discount?: PackageVoucherDomain['discount'];
    tag: PackageVoucherDomain['tag'];
    status: PackageVoucherDomain['status'];
    quotaVouchers: PackageQuotaVoucherDomain[];
    sellExpiredAt: PackageVoucherDomain['sellExpiredAt'];
    sellStartedAt: PackageVoucherDomain['sellStartedAt'];
    stockAmount: PackageVoucherDomain['stockAmount'];
    title: PackageVoucherDomain['title'];
    rewardVouchers?: PackageVoucherDomain['rewardVouchers'];
    termAndCondition?: PackageVoucherDomain['termAndCondition'];
    usableAt: PackageVoucherDomain['usableAt'];
    usableExpiredAt: PackageVoucherDomain['usableExpiredAt'];
    createdAt?: PackageVoucherDomain['createdAt'];
    updatedAt?: PackageVoucherDomain['updatedAt'];
  }) {
    super({
      id,
      category,
      description,
      images,
      price,
      discount,
      status,
      tag,
      sellExpiredAt,
      sellStartedAt,
      stockAmount,
      title,
      termAndCondition,
      usableAt,
      usableExpiredAt,
      createdAt,
      updatedAt,
    });
    this.quotaVouchers = quotaVouchers;
    if (rewardVouchers) this.rewardVouchers = rewardVouchers;
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
