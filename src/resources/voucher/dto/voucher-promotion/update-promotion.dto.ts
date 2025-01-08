import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { VoucherPromotionDomain } from '@resources/voucher/domain/voucher-promotion.domain';
import { VoucherDomain } from '@resources/voucher/domain/voucher.domain';
import { IsFutureDate } from '@utils/validators/IsFutureDate';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';

export class UpdateVoucherPromotionDto {
  @IsUUID(7)
  @ApiProperty({ type: String })
  promotionId: VoucherDomain['id'];
  @IsUUID(7)
  @ApiProperty({ type: String })
  voucherId: VoucherDomain['id'];
  @IsOptional()
  @IsString()
  @ApiProperty({ type: String })
  name?: string;
  @ApiProperty({ type: Number })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  promotionPrice?: number;
  @ApiProperty({ type: Date })
  @IsOptional()
  @IsFutureDate()
  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  sellStartedAt?: Date;
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  @IsFutureDate()
  @IsNotEmpty()
  @ApiProperty({ type: Date })
  sellExpiredAt?: Date;
  @ApiProperty({ type: Date })
  @IsOptional()
  @IsFutureDate()
  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  usableAt?: Date;
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  @IsFutureDate()
  @IsNotEmpty()
  @ApiProperty({ type: Date })
  usableExpiredAt?: Date;
}

export class UpdateVoucherPromotionResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
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
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): UpdateVoucherPromotionResponse {
    const responseMessage =
      message ?? `Promotion ID: ${data.id} have been updated successfully.`;
    const responseCode = statusCode ?? HttpStatus.CREATED;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new UpdateVoucherPromotionResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
