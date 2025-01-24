import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { OrderItemDomain } from '@resources/order/domain/order-item.domain';
import { IsString, IsUUID } from 'class-validator';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { HTTPMethod } from 'src/common/http.type';
import { AuthPath, OrderItemPath, RedeemItemPath } from 'src/config/api-path';

export class RedeemItemDto {
  @ApiProperty({
    type: String,
    example: '01948342-277a-77ae-bd3a-194f5752b687',
  })
  @IsUUID(7)
  public orderItemId: string;

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
    example: `{
        "id": "01948342-277f-7397-b211-5aa6faa5ff8a",
        "qrcodeImagePath": "fakePath",
        "code": "AB2BCA",
        "redeemedAt": "1/24/2025, 12:34:52 PM",
        "updatedAt": "1/24/2025, 12:11:07 PM",
        "detail": {
            "id": "019496b8-85c6-717d-8e08-037eba8d9490",
            "title": "Burger with fries",
            "price": 300,
            "usableExpiredAt": "12/26/2025, 12:00:00 AM",
            "img": "https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/1735921280934_burger-with-melted-cheese.webp",
            "category": "All-international",
            "promotion": null,
            "package": null
        },
        "order": {
            "id": "01948342-277a-77ae-bd3a-194f5752b687",
            "totalPrice": 300,
            "createdAt": "1/24/2025, 12:11:07 PM",
            "usableDay": "2025-01-23T17:00:00.000Z",
            "transaction": {
                "id": "019496b8-85fa-73c0-ac37-5c05f62a6f87",
                "status": "SUCCESS",
                "paymentId": "019496b8-85fa-73c0-ac37-63c4334c99fb",
                "transactionSystem": "omise",
                "expiredAt": "1/24/2025, 12:11:02 PM",
                "createdAt": "1/24/2025, 12:11:07 PM",
                "updatedAt": "1/24/2025, 12:11:07 PM",
                "deletedAt": null
            }
        }
    }`,
  })
  public data: OrderItemDomain;

  public static success(
    data: OrderItemDomain,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): RedeemItemResponse {
    const responseMessage =
      message ?? `${HTTPMethod.Post}:: ${RedeemItemPath.Base} successful.`;
    const responseCode = statusCode ?? HttpStatus.CREATED;
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
