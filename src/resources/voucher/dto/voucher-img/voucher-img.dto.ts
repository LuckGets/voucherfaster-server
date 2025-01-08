import { ApiProperty } from '@nestjs/swagger';
import { VoucherDomain, VoucherImgDomain } from '../../domain/voucher.domain';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HttpStatus } from '@nestjs/common';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';

export const VOUCHER_FILE_FILED = {
  VOUCHER_IMG: 'voucherImg',
  MAIN_IMG: 'mainImg',
} as const;

export class AddVoucherImgDto {
  @ApiProperty({ type: String })
  @IsUUID(7)
  voucherId: VoucherDomain['id'];
  @ApiProperty({
    description:
      'If this property have truthy value. The main img will be delete and not be use as the ordinary image.',
  })
  @Transform(({ value }) => {
    if (value === 'true' || value === 'false') return Boolean(value);
    return false;
  })
  @IsOptional()
  @IsBoolean()
  deleteMainImg?: boolean;
}

export class AddVoucherImgResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: String,
    example: 'Add image for the voucher ID: 123 successful.',
  })
  public message: string;
  @ApiProperty({
    type: Object,
    example: `{"logout": ${AuthPath.Logout}}`,
  })
  public links: HATEOSLink;
  @ApiProperty({
    type: () => Object,
    example: '',
  })
  public data: unknown;

  public static success(
    data: unknown,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): AddVoucherImgResponse {
    const responseMessage = message ?? 'Add image for the voucher successful.';
    const responseCode = statusCode ?? HttpStatus.CREATED;
    const responseLink = links;
    // links ??
    // GenerateAccountResponseHATEOASLink(
    //   data.id as UUIDTypes,
    //   !!data.verifiedAt,
    // );
    return new AddVoucherImgResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}

export class UpdateVoucherImgDto {
  @ApiProperty({ type: String })
  @IsUUID(7)
  voucherId: VoucherDomain['id'];
  @ApiProperty({ type: String })
  @IsUUID(7)
  voucherImgId: VoucherImgDomain['id'];
}

export class UpdateVoucherImgResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: String,
    example: 'Update image ID: 123 successful.',
  })
  public message: string;
  @ApiProperty({
    type: Object,
    example: `{"logout": ${AuthPath.Logout}}`,
  })
  public links: HATEOSLink;
  @ApiProperty({
    type: () => Object,
    example: '',
  })
  public data: VoucherImgDomain;

  public static success(
    data: unknown,
    imageId: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): UpdateVoucherImgResponse {
    const responseMessage = `Update image ID: ${imageId} successful.`;
    const responseCode = statusCode ?? HttpStatus.CREATED;
    const responseLink = links;
    // links ??
    // GenerateAccountResponseHATEOASLink(
    //   data.id as UUIDTypes,
    //   !!data.verifiedAt,
    // );
    return new UpdateVoucherImgResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
