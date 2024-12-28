import { ApiProperty } from '@nestjs/swagger';
import { RoleEnum } from '@resources/account/types/account.type';
import { Expose } from 'class-transformer';

export class VoucherPromotionDomain {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: String })
  name: string;
  @ApiProperty({ type: Number })
  promotionPrice: number;
  @ApiProperty({ type: Date })
  sellStartedAt: Date;
  @ApiProperty({ type: Date })
  sellExpiredAt: Date;
  @ApiProperty({ type: Date })
  usableAt: Date;
  @ApiProperty({ type: Date })
  usableExpiredAt: Date;
  @ApiProperty({ type: Date })
  @Expose({ groups: [RoleEnum.Admin] })
  createdAt?: Date;
  @ApiProperty({ type: Date })
  @Expose({ groups: [RoleEnum.Admin] })
  updatedAt?: Date;
  @ApiProperty({ type: Date, nullable: true })
  @Expose({ groups: [RoleEnum.Admin] })
  deletedAt?: Date;
}
