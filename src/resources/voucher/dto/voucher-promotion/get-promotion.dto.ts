import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { VoucherPromotionDomain } from '@resources/voucher/domain/voucher-promotion.domain';
import { VoucherDomain } from '@resources/voucher/domain/voucher.domain';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';

export class GetManyVoucherPromotionResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'GET: /vouchers/promotions successfully.',
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
  public data: VoucherPromotionDomain[];
  public cursor: VoucherPromotionDomain['id'];

  public static success(
    data: VoucherPromotionDomain[],
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): GetManyVoucherPromotionResponse {
    const responseMessage =
      message ?? `GET: /vouchers/promotions successfully.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    const response = new GetManyVoucherPromotionResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
    response.cursor = data[data.length - 1].id;
    return response;
  }
}

export class GetVoucherPromotionByIdResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'GET: /vouchers/1/promotion/1 successfully.',
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
  public data: VoucherPromotionDomain;

  public static success(
    data: VoucherPromotionDomain,
    message?: VoucherDomain['id'],
    links?: HATEOSLink,
    statusCode?: number,
  ): GetVoucherPromotionByIdResponse {
    const responseMessage =
      message ?? `GET: promotion/${data.id} successfully.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new GetVoucherPromotionByIdResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
