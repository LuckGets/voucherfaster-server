import { HttpStatus } from '@nestjs/common';
import { ApiBodyOptions, ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { VoucherDomain } from '../../domain/voucher.domain';
import { AuthPath } from 'src/config/api-path';
import { IsFutureDate } from '@utils/validators/IsFutureDate';
import { IsDateGreaterThan } from '@utils/validators/IsDateGreaterThan';
import { VoucherTagDomain } from '@resources/category/domain/tag.domain';

type CreateVoucherDataType = Omit<VoucherDomain, 'img'>;

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
      usableAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-12-31T23:59:59Z',
      },
      usableExpiredAt: {
        type: 'string',
        format: 'date-time',
        example: '2025-12-31T23:59:59Z',
      },
      sellStartedAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-12-25T23:59:59Z',
      },
      sellExpiredAt: {
        type: 'string',
        format: 'date-time',
        example: '2025-02-25T23:59:59Z',
      },
      tagId: {
        type: 'string',
        example: '0193f3cc-c977-7182-9627-debca7376208',
      },
      termAndCond: {
        type: 'string',
        example: 'Condition 1',
      },
      discountedPrice: {
        type: 'number',
        description: 'Discounted price of the voucher',
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
      'title',
      'description',
      'price',
      'usageExpiredTime',
      'saleExpiredTime',
      'tagId',
      'termAndCond',
      'mainImg',
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
  @IsDateGreaterThan('sellStartedAt')
  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  usableAt: Date;
  @IsDateGreaterThan('usableAt')
  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  usableExpiredAt: Date;
  @IsFutureDate()
  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  sellStartedAt: Date;
  @IsDateGreaterThan('sellStartedAt')
  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  sellExpiredAt: Date;
  @IsString()
  tagId: VoucherTagDomain['id'];
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsString()
  termAndCondition: string;
  @IsOptional()
  @IsPositive()
  @Transform(({ value }) => Number(value))
  discountedPrice?: number;
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
        "id": "01948e7f-845f-774d-ad8d-29e5f496eacd",
        "stockAmount": 10000,
        "description": "CRISPY BURGER",
        "price": 30000,
        "usableAt": "12/25/2025, 12:00:00 AM",
        "usableExpiredAt": "12/26/2025, 12:00:00 AM",
        "sellStartedAt": "10/24/2025, 12:00:00 AM",
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
