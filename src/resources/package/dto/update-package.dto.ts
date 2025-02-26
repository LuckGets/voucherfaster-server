import { ApiProperty } from '@nestjs/swagger';
import { IsFutureDate } from '@utils/validators/IsFutureDate';
import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { VoucherDomain } from '@resources/voucher/domain/voucher.domain';
import { IsArrayOfUUID } from '@utils/validators/IsArrayOfUUID';
import { PackageVoucherDomain } from '../domain/package-voucher.domain';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HttpStatus } from '@nestjs/common';
import { AuthPath } from 'src/config/api-path';
import { HATEOSLink } from 'src/common/hateos.type';
import { plainArrayTransformer } from '@utils/transformer/plainArrayTransformer';
import { AtLeastOneProperty } from '@utils/validators/AtleastOneProp';
import { IsEnumValue } from '@utils/validators/IsEnum';
import { PackageDiscountDomain } from '../domain/package-discount.domain';
import {
  ProductDiscountStatusEnum,
  ProductStatusEnum,
} from '@resources/product/domain/product.domain';

export class AddVoucherToPackageDto {
  @ApiProperty({
    type: String,
    description: 'The property for any new updated reward voucher for package.',
  })
  @IsUUID(7)
  voucherId: VoucherDomain['id'];
  @IsPositive()
  amount: number;
}

export class UpdateVoucherInPackageDto {
  @IsUUID(7)
  @IsOptional()
  voucherId?: VoucherDomain['id'];
  @IsPositive()
  @IsOptional()
  amount?: number;
}

@AtLeastOneProperty(UpdatePackageRewardVoucherDto.updatAbleField())
export class UpdatePackageRewardVoucherDto {
  @ApiProperty({ type: () => [AddVoucherToPackageDto] })
  @Transform(({ value }) =>
    plainArrayTransformer(value, AddVoucherToPackageDto),
  )
  @ValidateNested({ each: true })
  @Type(() => AddVoucherToPackageDto)
  @IsOptional()
  addRewardVouchers?: AddVoucherToPackageDto[];
  @ApiProperty({
    type: [String],
    description:
      'Only provided value for this property when desired to remove one of the reward voucher from package.',
  })
  @IsArrayOfUUID()
  @IsOptional()
  removedRewardIds?: VoucherDomain['id'][];
  @ApiProperty({ type: () => [UpdateVoucherInPackageDto] })
  @ValidateNested({ each: true })
  @Type(() => UpdateVoucherInPackageDto)
  @IsOptional()
  update?: UpdateVoucherInPackageDto[];

  public static updatAbleField(): Array<keyof UpdatePackageRewardVoucherDto> {
    return ['addRewardVouchers', 'removedRewardIds', 'update'];
  }
}

@AtLeastOneProperty(UpdatePackageDiscountDto.updatAbleField())
export class UpdatePackageDiscountDto {
  newId?: PackageDiscountDomain['id'];
  currentDiscountId: PackageDiscountDomain['id'];
  @ApiProperty({ type: Number, required: false })
  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsPositive()
  discountedPrice?: number;

  @ApiProperty({
    type: String,
    enum: ProductDiscountStatusEnum,
    required: false,
  })
  @IsOptional()
  @IsEnumValue(ProductDiscountStatusEnum)
  status?: ProductDiscountStatusEnum;

  public static updatAbleField(): Array<keyof UpdatePackageDiscountDto> {
    return ['discountedPrice', 'status'];
  }
}
@AtLeastOneProperty(UpdatePackageVoucherDto.updatAbleField())
export class UpdatePackageVoucherDto {
  @ApiProperty({ type: String })
  @IsUUID(7)
  id: string;
  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  title?: string;
  @ApiProperty({ type: Number })
  @Transform(({ value }) => Number(value))
  @IsPositive()
  @IsOptional()
  stockAmount?: number;
  @ApiProperty({ type: Number })
  @IsPositive()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  packagePrice?: number;
  @ApiProperty({ type: Date })
  @IsFutureDate()
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
  @IsEnumValue(ProductStatusEnum)
  @IsOptional()
  status?: PackageVoucherDomain['status'];
  @ApiProperty({ type: () => UpdatePackageDiscountDto })
  @ValidateNested({ each: true })
  @Type(() => UpdatePackageDiscountDto)
  @IsOptional()
  discount?: UpdatePackageDiscountDto;

  public static updatAbleField(): Array<keyof UpdatePackageVoucherDto> {
    return [
      'title',
      'stockAmount',
      'discount',
      'packagePrice',
      'usableAt',
      'usableExpiredAt',
      'sellStartedAt',
      'sellExpiredAt',
    ];
  }
}

export class UpdatePackageVoucherResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'Package ID: 123 have been updated successfully.',
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
      id: '0194c25f-ff9a-7299-9239-e4b7a4998640',
      category: 'Yok chinese restaurant',
      description: 'เนื้อหมาผัดเต้าหู้ กินกับซอสต้นตำรับจากกวางจง ถิ่นหม่าล่า',
      images: [
        {
          id: '0194c260-09da-7436-9f19-521baf2682a9',
          mainImg: true,
          imgPath:
            'd22pq9rbvhh9yl.cloudfront.net/package-img/1738427858836_cute-dog.jpg',
        },
        {
          id: '0194c260-09da-7436-9f19-567a066c00d8',
          mainImg: false,
          imgPath:
            'd22pq9rbvhh9yl.cloudfront.net/package-img/1738427858830_voucher-redeeming-via-receptionist.png',
        },
        {
          id: '0194c260-09da-7436-9f19-5a4696367e6e',
          mainImg: false,
          imgPath:
            'd22pq9rbvhh9yl.cloudfront.net/package-img/1738427858837_email-items.jpg',
        },
        {
          id: '0194c260-09da-7436-9f19-5fb5d78fa325',
          mainImg: false,
          imgPath:
            'd22pq9rbvhh9yl.cloudfront.net/package-img/1738427858831_rocks.jpg',
        },
      ],
      price: 300,
      discount: {
        discountedPrice: 199,
        status: 'ACTIVE',
      },
      tag: 'main courses',
      quotaAmount: 2,
      quotaVoucherId: '0194c0f3-9df9-7655-88df-04a8b7862d8a',
      sellExpiredAt: '2025-03-31T17:00:00.000Z',
      sellStartedAt: '2024-12-31T17:00:00.000Z',
      stockAmount: 100,
      title: 'จัดเต้าหุ้สอง แถม เบอร์เกอร์กับปลาทอด',
      termAndCondition: 'แซ่บลำแซ่บลำ',
      usableAt: '2024-12-31T17:00:00.000Z',
      usableExpiredAt: '2025-01-31T17:00:00.000Z',
      createdAt: '2025-02-01T16:37:41.475Z',
      updatedAt: '2025-02-01T16:37:41.475Z',
      rewardVouchers: [
        {
          id: '0194c25f-ff9a-7299-9239-e8c77de4f62f',
          voucherId: '0194c0f3-9df9-7655-88de-de9336454b71',
          amount: 1,
          img: 'd22pq9rbvhh9yl.cloudfront.net/package-img/1738427858837_email-items.jpg',
        },
        {
          id: '0194c25f-ff9a-7299-9239-ef2fd1638c42',
          voucherId: '0194c0f3-9df9-7655-88de-e2da06950b7d',
          amount: 1,
          img: 'd22pq9rbvhh9yl.cloudfront.net/package-img/1738427858831_rocks.jpg',
        },
      ],
    },
  })
  public data: PackageVoucherDomain;

  constructor(
    code: UpdatePackageVoucherResponse['HTTPStatusCode'],
    message: UpdatePackageVoucherResponse['message'],
    links: UpdatePackageVoucherResponse['links'],
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
  ): UpdatePackageVoucherResponse {
    const responseMessage =
      message ?? `Package ID: ${data.id} have been updated successfully.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new UpdatePackageVoucherResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
