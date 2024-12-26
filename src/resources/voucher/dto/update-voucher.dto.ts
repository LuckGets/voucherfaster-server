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
} from 'class-validator';
import { Transform } from 'class-transformer';
import { IsEnumValue } from '@utils/validators/IsEnum';

export class UpdateVoucherDto {
  @IsString()
  id: string;
  @IsString()
  @IsOptional()
  code?: string;
  @IsString()
  @IsOptional()
  title?: string;
  @IsString()
  @IsOptional()
  description?: string;
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  price?: number;
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  usageExpiredTime?: Date;
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  saleExpiredTime?: Date;
  @IsString()
  @IsOptional()
  tagId?: string;
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @IsOptional()
  termAndCondTh?: string[];
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsOptional()
  termAndCondEn?: string[];
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
