import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { OrderItemDomain } from '@resources/order-item/domain/order-item.domain';
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
        id: '01949c46-21a9-73cc-b056-3284fc38f446',
        qrcodeImagePath:
          'd22pq9rbvhh9yl.cloudfront.net/qrcode-img/order-item-ID:01949c46-21a9-73cc-b056-3284fc38f446',
        code: 'NG8CAG',
        redeemedAt: null,
        updatedAt: '1/25/2025, 2:19:22 PM',
        detail: {
          voucherId: '01949c35-fc4b-720c-a069-d381f57bfc5f',
          package: {
            packageId: '01949c35-fc56-726a-abca-33f2f2ef7104',
            name: 'โปรโมชั่นแพ็คเกจ ซื้อ1แถม1',
            reward: false,
          },
          title: 'Burger with fries',
          category: 'All-international',
          price: 300,
          usableExpiredAt: '2/1/2025, 12:00:00 AM',
          img: 'd22pq9rbvhh9yl.cloudfront.net/package-img/1736355046659_voucher-template-with-offer_23-2148479796.avif',
        },
        order: {
          id: '01949c46-21a9-73cc-b056-2b93b57033ea',
          account: {
            id: '01949c35-fc80-757c-acaf-703a56560db4',
            email: 'kasides15@gmail.com',
            fullname: 'Me Me',
            phone: '0812345556',
            verifiedAt: '1/25/2025, 1:46:11 PM',
            role: 'USER',
          },
          totalPrice: 600,
          createdAt: '1/25/2025, 2:03:49 PM',
          usableDay: '2025-01-27T17:00:00.000Z',
          transaction: {
            id: '01949c46-21ce-7d52-afd2-ca744b5dabd0',
            status: 'SUCCESS',
            paymentId: 'chrg_test_62iyjyc5literl2ospe',
            transactionSystem: 'omise',
            expiredAt: '1/25/2025, 2:33:49 PM',
            createdAt: '1/25/2025, 2:03:49 PM',
            updatedAt: '1/25/2025, 2:19:21 PM',
            deletedAt: null,
          },
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

export class GetByOrderItemIdResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: `GET:: ${OrderItemPath.Base}/1123 successful.`,
  })
  public message: string;
  @ApiProperty({
    type: Object,
    example: `{"logout": ${AuthPath.Logout}}`,
  })
  public links: HATEOSLink;
  @ApiProperty({
    type: Object,
    example: {
      id: '01949c46-21a9-73cc-b056-3284fc38f446',
      qrcodeImagePath:
        'd22pq9rbvhh9yl.cloudfront.net/qrcode-img/order-item-ID:01949c46-21a9-73cc-b056-3284fc38f446',
      code: 'NG8CAG',
      redeemedAt: null,
      updatedAt: '1/25/2025, 2:19:22 PM',
      detail: {
        voucherId: '01949c35-fc4b-720c-a069-d381f57bfc5f',
        package: {
          packageId: '01949c35-fc56-726a-abca-33f2f2ef7104',
          name: 'โปรโมชั่นแพ็คเกจ ซื้อ1แถม1',
          reward: false,
        },
        title: 'Burger with fries',
        category: 'All-international',
        price: 300,
        usableExpiredAt: '2/1/2025, 12:00:00 AM',
        img: 'd22pq9rbvhh9yl.cloudfront.net/package-img/1736355046659_voucher-template-with-offer_23-2148479796.avif',
      },
      order: {
        id: '01949c46-21a9-73cc-b056-2b93b57033ea',
        account: {
          id: '01949c35-fc80-757c-acaf-703a56560db4',
          email: 'kasides15@gmail.com',
          fullname: 'Me Me',
          phone: '0812345556',
          verifiedAt: '1/25/2025, 1:46:11 PM',
          role: 'USER',
        },
        totalPrice: 600,
        createdAt: '1/25/2025, 2:03:49 PM',
        usableDay: '2025-01-27T17:00:00.000Z',
        transaction: {
          id: '01949c46-21ce-7d52-afd2-ca744b5dabd0',
          status: 'SUCCESS',
          paymentId: 'chrg_test_62iyjyc5literl2ospe',
          transactionSystem: 'omise',
          expiredAt: '1/25/2025, 2:33:49 PM',
          createdAt: '1/25/2025, 2:03:49 PM',
          updatedAt: '1/25/2025, 2:19:21 PM',
          deletedAt: null,
        },
      },
    },
  })
  public data: OrderItemDomain;

  public static success(
    data: OrderItemDomain,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): GetByOrderItemIdResponse {
    const responseMessage =
      message ??
      `${HTTPMethod.Get}:: ${OrderItemPath.Base}/${data.id} successful.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new GetByOrderItemIdResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
