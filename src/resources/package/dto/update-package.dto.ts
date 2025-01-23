import { ApiProperty } from '@nestjs/swagger';
import { TermAndCondUpdateDto } from '@resources/voucher/dto/vouchers/update-voucher.dto';
import { IsFutureDate } from '@utils/validators/IsFutureDate';
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
import { VoucherDomain } from '@resources/voucher/domain/voucher.domain';
import { IsArrayOfUUID } from '@utils/validators/IsArrayOfUUID';
import { PackageVoucherDomain } from '../domain/package-voucher.domain';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HttpStatus } from '@nestjs/common';
import { AuthPath } from 'src/config/api-path';
import { HATEOSLink } from 'src/common/hateos.type';
import { plainArrayTransformer } from '@utils/transformer/plainArrayTransformer';
import { AtLeastOneProperty } from '@utils/validators/AtleastOneProp';

export class AddPackageRewardVoucherDto {
  @ApiProperty({
    type: String,
    description: 'The property for any new updated reward voucher for package.',
  })
  @IsUUID(7)
  voucherId: VoucherDomain['id'];
  @IsPositive()
  amount: number;
}

export class UpdateRewardVoucherDto {
  @IsUUID(7)
  rewardId: VoucherDomain['id'];
  @IsPositive()
  amount: number;
}

@AtLeastOneProperty(UpdatePackageRewardVoucherDto.updatAbleField())
export class UpdatePackageRewardVoucherDto {
  @ApiProperty({ type: () => [AddPackageRewardVoucherDto] })
  @Transform(({ value }) =>
    plainArrayTransformer(value, AddPackageRewardVoucherDto),
  )
  @ValidateNested({ each: true })
  @Type(() => AddPackageRewardVoucherDto)
  @IsOptional()
  addRewardVouchers?: AddPackageRewardVoucherDto[];
  @ApiProperty({
    type: [String],
    description:
      'Only provided value for this property when desired to remove one of the reward voucher from package.',
  })
  @IsArrayOfUUID()
  @IsOptional()
  removedRewardIds?: VoucherDomain['id'][];
  @ApiProperty({ type: () => [UpdateRewardVoucherDto] })
  @ValidateNested({ each: true })
  @Type(() => UpdateRewardVoucherDto)
  @IsOptional()
  update?: UpdateRewardVoucherDto[];

  public static updatAbleField(): Array<keyof UpdatePackageRewardVoucherDto> {
    return ['addRewardVouchers', 'removedRewardIds', 'update'];
  }
}

export class UpdatePackageVoucherDto {
  @ApiProperty({ type: String })
  @IsUUID(7)
  id: string;
  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  title?: string;
  @ApiProperty({ type: String })
  @IsUUID(7)
  @IsOptional()
  quotaVoucherId?: string;
  @ApiProperty({ type: Number })
  @Transform(({ value }) => Number(value))
  @IsPositive()
  @IsOptional()
  stockAmount?: number;
  @ApiProperty({ type: Number })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  quotaAmount?: number;
  @ApiProperty({ type: Number })
  @IsPositive()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  packagePrice?: number;
  @ApiProperty({ type: () => [UpdatePackageRewardVoucherDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdatePackageRewardVoucherDto)
  rewardVouchers?: UpdatePackageRewardVoucherDto;
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
  @ApiProperty({ type: () => [TermAndCondUpdateDto] })
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @IsOptional()
  termAndCondTh?: TermAndCondUpdateDto[];
  @ApiProperty({ type: () => [TermAndCondUpdateDto] })
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @IsOptional()
  termAndCondEn?: TermAndCondUpdateDto[];
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
    example: `{
        "id": "019493bc-c4d9-7154-88dc-eb09f15b00af",
        "title": "เป็ดฮ่องกงแซ่บๆ 2 แถม 1",
        "price": 1200,
        "stockAmount": 100,
        "quotaVoucherId": "019493bc-c4ca-713f-98a1-216bdd8ae66a",
        "quotaAmount": 2,
        "usableAt": "1/1/2025, 12:00:00 AM",
        "usableExpiredAt": "2/1/2025, 12:00:00 AM",
        "sellStartedAt": "1/1/2025, 12:00:00 AM",
        "sellExpiredAt": "2/1/2025, 12:00:00 AM",
        "createdAt": "1/23/2025, 10:16:56 PM",
        "updatedAt": "1/23/2025, 10:16:56 PM",
        "category": "Yok chinese restaurant",
        "images": [
            {
                "id": "019493bc-c4d9-7154-88dc-f859cd94bc3e",
                "mainImg": true,
                "imgPath": "d22pq9rbvhh9yl.cloudfront.net/package-img/เป็ด.jpg"
            }
        ],
        "rewardVouchers": [
            {
                "id": "019493bc-c4d9-7154-88dc-f12d7ad821f1",
                "voucherId": "019493bc-c4ca-713f-98a1-216bdd8ae66a",
                "amount": 1,
                "category": "Yok chinese restaurant"
            }
        ],
        "termAndCond": {
            "en": [
                {
                    "id": "019493bc-c4d9-7154-88dd-09b6e1f5a268",
                    "description": "This voucher can only be used on roasted duck dishes."
                }
            ],
            "th": [
                {
                    "id": "019493bc-c4d9-7154-88dd-01a56417339a",
                    "description": "คูปองนี้สามารถใช้ได้เฉพาะกับจานเป็ดย่างเท่านั้น"
                }
            ]
        }
    }`,
  })
  public data: PackageVoucherDomain;

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
