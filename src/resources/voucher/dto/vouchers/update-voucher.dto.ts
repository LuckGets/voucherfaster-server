import { BadRequestException, HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';
import { VoucherDomain, VoucherStatusEnum } from '../../domain/voucher.domain';
import {
  IsBoolean,
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
  @IsFutureDate()
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  usableExpiredAt?: Date;
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

  public static updatAbleField(): Array<keyof UpdateVoucherDto> {
    return [
      'title',
      'description',
      'price',
      'stockAmount',
      'usableExpiredAt',
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
        "id": "01948d58-6319-76a8-bf42-bbd3135c0822",
        "stockAmount": 1,
        "description": "CRISPY BURGER",
        "price": 30000,
        "sellExpiredAt": "12/26/2025, 12:00:00 AM",
        "title": "HOMHOM",
        "usableExpiredAt": "12/26/2025, 12:00:00 AM",
        "status": "ACTIVE",
        "tag": "Lunch",
        "category": "All-international",
        "img": [
            {
                "id": "01948d58-631a-7409-8cb8-f560ad5ff124",
                "imgPath": "d22pq9rbvhh9yl.cloudfront.net/voucher-img/1737538167115_rocks.jpg",
                "mainImg": true
            },
            {
                "id": "01948d58-631a-7409-8cb8-f870d27cc8ce",
                "imgPath": "d22pq9rbvhh9yl.cloudfront.net/voucher-img/1737538167115_cute-dog.jpg",
                "mainImg": false
            },
            {
                "id": "01948d58-631a-7409-8cb8-fc7a0f69cbc0",
                "imgPath": "d22pq9rbvhh9yl.cloudfront.net/voucher-img/1737538167115_road.jpg",
                "mainImg": false
            }
        ],
        "termAndCond": {
            "th": [
                {
                    "id": "01948d58-631a-7409-8cb8-e78a65443076",
                    "description": "เคี้ยวมันส์ๆ"
                }
            ],
            "en": [
                {
                    "id": "01948d58-631a-7409-8cb8-ea5ce9614b11",
                    "description": "Enjoy eating"
                },
                {
                    "id": "01948d58-631a-7409-8cb8-ed847adf36df",
                    "description": "Have fun"
                }
            ]
        },
        "promotion": [
            {
                "id": "01948d58-631a-7409-8cb8-f3c7347899d8",
                "name": "ลดแรงต้อนรับปีใหม่",
                "stockAmount": 100,
                "sellStartedAt": "1/1/2025, 7:00:00 AM",
                "sellExpiredAt": "1/1/2026, 6:59:59 AM",
                "usableAt": "1/1/2024, 7:00:00 AM",
                "usableExpiredAt": "1/1/2026, 6:59:59 AM",
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
