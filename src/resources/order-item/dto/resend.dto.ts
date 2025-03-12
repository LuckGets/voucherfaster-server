import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';
import { OrderItemDomain } from '../domain/order-item.domain';

export class ResendOrderItemResponse extends CoreApiResponse {
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
    example: '',
  })
  public data: OrderItemDomain;

  public static success(
    data: ResendOrderItemResponse['data'],
    links?: HATEOSLink,
    statusCode?: number,
  ): ResendOrderItemResponse {
    const responseMessage = `Resend qrcode to ${data.order.account.email} successfully.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new ResendOrderItemResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
