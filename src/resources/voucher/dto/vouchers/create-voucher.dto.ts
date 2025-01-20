import { BadRequestException, HttpStatus } from '@nestjs/common';
import { ApiBodyOptions, ApiProperty } from '@nestjs/swagger';
import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Validate,
  ValidateNested,
} from 'class-validator';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { VoucherDomain } from '../../domain/voucher.domain';
import { AuthPath } from 'src/config/api-path';
import { IsFutureDate } from '@utils/validators/IsFutureDate';
import { CreateVoucherPromotionDto } from '../voucher-promotion/create-promotion.dto';
import { IsDateGreaterThan } from '@utils/validators/IsDateGreaterThan';

type CreateVoucherDataType = Omit<VoucherDomain, 'img'>;
class CreatePromotionNestedInVoucherDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  name: string;
  @ApiProperty({ type: Number })
  @IsPositive()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  promotionPrice: number;
  @ApiProperty({ type: Number })
  @IsPositive()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  stockAmount: number;
  @ApiProperty({ type: Date })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  sellStartedAt: Date;
  @IsDateGreaterThan('sellStartedAt')
  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  @ApiProperty({ type: Date })
  sellExpiredAt: Date;
  @ApiProperty({ type: Date })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  usableAt: Date;
  @IsDateGreaterThan('usableAt')
  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  @ApiProperty({ type: Date })
  usableExpiredAt: Date;
}

export const createVoucherFormDataDocumentation: ApiBodyOptions = {
  description: 'Create a voucher with its associated details and file uploads',
  schema: {
    type: 'object',
    properties: {
      title: {
        description: "Voucher's title",
        type: 'string',
        example: 'New Year Sale',
      },
      description: {
        type: 'string',
        example: 'Enjoy discounts for the new year!',
        description: "Voucher's description",
      },
      price: { type: 'number', example: 500, description: 'Voucher price' },
      stockAmount: { type: 'number', example: 500 },
      usageExpiredTime: {
        type: 'string',
        format: 'date-time',
        example: '2024-12-31T23:59:59Z',
      },
      saleExpiredTime: {
        type: 'string',
        format: 'date-time',
        example: '2024-12-25T23:59:59Z',
      },
      tagId: { type: 'string', example: 'tag123' },
      termAndCondTh: {
        type: 'array',
        items: { type: 'string' },
        example: ['Condition 1', 'Condition 2'],
      },
      termAndCondEn: {
        type: 'array',
        items: { type: 'string' },
        example: ['Condition A', 'Condition B'],
      },
      promotion: {
        type: 'object',
        description: 'Details of the promotion associated with the voucher',
        properties: {
          name: { type: 'string', example: 'Holiday Promo' },
          promotionPrice: { type: 'number', example: 400 },
          stockAmount: { type: 'number', example: 500 },
          sellStartedAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T00:00:00Z',
          },
          sellExpiredAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-12-31T23:59:59Z',
          },
          usableAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T00:00:00Z',
          },
          usableExpiredAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-12-31T23:59:59Z',
          },
        },
        required: [
          'name',
          'stockAmount',
          'promotionPrice',
          'sellStartedAt',
          'sellExpiredAt',
          'usableAt',
          'usableExpiredAt',
        ],
      },
      mainImg: {
        type: 'string',
        format: 'binary',
        description: 'Main image for the voucher',
      },
      voucherImg: {
        type: 'array',
        items: {
          type: 'string',
          format: 'binary',
        },
        description: 'Additional images for the voucher',
      },
    },
    required: [
      'code',
      'title',
      'description',
      'price',
      'usageExpiredTime',
      'saleExpiredTime',
      'tagId',
      'termAndCondTh',
      'termAndCondEn',
      'mainImg',
      'voucherImg',
    ],
  },
};

export class CreateVoucherDto {
  @IsString()
  title: string;
  @IsString()
  description: string;
  @IsPositive()
  @Transform(({ value }) => Number(value))
  price: number;
  @IsPositive()
  @Transform(({ value }) => Number(value))
  @ApiProperty({ type: Number })
  stockAmount: number;
  @IsFutureDate()
  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  usageExpiredTime: Date;
  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  saleExpiredTime: Date;
  @IsString()
  tagId: string;
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  termAndCondTh: string[];
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  termAndCondEn: string[];
  @IsOptional()
  @ValidateNested()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(CreatePromotionNestedInVoucherDto, parsed);
      } catch (error) {
        throw new BadRequestException('Invalid JSON format for promotion');
      }
    }
    return value;
  })
  @Type(() => CreatePromotionNestedInVoucherDto)
  promotion?: CreatePromotionNestedInVoucherDto;
}

export class CreateVoucherResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.CREATED,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'Voucher ID: 123 have been created successfully.',
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
        "id": "01948481-cbe0-7674-aeef-4c08a5198cb5",
        "stockAmount": 10000,
        "description": "Juicy burgers with crispy french fries.",
        "price": 300,
        "saleExpiredTime": "12/26/2025, 12:00:00 AM",
        "title": "Burger with fries",
        "usageExpiredTime": "12/26/2025, 12:00:00 AM",
        "status": "ACTIVE",
        "promotion": [
            {
                "id": "01948481-cbe0-7674-aeef-5cba7e36b39f",
                "name": "ลดแรงต้อนรับปีใหม่",
                "stockAmount": 100,
                "sellStartedAt": "1/1/2025, 7:00:00 AM",
                "sellExpiredAt": "1/1/2026, 6:59:59 AM",
                "usableAt": "1/1/2024, 7:00:00 AM",
                "usableExpiredAt": "1/1/2026, 6:59:59 AM",
                "promotionPrice": 199,
                "createdAt": "1/20/2025, 11:18:06 PM",
                "updatedAt": "1/20/2025, 11:18:06 PM"
            }
        ]
    }`,
  })
  public data: CreateVoucherDataType;

  public static success(
    data: CreateVoucherDataType,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): CreateVoucherResponse {
    const responseMessage =
      message ?? `Voucher ID: ${data.id} have been created successfully.`;
    const responseCode = statusCode ?? HttpStatus.CREATED;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new CreateVoucherResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
