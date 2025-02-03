import { ApiProperty } from '@nestjs/swagger';
import { AtLeastOneProperty } from '@utils/validators/AtleastOneProp';
import { IsFutureDate } from '@utils/validators/IsFutureDate';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { CoreApiResponse } from 'src/common/core-api-response';

@AtLeastOneProperty(UpdateOrderItemDto.updatAbleFields())
export class UpdateOrderItemDto {
  @ApiProperty({ type: String })
  @IsUUID(7)
  id: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ type: Date })
  @IsFutureDate()
  @IsOptional()
  usableAt?: Date;

  @ApiProperty({ type: Date })
  @IsFutureDate()
  @IsOptional()
  usableExpiredAt?: Date;

  @ApiProperty({ type: Date })
  @IsOptional()
  redeemedAt?: Date | null;

  public static updatAbleFields(): Array<keyof UpdateOrderItemDto> {
    return ['code', 'usableAt', 'usableExpiredAt', 'redeemedAt'];
  }
}

export class UpdateOrderItemQrcode {
  id: string;
  qrcodeImagePath: string;
}

export class UpdateOrderItemResponse extends CoreApiResponse {}
