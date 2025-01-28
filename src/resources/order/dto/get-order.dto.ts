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
    example: {
      id: '01948342-277a-77ae-bd3a-1ce08e83a92a',
      account: {
        id: '01949c35-fc80-757c-acaf-69702c7825cf',
        email: 'verify2@mail.com',
        fullname: 'Mrs. Verify No.2',
        phone: '0812345511',
        verifiedAt: '1/25/2025, 1:46:11 PM',
        role: 'USER',
      },
      totalPrice: 300,
      createdAt: '1/25/2025, 1:46:19 PM',
      usableDay: '2025-01-24T17:00:00.000Z',
      transaction: {
        id: '01949c36-003a-719c-b4e6-150253ab3d16',
        status: 'SUCCESS',
        paymentId: '01949c36-003a-719c-b4e6-18ebc7cdc85a',
        transactionSystem: 'omise',
        expiredAt: '1/25/2025, 1:46:12 PM',
        createdAt: '1/25/2025, 1:46:19 PM',
        updatedAt: '1/25/2025, 1:46:19 PM',
        deletedAt: null,
      },
      orderItems: [
        {
          id: '01948342-277f-7397-b211-5ff0bdb81905',
          qrcodeImagePath:
            'd22pq9rbvhh9yl.cloudfront.net/qrcode-img/order-item-ID:019488cd-a13d-764f-be0d-0f1db340e5f9',
          code: 'AB2BCB',
          redeemedAt: null,
          updatedAt: '1/25/2025, 1:46:19 PM',
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
        },
        {
          id: '01948342-277f-7397-b211-62057afd4813',
          qrcodeImagePath:
            'd22pq9rbvhh9yl.cloudfront.net/qrcode-img/order-item-ID:019488cd-a13d-764f-be0d-0f1db340e5f9',
          code: 'AB2BCC',
          redeemedAt: null,
          updatedAt: '1/25/2025, 1:46:19 PM',
          detail: {
            voucherId: '01949c35-fc4b-720c-a069-d381f57bfc5f',
            package: {
              packageId: '01949c35-fc56-726a-abca-33f2f2ef7104',
              name: 'โปรโมชั่นแพ็คเกจ ซื้อ1แถม1',
              reward: true,
            },
            title: 'Burger with fries',
            category: 'All-international',
            price: 300,
            usableExpiredAt: '2/1/2025, 12:00:00 AM',
            img: 'd22pq9rbvhh9yl.cloudfront.net/package-img/1736355046659_voucher-template-with-offer_23-2148479796.avif',
          },
        },
      ],
    },
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
    example: [
      {
        id: '01948342-277a-77ae-bd3a-194f5752b687',
        account: {
          id: '01949c35-fc80-757c-acaf-647fa68b5b7f',
          email: 'verify1@mail.com',
          fullname: 'Mr. Verify No.1',
          phone: '0812345555',
          verifiedAt: '1/25/2025, 1:46:11 PM',
          role: 'USER',
        },
        totalPrice: 300,
        createdAt: '1/25/2025, 1:46:19 PM',
        updatedAt: '1/25/2025, 1:46:19 PM',
        usableDay: '2025-01-24T17:00:00.000Z',
        orderItems: [
          {
            id: '01948342-277f-7397-b211-5aa6faa5ff8a',
            qrcodeImagePath:
              'd22pq9rbvhh9yl.cloudfront.net/qrcode-img/order-item-ID:019488cd-a13d-764f-be0d-0f1db340e5f9',
            code: 'AB2BCA',
            redeemedAt: null,
            updatedAt: '1/25/2025, 1:46:19 PM',
            detail: {
              voucherId: '01949c35-fc4b-720c-a069-d381f57bfc5f',
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
      },
    ],
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
