import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { CoreApiResponse } from 'src/common/core-api-response';
import { AuthPath, UsableDaysPath, VoucherPath } from 'src/config/api-path';
import { HATEOSLink } from 'src/common/hateos.type';
import { UsableDaysAfterPurchasedDomain } from '../domain/usable-day.domain';
import { HTTPMethod } from 'src/common/http.type';

export class UpdateUsableDaysAfterPurchasedDayDto {
  @ApiProperty({ type: String })
  id?: string;
  @ApiProperty({ type: Number })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  usableDays: number;
}

export class UpdateUsableDaysAfterPurchasedResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'PATCH:: /usabledays successfully.',
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
  public data: UsableDaysAfterPurchasedDomain;

  public static success(
    data: UsableDaysAfterPurchasedDomain,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): UpdateUsableDaysAfterPurchasedResponse {
    const responseMessage =
      message ?? `${HTTPMethod.Patch}:: ${UsableDaysPath.Base} successfully.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new UpdateUsableDaysAfterPurchasedResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
