import { ApiProperty } from '@nestjs/swagger';
import { TermAndCondUpdateDto } from '@resources/voucher/dto/vouchers/update-voucher.dto';
import { IsFutureDate } from '@utils/validators/IsFutureDate';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { VoucherDomain } from '@resources/voucher/domain/voucher.domain';
import { IsArrayOfUUID } from '@utils/validators/IsArrayOfUUID';
import {
  PackageRewardVoucherDomain,
  PackageVoucherDomain,
} from '../domain/package-voucher.domain';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HttpStatus } from '@nestjs/common';
import { AuthPath } from 'src/config/api-path';
import { HATEOSLink } from 'src/common/hateos.type';

export class UpdatePackageRewardVoucherDto {
  @ApiProperty({
    type: String,
    description: 'The property for any new updated reward voucher for package.',
  })
  @IsOptional()
  @IsArrayOfUUID()
  rewardVouchersId: VoucherDomain['id'];
  @ApiProperty({
    type: String,
    description:
      'Only provided value for this property when desired to remove one of the reward voucher from package.',
  })
  @IsUUID(7)
  @IsOptional()
  removedVoucherId?: VoucherDomain['id'];
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
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  quotaAmount?: number;
  @ApiProperty({ type: Number })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  price?: number;
  @ApiProperty({ type: () => [UpdatePackageRewardVoucherDto] })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  rewardVouchers?: UpdatePackageRewardVoucherDto[];
  @ApiProperty({ type: Date })
  @IsFutureDate()
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  startedAt?: Date;
  @ApiProperty({ type: Date })
  @IsFutureDate()
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  expiredAt?: Date;
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

  public static success(
    data: PackageVoucherDomain,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): UpdatePackageVoucherResponse {
    const responseMessage =
      message ?? `Package ID: ${data.id} have been updated successfully.`;
    const responseCode = statusCode ?? HttpStatus.CREATED;
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
