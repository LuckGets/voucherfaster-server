import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { VoucherDomain } from '../domain/voucher.domain';
import { AuthPath } from 'src/config/api-path';
import { VoucherPromotionCreateInput } from '../domain/voucher-promotion.domain';
import { IsFutureDate } from '@utils/validators/IsFutureDate';
import { IsInstanceOfClass } from '@utils/validators/IsInstaceOfClass';

type CreateVoucherDataType = Omit<VoucherDomain, 'img'>;

type CreatePromotionDto = Omit<VoucherPromotionCreateInput, 'voucherId' | 'id'>;

export const createVoucherFormDataDocumentation = {
  description: 'Create a voucher with its associated details and file uploads',
  schema: {
    type: 'object',
    properties: {
      code: { type: 'string', example: 'VOUCHER2024' },
      title: { type: 'string', example: 'New Year Sale' },
      description: {
        type: 'string',
        example: 'Enjoy discounts for the new year!',
      },
      price: { type: 'number', example: 500 },
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
          id: { type: 'string', example: 'promo1' },
          name: { type: 'string', example: 'Holiday Promo' },
          promotionPrice: { type: 'number', example: 400 },
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
          'id',
          'name',
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
  code: string;
  @IsString()
  title: string;
  @IsString()
  description: string;
  @IsNumber()
  @Transform(({ value }) => Number(value))
  price: number;
  @IsFutureDate()
  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  usageExpiredTime: Date;
  @IsFutureDate()
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
  @IsInstanceOfClass(VoucherPromotionCreateInput)
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  promotion?: CreatePromotionDto;
}

export class CreateVoucherResponse extends CoreApiResponse {
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
  public data: CreateVoucherDataType;

  public static success(
    data: CreateVoucherDataType,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): CreateVoucherResponse {
    const responseMessage = message ?? 'Login Successfully';
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
