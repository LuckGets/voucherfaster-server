import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { OrderItemDomain } from '@resources/order/domain/order-item.domain';
import { IsString, IsUUID } from 'class-validator';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { HTTPMethod } from 'src/common/http.type';
import { AuthPath, OrderItemPath } from 'src/config/api-path';

export class RedeemItemDto {
  @ApiProperty({
    type: String,
    example: '01948342-277a-77ae-bd3a-194f5752b687',
  })
  @IsUUID(7)
  public itemId: string;

  @ApiProperty({
    type: String,
    example: 'doggo_bark_bark',
    description: 'secret password for redeem voucher',
  })
  @IsString()
  public passwordForRedeem: string;
}

export class RedeemItemResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'GET:: /orders successful.',
  })
  public message: string;
  @ApiProperty({
    type: Object,
    example: `{"logout": ${AuthPath.Logout}}`,
  })
  public links: HATEOSLink;
  @ApiProperty({
    type: Object,
    example: ``,
  })
  public data: OrderItemDomain;

  public static success(
    data: OrderItemDomain,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): RedeemItemResponse {
    const responseMessage =
      message ??
      `${HTTPMethod.Patch}:: ${OrderItemPath.Base}/${data.id}${OrderItemPath.Redeem.split(`/${OrderItemPath.OrderItemIdParm}`)[0]} successful.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new RedeemItemResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
