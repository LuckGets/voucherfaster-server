import { BadRequestException, HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';
import { VoucherDomain, VoucherStatusEnum } from '../../domain/voucher.domain';
import {
  IsBoolean,
  IsDate,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { IsEnumValue } from '@utils/validators/IsEnum';
import { IsFutureDate } from '@utils/validators/IsFutureDate';
import { RequiredWith } from '@utils/validators/RequiredWith';
import { NotPresentWith } from '@utils/validators/NotPresentWith';
import { AtLeastOneProperty } from '@utils/validators/AtleastOneProp';
import { plainArrayTransformer } from '@utils/transformer/plainArrayTransformer';

@AtLeastOneProperty(TermAndCondUpdateDto.updatAbleField())
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

  public static updatAbleField(): Array<keyof TermAndCondUpdateDto> {
    return ['id', 'description', 'inactive', 'updatedDescription'];
  }
}

@AtLeastOneProperty(UpdateVoucherDto.updatAbleField())
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
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  usableAt?: Date;
  @ApiProperty({ type: Date })
  @IsFutureDate()
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  usableExpiredAt?: Date;
  @ApiProperty({ type: Date })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  sellStartedAt?: Date;
  @ApiProperty({ type: Date })
  @IsFutureDate()
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  sellExpiredAt?: Date;
  @ApiProperty({ type: String })
  @IsUUID(7)
  @IsOptional()
  tagId?: string;
  @ApiProperty({ type: () => [TermAndCondUpdateDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Transform(({ value }) => plainArrayTransformer(value, TermAndCondUpdateDto))
  @Type(() => TermAndCondUpdateDto)
  termAndCondTh?: TermAndCondUpdateDto[];
  @ApiProperty({ type: () => [TermAndCondUpdateDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Transform(({ value }) => plainArrayTransformer(value, TermAndCondUpdateDto))
  @Type(() => TermAndCondUpdateDto)
  termAndCondEn?: TermAndCondUpdateDto[];
  @ApiProperty({ type: String, enum: VoucherStatusEnum })
  @IsEnumValue(VoucherStatusEnum)
  @IsOptional()
  status?: VoucherStatusEnum;

  public static updatAbleField(): Array<keyof UpdateVoucherDto> {
    return [
      'title',
      'description',
      'price',
      'stockAmount',
      'usableAt',
      'usableExpiredAt',
      'sellStartedAt',
      'sellExpiredAt',
      'tagId',
      'termAndCondTh',
      'termAndCondEn',
      'status',
    ];
  }
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
        "id": "01948e7f-845f-774d-ad8d-29e5f496eacd",
        "stockAmount": 10000,
        "description": "CRISPY BURGER",
        "price": 30000,
        "usableAt": "12/25/2025, 12:00:00 AM",
        "usableExpiredAt": "12/26/2025, 12:00:00 AM",
        "sellStartedAt": "8/26/2025, 12:00:00 AM",
        "sellExpiredAt": "12/26/2025, 12:00:00 AM",
        "title": "CRISPY BURGER",
        "status": "ACTIVE",
        "tag": "main courses",
        "category": "Yok chinese restaurant",
        "img": [
            {
                "id": "01948e7f-8460-717e-b372-509aebfcf5f3",
                "imgPath": "d22pq9rbvhh9yl.cloudfront.net/voucher-img/1737557508730_rocks.jpg",
                "mainImg": true
            }
        ],
        "termAndCond": {
            "th": [
                {
                    "id": "01948e7f-8460-717e-b372-4339444a35eb",
                    "description": "เคี้ยวมันส์ๆ"
                }
            ],
            "en": [
                {
                    "id": "01948e7f-8460-717e-b372-4752ec43a770",
                    "description": "Enjoy eating"
                },
                {
                    "id": "01948e7f-8460-717e-b372-487aeb43ca87",
                    "description": "Have fun"
                }
            ]
        },
        "promotion": []
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
