import { ApiProperty } from '@nestjs/swagger';
import { RoleEnum } from '@resources/account/types/account.type';
import { Expose } from 'class-transformer';

export class PackageVoucherTermAndCondTHDomain {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: String })
  description: string;
  @ApiProperty({ type: String })
  packageVoucherId: string;
  @ApiProperty({ type: Date })
  @Expose({ groups: [RoleEnum.Admin] })
  createdAt?: Date;
  @ApiProperty({ type: Date })
  @Expose({ groups: [RoleEnum.Admin] })
  updatedAt?: Date;
  @ApiProperty({ type: Date })
  @Expose({ groups: [RoleEnum.Admin] })
  inactiveAt?: Date;
}

export type packageVoucherTermAndCondTHCreateInput = {
  id: string;
  description: string;
  packageVoucherId: string;
};

export class PackageVoucherTermAndCondENDomain {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: String })
  description: string;
  @ApiProperty({ type: String })
  packageVoucherId: string;
  @ApiProperty({ type: Date })
  @Expose({ groups: [RoleEnum.Admin] })
  createdAt?: Date;
  @ApiProperty({ type: Date })
  @Expose({ groups: [RoleEnum.Admin] })
  updatedAt?: Date;
  @ApiProperty({ type: Date })
  @Expose({ groups: [RoleEnum.Admin] })
  inactiveAt?: Date;
}

export type packageVoucherTermAndCondENCreateInput = {
  id: string;
  description: string;
  packageVoucherId: string;
};
