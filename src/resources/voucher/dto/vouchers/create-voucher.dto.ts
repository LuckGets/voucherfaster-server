import { HttpStatus } from '@nestjs/common';
import { ApiBodyOptions, ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { VoucherDomain } from '../../domain/voucher.domain';
import { AuthPath } from 'src/config/api-path';
import { IsFutureDate } from '@utils/validators/IsFutureDate';
import { IsDateGreaterOrEqual } from '@utils/validators/IsDateGreaterThan';
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
  @ApiProperty({ type: String })
  title: string;
  @IsString()
  @ApiProperty({ type: String })
  description: string;
  @IsPositive()
  @Transform(({ value }) => Number(value))
  @ApiProperty({ type: Number })
  price: number;
  @IsPositive()
  @Transform(({ value }) => Number(value))
  @ApiProperty({ type: Number })
  stockAmount: number;
  @IsDateGreaterOrEqual('sellStartedAt')
  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  usableAt: Date;
  @IsDateGreaterOrEqual('usableAt')
  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  usableExpiredAt: Date;
  @IsFutureDate()
  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  sellStartedAt: Date;
  @IsDateGreaterOrEqual('sellStartedAt')
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
    example: {
      id: '0194b80c-4d87-777c-8563-52531cdd4bf8',
      title: 'ไก่เจียว',
      status: 'ACTIVE',
      stockAmount: 10000,
      description: 'ไก่เจียวในไข่ทอดสูตรกวางจง',
      price: 199,
      usableAt: '2025-01-31T17:00:00.000Z',
      usableExpiredAt: '2025-12-25T17:00:00.000Z',
      termAndCondition: 'Enjoy eating and Have fun',
      sellStartedAt: '2025-01-31T17:00:00.000Z',
      sellExpiredAt: '2025-12-25T17:00:00.000Z',
      img: [
        {
          id: '0194b80c-4d8e-7db1-876c-cb64e84ff5a2',
          imgPath:
            'd22pq9rbvhh9yl.cloudfront.net/voucher-img/1738254601296_cute-dog.jpg',
          mainImg: true,
        },
      ],
      discount: {
        id: '0194b80c-4d87-777c-8563-5569c95a6491',
        discountedPrice: 99,
        createdAt: '2025-01-30T16:30:01.614Z',
        updatedAt: '2025-01-30T16:30:01.614Z',
        status: 'ACTIVE',
      },
      category: 'หอยทอด แม่กลอง',
      tag: 'หาดใหญ่แก๊งค์',
    },
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
