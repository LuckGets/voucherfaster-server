import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';
import { VoucherDomain, VoucherStatusEnum } from '../domain/voucher.domain';
import {
  IsArray,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { IsEnumValue } from '@utils/validators/IsEnum';
import { IsFutureDate } from '@utils/validators/IsFutureDate';

export class UpdateVoucherDto {
  @ApiProperty({ type: String })
  @IsUUID(7)
  id: string;
  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  code?: string;
  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  title?: string;
  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  description?: string;
  @ApiProperty({ type: Number })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  price?: number;
  @ApiProperty({ type: Date })
  @IsFutureDate()
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  usageExpiredTime?: Date;
  @ApiProperty({ type: Date })
  @IsFutureDate()
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  saleExpiredTime?: Date;
  @ApiProperty({ type: String })
  @IsUUID(7)
  @IsOptional()
  tagId?: string;
  @ApiProperty({ type: Array<string> })
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @IsOptional()
  termAndCondTh?: string[];
  @ApiProperty({ type: Array<string> })
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsOptional()
  termAndCondEn?: string[];
  @ApiProperty({ type: String, enum: VoucherStatusEnum })
  @IsEnumValue(VoucherStatusEnum)
  @IsOptional()
  status?: VoucherStatusEnum;
}

export class UpdateVoucherResponse extends CoreApiResponse {
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
  public data: VoucherDomain;

  public static success(
    data: VoucherDomain,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): UpdateVoucherResponse {
    const responseMessage = message ?? 'Update voucher Successfully';
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new UpdateVoucherResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
