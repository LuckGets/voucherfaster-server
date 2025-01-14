import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { CoreApiResponse } from 'src/common/core-api-response';
import { VoucherUsageDaysDomain } from '../domain/voucher-usage-day.domain';
import { AuthPath, VoucherPath } from 'src/config/api-path';
import { HATEOSLink } from 'src/common/hateos.type';

export class UpdateVoucherUsageDayDto {
  @ApiProperty({ type: String })
  id?: string;
  @ApiProperty({ type: Number })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  usageDays: number;
}

export class UpdateVoucherUsageDayResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'PATCH:: /vouchers/usabledays successfully.',
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
  public data: VoucherUsageDaysDomain;

  public static success(
    data: VoucherUsageDaysDomain,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): UpdateVoucherUsageDayResponse {
    const responseMessage =
      message ??
      `PATCH:: ${VoucherPath.Base}/${VoucherPath.UpdateVoucherUsageDay} successfully.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new UpdateVoucherUsageDayResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
