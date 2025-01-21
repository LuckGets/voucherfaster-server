import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { OrderDomain } from '@resources/order/domain/order.domain';
import { IsString, IsUUID } from 'class-validator';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';

export class ProcessPaymentDto {
  @IsUUID(7)
  @ApiProperty({ type: () => String })
  orderId: OrderDomain['id'];

  @IsString()
  paymentToken: string;
}

export class OrderSuccessAfterPaymentResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example:
      'Order ID: 123 for account ID: 321 have been created successfully.',
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
        "id": "019488cd-a13d-764f-be0d-080d4072aac5",
        "totalPrice": 300,
        "createdAt": "1/21/2025, 7:19:25 PM",
        "usableDay": "2025-01-23T17:00:00.000Z",
        "transaction": {
            "id": "019488cd-a14b-7e13-9146-3bcbfdaef644",
            "status": "SUCCESS",
            "transactionSystem": "omise",
            "createdAt": "1/21/2025, 7:19:25 PM",
            "updatedAt": "1/21/2025, 7:19:25 PM",
            "deletedAt": null
        }
    }`,
  })
  public data: OrderDomain;

  public static success(
    data: OrderDomain,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): OrderSuccessAfterPaymentResponse {
    const responseMessage =
      message ?? `Payment for Order ID: ${data.id} successful.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new OrderSuccessAfterPaymentResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
