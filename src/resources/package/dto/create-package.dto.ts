import { HttpStatus } from '@nestjs/common';
import { ApiBodyOptions, ApiProperty } from '@nestjs/swagger';
import { VoucherDomain } from '@resources/voucher/domain/voucher.domain';
import { IsDateGreaterOrEqual } from '@utils/validators/IsDateGreaterThan';
import { Transform, Type } from 'class-transformer';
import {
  ArrayContains,
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CoreApiResponse } from 'src/common/core-api-response';
import { PackageVoucherDomain } from '../domain/package-voucher.domain';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';
import { plainArrayTransformer } from '@utils/transformer/plainArrayTransformer';
import { VoucherTagDomain } from '@resources/category/domain/tag.domain';
import { IsFutureDate } from '@utils/validators/IsFutureDate';

export const PACKAGE_FILE_FIELD = {
  MAIN_IMG: 'mainImg',
  PACKAGE_IMG: 'packageImg',
} as const;

export class CreateQuotaVoucherDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsUUID(7)
  voucherId: VoucherDomain['id'];
  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsPositive()
  amount: number;
}

export class CreateRewardVoucherDto {
  @ApiProperty({ type: String })
  @IsUUID(7)
  voucherId: VoucherDomain['id'];
  @ApiProperty({ type: Number })
  @IsPositive()
  amount: number;
}

export class CreatePackageVoucherDto {
  @IsUUID(7)
  tagId: VoucherTagDomain['id'];
  @ApiProperty({
    type: () => [CreateQuotaVoucherDto],
    description: 'ID of the quota voucher',
  })
  @IsArray()
  @ArrayNotEmpty()
  @Transform(({ value }) => plainArrayTransformer(value, CreateQuotaVoucherDto))
  @ValidateNested({ each: true })
  @Type(() => CreateQuotaVoucherDto)
  quotaVouchers: CreateQuotaVoucherDto[];
  @ApiProperty({ type: Number })
  @IsPositive()
  @Transform(({ value }) => Number(value))
  stockAmount: number;
  @ApiProperty({ type: Number })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  price: number;
  @IsString()
  @IsNotEmpty()
  description: PackageVoucherDomain['description'];
  @IsArray()
  @Transform(({ value }) =>
    plainArrayTransformer(value, CreateRewardVoucherDto),
  )
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateRewardVoucherDto)
  rewardVouchers: CreateRewardVoucherDto[];
  @ApiProperty({ type: String })
  @IsString()
  title: string;
  @ApiProperty({ type: String })
  @IsString()
  termAndCondition: string;
  @ApiProperty({ type: Date })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  sellStartedAt: Date;
  @ApiProperty({ type: Date })
  @IsDateGreaterOrEqual('sellStartedAt')
  @Transform(({ value }) => new Date(value))
  sellExpiredAt: Date;
  @ApiProperty({ type: Date })
  @IsDateGreaterOrEqual('sellStartedAt')
  @Transform(({ value }) => new Date(value))
  usableAt: Date;
  @ApiProperty({ type: Date })
  @IsFutureDate()
  @IsDateGreaterOrEqual('usableAt')
  @Transform(({ value }) => new Date(value))
  usableExpiredAt: Date;
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsPositive()
  discountedPrice?: number;
}

export const createPackageVoucherDtoSchemaDocument: ApiBodyOptions = {
  description:
    'Create package voucher with its associated datails included image and reward vouchers.',
  schema: {
    required: [
      'quotaVouchers',
      'quotaVoucherId',
      'quotaAmount',
      'stockAmount',
      'price',
      'rewardVouchers',
      'title',
      'description',
      'termAndCondition',
      'sellStartedAt',
      'sellExpiredAt',
      'usableAt',
      'usableExpiredAt',
      `${PACKAGE_FILE_FIELD.MAIN_IMG}`,
    ],
    type: 'object',
    properties: {
      tagId: {
        type: 'string',
        example: '0193f3cc-c977-7182-9627-debca7376208',
      },
      description: {
        type: 'string',
        example: 'This is the coupon-voucher for valentines day.',
      },
      quotaVouchers: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            voucherId: {
              type: 'string',
            },
            amount: {
              type: 'number',
            },
          },
        },
      },
      stockAmount: {
        type: 'number',
      },
      price: {
        type: 'number',
      },
      rewardVouchers: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            voucherId: {
              type: 'string',
            },
            amount: {
              type: 'number',
            },
          },
        },
      },
      title: {
        type: 'string',
      },
      termAndCondition: {
        type: 'string',
      },
      sellStartedAt: {
        type: 'date',
      },
      sellExpiredAt: {
        type: 'date',
      },
      usableAt: {
        type: 'date',
      },
      usableExpiredAt: {
        type: 'date',
      },
      discountedPrice: {
        type: 'number',
        nullable: true,
      },
      [PACKAGE_FILE_FIELD.MAIN_IMG]: {
        type: 'string',
        format: 'binary',
        description: 'Main image of the package voucher',
      },
      [PACKAGE_FILE_FIELD.PACKAGE_IMG]: {
        type: 'string',
        format: 'binary',
        description: 'Other images of the package voucher.',
      },
    },
  },
};

export class CreatePackageVoucherResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.CREATED,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'Package title: น้ำปลาคลุกไก่ have been created successfully.',
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
      id: '0194c577-4593-75ce-81dc-c6aac1cb9c48',
      category: 'Yok chinese restaurant',
      description: 'เนื้อหมาผัดเต้าหู้ กินกับซอสต้นตำรับจากกวางจง ถิ่นหม่าล่า',
      images: [
        {
          id: '0194c577-472e-7729-aaed-4efc601d3c48',
          mainImg: true,
          imgPath:
            'd22pq9rbvhh9yl.cloudfront.net/package-img/1738479715716_cute-dog.jpg',
        },
      ],
      price: 300,
      discount: {
        discountedPrice: 199,
        status: 'ACTIVE',
      },
      status: 'ACTIVE',
      tag: 'main courses',
      quotaAmount: 2,
      quotaVoucherId: '0194c0f3-9df9-7655-88df-04a8b7862d8a',
      sellExpiredAt: '2025-03-31T17:00:00.000Z',
      sellStartedAt: '2024-12-31T17:00:00.000Z',
      stockAmount: 100,
      title: 'จัดเต้าหุ้สอง แถม เบอร์เกอร์กับปลาทอด',
      termAndCondition: 'แซ่บลำแซ่บลำ',
      usableAt: '2025-01-31T17:00:00.000Z',
      usableExpiredAt: '2025-12-31T17:00:00.000Z',
      createdAt: '2025-02-02T07:01:56.158Z',
      updatedAt: '2025-02-02T07:01:56.158Z',
      rewardVouchers: [
        {
          id: '0194c577-4593-75ce-81dc-c9c2b960e126',
          voucherId: '0194c0f3-9df9-7655-88de-de9336454b71',
          amount: 1,
          img: null,
        },
        {
          id: '0194c577-4593-75ce-81dc-ce0cc81a281a',
          voucherId: '0194c0f3-9df9-7655-88de-e2da06950b7d',
          amount: 1,
          img: null,
        },
      ],
    },
  })
  public data: PackageVoucherDomain;

  constructor(
    code: CreatePackageVoucherResponse['HTTPStatusCode'],
    message: CreatePackageVoucherResponse['message'],
    links: CreatePackageVoucherResponse['links'],
    data: PackageVoucherDomain,
  ) {
    super(code, message, links);
    this.data = data;
  }

  public static success(
    data: PackageVoucherDomain,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): CreatePackageVoucherResponse {
    const responseMessage =
      message ?? `Package title: ${data.title} have been created successfully.`;
    const responseCode = statusCode ?? HttpStatus.CREATED;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new CreatePackageVoucherResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
