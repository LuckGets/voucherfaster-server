import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { VoucherDomain } from '@resources/voucher/domain/voucher.domain';
import { IsDateGreaterThan } from '@utils/validators/IsDateGreaterThan';
import { Transform } from 'class-transformer';
import { IsArray, IsDate, IsNumber, IsString, IsUUID } from 'class-validator';
import { CoreApiResponse } from 'src/common/core-api-response';
import { PackageVoucherDomain } from '../domain/package-voucher.domain';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';

export const PACKAGE_FILE_FIELD = {
  MAIN_IMG: 'mainImg',
  PACKAGE_IMG: 'packageImg',
} as const;

export class CreatePackageVoucherDto {
  @IsUUID(7)
  @ApiProperty({ type: () => String, description: 'ID of the quota voucher' })
  quotaVoucherId: VoucherDomain['id'];
  @ApiProperty({ type: Number })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  quotaAmount: number;
  @ApiProperty({ type: Number })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  price: number;
  @ApiProperty({ type: () => [String] })
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  rewardVoucherId: VoucherDomain['id'][];
  @ApiProperty({ type: String })
  @IsString()
  title: string;
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
  @ApiProperty({ type: Date })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  startedAt: Date;
  @ApiProperty({ type: Date })
  @IsDateGreaterThan('startedAt')
  @Transform(({ value }) => new Date(value))
  expiredAt: Date;
}

export class CreatePackageVoucherResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.CREATED,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'Package ID: 123 have been created successfully.',
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
  ): CreatePackageVoucherResponse {
    const responseMessage =
      message ?? `Package ID: ${data.id} have been created successfully.`;
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
