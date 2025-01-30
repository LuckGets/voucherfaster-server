import { HttpStatus } from '@nestjs/common';
import { ApiBodyOptions, ApiProperty } from '@nestjs/swagger';
import { VoucherDomain } from '@resources/voucher/domain/voucher.domain';
import { IsDateGreaterThan } from '@utils/validators/IsDateGreaterThan';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
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

export const PACKAGE_FILE_FIELD = {
  MAIN_IMG: 'mainImg',
  PACKAGE_IMG: 'packageImg',
} as const;

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
  @ApiProperty({ type: () => String, description: 'ID of the quota voucher' })
  quotaVoucherId: VoucherDomain['id'];
  @ApiProperty({ type: Number })
  @IsPositive()
  @Transform(({ value }) => Number(value))
  quotaAmount: number;
  @ApiProperty({ type: Number })
  @IsPositive()
  @Transform(({ value }) => Number(value))
  stockAmount: number;
  @ApiProperty({ type: Number })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  price: number;
  // @ApiProperty({ type: () => [CreateRewardVoucherDto] })
  @Transform(({ value }) =>
    plainArrayTransformer(value, CreateRewardVoucherDto),
  )
  description: PackageVoucherDomain['description'];
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
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
  @IsDateGreaterThan('sellStartedAt')
  @Transform(({ value }) => new Date(value))
  sellExpiredAt: Date;
  @ApiProperty({ type: Date })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  usableAt: Date;
  @ApiProperty({ type: Date })
  @IsDateGreaterThan('usableAt')
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
      'quotaVoucherId',
      'quotaAmount',
      'stockAmount',
      'price',
      'rewardVouchers',
      'title',
      'termAndCondition',
      'sellStartedAt',
      'sellExpiredAt',
      'usableAt',
      'usableExpiredAt',
    ],
    type: 'object',
    properties: {
      quotaVoucherId: {
        type: 'string',
      },
      quotaAmount: {
        type: 'number',
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
    example: `{ 
        "id": "01944636-568f-770a-920a-421b9f96ba49",
        "name": "โปรโมชั่นแพ็คเกจ ซื้อ1แถม1",
        "price": 300,
        "quotaVoucherId": "019440b4-c932-72ae-b774-51d15cc52848",
        "quotaAmount": 1,
        "startedAt": "1/1/2025, 12:00:00 AM",
        "expiredAt": "2/1/2025, 12:00:00 AM",
        "createdAt": "1/8/2025, 8:59:13 PM",
        "updatedAt": "1/8/2025, 8:59:13 PM",
        "deletedAt": null
  }`,
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
