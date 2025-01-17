import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath, OrderPath } from 'src/config/api-path';
import { OrderDomain } from '../domain/order.domain';
import { HTTPMethod } from 'src/common/http.type';

export class GetOrderByIdReponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.CREATED,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'GET:: /orders/123 successful.',
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
  public data: OrderDomain;

  public static success(
    data: OrderDomain,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): GetOrderByIdReponse {
    const responseMessage =
      message ?? `${HTTPMethod.Get}:: ${OrderPath.Base}/${data.id} successful.`;
    const responseCode = statusCode ?? HttpStatus.CREATED;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new GetOrderByIdReponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}

export class GetPaginationOrderResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.CREATED,
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
    example: 'sdfsdf',
  })
  public data: OrderDomain[];
  public cursor: OrderDomain['id'];

  public static success(
    data: OrderDomain[],
    queryOption?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): GetPaginationOrderResponse {
    const responseMessage = `${HTTPMethod.Get}:: ${OrderPath.Base}${queryOption} successful.`;
    const responseCode = statusCode ?? HttpStatus.CREATED;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    const response = new GetPaginationOrderResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
    response.cursor = data[data.length - 1].id;
    return response;
  }
}
