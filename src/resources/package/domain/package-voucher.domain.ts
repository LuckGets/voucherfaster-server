import { ApiProperty } from '@nestjs/swagger';
import { RoleEnum } from '@resources/account/types/account.type';
import { Expose } from 'class-transformer';

export class PackageVoucherDomain {
  @ApiProperty({ type: String })
  id: string;
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
  @ApiProperty({ type: Date })
  startedAt: Date;
  @ApiProperty({ type: Date })
  expiredAt: Date;
  @ApiProperty({ type: Date })
  createdAt?: Date;
  @ApiProperty({ type: Date })
  updatedAt?: Date;
  @ApiProperty({ type: Date })
  @Expose({ groups: [RoleEnum.Admin] })
  deletedAt?: Date;
}

export type PackageVoucherCreateInput = {
  id: string;
  quotaVoucherId: string;
  quotaAmount: number;
  stockAmount: number;
  price: number;
  title: string;
  startedAt: Date;
  expiredAt: Date;
};

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
  @ApiProperty({ type: String })
  packageId?: string;
}

export type PackageRewardVoucherCreateInput = {
  id: string;
  rewardVoucherId: string;
  packageId: string;
};
