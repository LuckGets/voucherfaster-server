import { ApiProperty } from '@nestjs/swagger';
import { RoleEnum } from '@resources/account/types/account.type';
import { Expose } from 'class-transformer';

export class PackageVoucherTermAndCondDomain {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: String })
  description: string;
  @ApiProperty({ type: String, nullable: true })
  packageVoucherId?: string;
  @ApiProperty({ type: Date })
  @Expose({ groups: [RoleEnum.Admin, RoleEnum.Me] })
  createdAt?: Date;
  @ApiProperty({ type: Date })
  @Expose({ groups: [RoleEnum.Admin, RoleEnum.Me] })
  updatedAt?: Date;
  @ApiProperty({ type: Date })
  @Expose({ groups: [RoleEnum.Admin, RoleEnum.Me] })
  inactiveAt?: Date;
}

export type packageVoucherTermAndCondTHCreateInput = {
  id: string;
  description: string;
  packageVoucherId: string;
};

export type packageVoucherTermAndCondENCreateInput = {
  id: string;
  description: string;
  packageVoucherId: string;
};
