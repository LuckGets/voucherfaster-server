import { BadRequestException, HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';
import { VoucherDomain, VoucherStatusEnum } from '../../domain/voucher.domain';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Validate,
  ValidateNested,
} from 'class-validator';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { IsEnumValue } from '@utils/validators/IsEnum';
import { IsFutureDate } from '@utils/validators/IsFutureDate';
import { RequiredWith } from '@utils/validators/RequiredWith';
import { NotPresentWith } from '@utils/validators/NotPresentWith';

export class TermAndCondUpdateDto {
  @ApiProperty({ type: String, required: false })
  @IsUUID(7)
  @IsOptional()
  @RequiredWith(['updatedDescription', 'inactive'], { any: true })
  @NotPresentWith(['description'])
  id?: string;
  @ApiProperty({
    type: String,
    required: false,
    description:
      'Provide this property value with id property for updating the description of provided term and condition id.',
  })
  @IsOptional()
  @RequiredWith('id')
  @NotPresentWith(['description', 'inactive'])
  updatedDescription?: string;
  @IsOptional()
  @ApiProperty({
    type: String,
    required: false,
    description:
      'Provide this property value for creating new term and condition.',
  })
  @NotPresentWith(['id', 'updatedDescription'])
  description?: string;
  @ApiProperty({
    type: Boolean,
    required: false,
    description:
      'Set the term and condition id which provided together to inactive.',
  })
  @IsOptional()
  @IsBoolean()
  @RequiredWith('id')
  @NotPresentWith(['description', 'updatedDescription'])
  inactive?: boolean;
}

function transformUpdateTermAndCond(data: string): TermAndCondUpdateDto[] {
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      console.log(parsed);
      if (!Array.isArray(parsed)) {
        throw new BadRequestException(
          'Expected an array for term and condition',
        );
      }
      return parsed.map((item) => plainToInstance(TermAndCondUpdateDto, item));
    } catch (error) {
      throw new BadRequestException(
        'Invalid JSON format for term and condition',
      );
    }
  }
  return data;
}

export class UpdateVoucherDto {
  @ApiProperty({ type: String })
  @IsUUID(7)
  id: string;
  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  title?: string;
  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  description?: string;
  @ApiProperty({ type: Number })
  @IsPositive()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  price?: number;
  @ApiProperty({ type: Number })
  @IsPositive()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  stockAmount?: number;
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
  @ApiProperty({ type: () => [TermAndCondUpdateDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Transform(({ value }) => transformUpdateTermAndCond(value))
  @Type(() => TermAndCondUpdateDto)
  termAndCondTh?: TermAndCondUpdateDto[];
  @ApiProperty({ type: () => [TermAndCondUpdateDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Transform(({ value }) => transformUpdateTermAndCond(value))
  @Type(() => TermAndCondUpdateDto)
  termAndCondEn?: TermAndCondUpdateDto[];
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
    example: 'Voucher ID: 123 have been updated successfully.',
  })
  public message: string;
  @ApiProperty({
    type: Object,
    example: `{"logout": ${AuthPath.Logout}}`,
  })
  public links: HATEOSLink;
  @ApiProperty({
    type: Object,
    example: `{
        "id": "0194834a-ff4e-7244-be8c-877f5b7deb7d",
        "stockAmount": 10000,
        "description": "Juicy burgers with crispy french fries.",
        "price": 300,
        "saleExpiredTime": "12/26/2025, 12:00:00 AM",
        "title": "Burger with fries",
        "usageExpiredTime": "12/26/2025, 12:00:00 AM",
        "status": "ACTIVE",
        "img": [
            {
                "id": "0194834a-ff4e-7244-be8c-b1521de8c8f0",
                "imgPath": "https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/1735921280934_burger-with-melted-cheese.webp",
                "mainImg": true
            }
        ],
        "termAndCond": {
            "th": [
                {
                    "id": "0194834a-ff4e-7244-be8d-17e8a96a7081",
                    "description": "คูปองนี้สามารถใช้ได้เฉพาะในวันเสาร์เท่านั้น"
                }
            ],
            "en": [
                {
                    "id": "0194834a-ff4e-7244-be8c-e83c51aec35d",
                    "description": "This voucher can only be used on Saturday."
                }
            ]
        },
        "promotion": [
            {
                "id": "0194834a-ff4e-7244-be8c-de61a53766fc",
                "name": "ลดแรงต้อนรับปีใหม่",
                "stockAmount": 150,
                "sellStartedAt": "1/1/2025, 12:00:00 AM",
                "sellExpiredAt": "2/15/2025, 12:00:00 AM",
                "usableAt": "1/11/2025, 12:00:00 AM",
                "usableExpiredAt": "2/1/2025, 12:00:00 AM",
                "promotionPrice": 199
            }
        ]
    }`,
  })
  public data: VoucherDomain;

  public static success(
    data: VoucherDomain,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): UpdateVoucherResponse {
    const responseMessage =
      message ?? `Voucher ID: ${data.id} have been updated successfully.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    // generateVoucherReponseHATEOASl(data.id);
    return new UpdateVoucherResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
