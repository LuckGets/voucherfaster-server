import { ApiProperty } from '@nestjs/swagger';
import { RoleEnum } from '@resources/account/types/account.type';
import { IsDateGreaterThan } from '@utils/validators/IsDateGreaterThan';
import { IsFutureDate } from '@utils/validators/IsFutureDate';
import { Expose, Transform } from 'class-transformer';
import { IsNumber, IsString, IsUUID } from 'class-validator';

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

export class VoucherPromotionCreateInput {
  @IsUUID(7)
  @ApiProperty({ type: String })
  id: string;
  @IsString()
  @ApiProperty({ type: String })
  name: string;
  @IsUUID(7)
  @ApiProperty({ type: String })
  voucherId: string;
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @ApiProperty({ type: Number })
  promotionPrice: number;
  @IsFutureDate()
  @ApiProperty({ type: Date })
  sellStartedAt: Date;
  @IsDateGreaterThan('sellStartedAt')
  @ApiProperty({ type: Date })
  sellExpiredAt: Date;
  @IsFutureDate()
  @ApiProperty({ type: Date })
  usableAt: Date;
  @IsDateGreaterThan('usableAt')
  @ApiProperty({ type: Date })
  usableExpiredAt: Date;
}
