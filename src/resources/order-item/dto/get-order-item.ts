import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { OrderItemDomain } from '@resources/order/domain/order-item.domain';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { HTTPMethod } from 'src/common/http.type';
import { AuthPath, OrderItemPath } from 'src/config/api-path';

export class GetPaginationOrderItemsResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: `GET:: ${OrderItemPath.Base} successful.`,
  })
  public message: string;
  @ApiProperty({
    type: Object,
    example: `{"logout": ${AuthPath.Logout}}`,
  })
  public links: HATEOSLink;
  @ApiProperty({
    type: Object,
    example: [
      {
        id: '01948342-277f-7397-b211-5aa6faa5ff8a',
        qrcodeImagePath: 'fakePath',
        code: 'AB2BCA',
        redeemedAt: '1/24/2025, 3:24:45 PM',
        updatedAt: '1/24/2025, 3:14:46 PM',
        detail: {
          id: '01949760-aa56-76f1-8ae0-b312299c3410',
          title: 'Burger with fries',
          price: 300,
          usableExpiredAt: '12/26/2025, 12:00:00 AM',
          img: 'https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/1735921280934_burger-with-melted-cheese.webp',
          category: 'All-international',
          promotion: null,
          package: null,
        },
      },
    ],
  })
  public data: OrderItemDomain[];
  @ApiProperty({
    type: String,
    example: '01948342-277a-77ae-bd3a-194f5752b687',
  })
  public cursor: OrderItemDomain['id'];

  public static success(
    data: OrderItemDomain[],
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): GetPaginationOrderItemsResponse {
    const responseMessage =
      message ?? `${HTTPMethod.Get}:: ${OrderItemPath.Base} successful.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    const response = new GetPaginationOrderItemsResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
    if (data.length > 0) {
      response.cursor = data[data.length - 1].id;
      return response;
    }
    response.cursor = null;
    return response;
  }
}
