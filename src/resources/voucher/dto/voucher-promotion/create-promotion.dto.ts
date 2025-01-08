import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { VoucherPromotionDomain } from '@resources/voucher/domain/voucher-promotion.domain';
import { VoucherDomain } from '@resources/voucher/domain/voucher.domain';
import { IsDateGreaterThan } from '@utils/validators/IsDateGreaterThan';
import { IsFutureDate } from '@utils/validators/IsFutureDate';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';

export class CreateVoucherPromotionDto {
  @IsUUID(7)
  @ApiProperty({ type: String })
  voucherId: VoucherDomain['id'];
  @IsString()
  @ApiProperty({ type: String })
  name: string;
  @ApiProperty({ type: Number })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  promotionPrice: number;
  @ApiProperty({ type: Date })
  @IsFutureDate()
  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  sellStartedAt: Date;
  @IsDateGreaterThan('sellStartedAt')
  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  @ApiProperty({ type: Date })
  sellExpiredAt: Date;
  @ApiProperty({ type: Date })
  @IsFutureDate()
  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  usableAt: Date;
  @IsDateGreaterThan('usableAt')
  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  @ApiProperty({ type: Date })
  usableExpiredAt: Date;
}

export class CreateVoucherPromotionResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.CREATED,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'Voucher code 123 have been created successfully.',
  })
  public message: string;
  @ApiProperty({
    type: Object,
    example: `{"logout": ${AuthPath.Logout}}`,
  })
  public links: HATEOSLink;
  @ApiProperty({
    type: Object,
    example: 'sdfsdf',
  })
  public data: VoucherPromotionDomain;

  public static success(
    data: VoucherPromotionDomain,
    voucherId: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): CreateVoucherPromotionResponse {
    const responseMessage = `Promotion for voucher ID: ${voucherId} have been created successfully.`;
    const responseCode = statusCode ?? HttpStatus.CREATED;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new CreateVoucherPromotionResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
