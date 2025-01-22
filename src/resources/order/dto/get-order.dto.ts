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
    example: HttpStatus.OK,
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
    example: `{
        "id": "01948342-277a-77ae-bd3a-194f5752b687",
        "totalPrice": "300",
        "createdAt": "1/20/2025, 5:38:42 PM",
        "usableDay": "2025-01-22T17:00:00.000Z",
        "orderItems": [
            {
                "id": "01948342-277f-7397-b211-5aa6faa5ff8a",
                "qrcodeImagePath": "fakePath",
                "code": "AB2BCA",
                "redeemedAt": null,
                "updatedAt": "1/20/2025, 5:38:42 PM",
                "detail": {
                    "title": "Burger with fries",
                    "price": 300,
                    "usageExpiredTime": "12/26/2025, 12:00:00 AM",
                    "img": [
                        {
                            "id": "0194834a-ff4e-7244-be8c-b1521de8c8f0",
                            "imgPath": "https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/1735921280934_burger-with-melted-cheese.webp",
                            "mainImg": true
                        }
                    ]
                }
            }
        ]
    }`,
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
    const responseCode = statusCode ?? HttpStatus.OK;
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
    example: `[
        {
            "id": "01948342-277a-77ae-bd3a-194f5752b687",
            "account": {
                "id": "0194834a-ff7b-735f-8b38-9e4d4df3902d",
                "email": "verify1@mail.com",
                "fullname": "Mr. Verify No.1",
                "phone": "0812345555"
            },
            "totalPrice": "300",
            "createdAt": "1/20/2025, 5:38:42 PM",
            "updatedAt": "1/20/2025, 5:38:42 PM",
            "usableDay": "2025-01-22T17:00:00.000Z",
            "orderItems": [
                {
                    "id": "01948342-277f-7397-b211-5aa6faa5ff8a",
                    "qrcodeImagePath": "fakePath",
                    "code": "AB2BCA",
                    "redeemedAt": null,
                    "updatedAt": "1/20/2025, 5:38:42 PM",
                    "item": {
                        "id": "0194834a-ff7b-735f-8b38-d4ab86d41196",
                        "voucher": {
                            "id": "0194834a-ff4e-7244-be8c-877f5b7deb7d",
                            "stockAmount": 10000,
                            "description": "Juicy burgers with crispy french fries.",
                            "price": 300,
                            "saleExpiredTime": "12/26/2025, 12:00:00 AM",
                            "title": "Burger with fries",
                            "usageExpiredTime": "12/26/2025, 12:00:00 AM",
                            "status": "ACTIVE",
                            "img": [
                                {
                                    "id": "0194834a-ff4e-7244-be8c-b1521de8c8f0",
                                    "imgPath": "https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/1735921280934_burger-with-melted-cheese.webp",
                                    "mainImg": true
                                }
                            ]
                        }
                    }
                }
            ]
        }
  ]`,
  })
  public data: OrderDomain[];
  @ApiProperty({
    type: String,
    example: '01948342-277a-77ae-bd3a-194f5752b687',
  })
  public cursor: OrderDomain['id'];

  public static success(
    data: OrderDomain[],
    queryOption?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): GetPaginationOrderResponse {
    const responseMessage = `${HTTPMethod.Get}:: ${OrderPath.Base}${queryOption ?? ''} successful.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    const response = new GetPaginationOrderResponse(
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
