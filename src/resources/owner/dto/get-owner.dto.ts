import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath, OwnerPath } from 'src/config/api-path';
import { OwnerDomain } from '../domain/owner.domain';
import { HTTPMethod } from 'src/common/http.type';

export class GetAllOwnerInformationResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'GET:: /vouchers/ข้าวเหนียว successfully.',
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
      "id": "019446d1-6d43-760d-9a0b-489e626e2f8d",
      "code": "AA-101",
      "description": "Juicy burgers with crispy french fries.",
      "price": 300,
      "saleExpiredTime": "12/26/2025, 12:00:00 AM",
      "title": "Burger with fries",
      "usageExpiredTime": "12/26/2025, 12:00:00 AM",
      "status": "ACTIVE",
      "img": [
        {
          "id": "019446d1-6d44-73cf-bcdf-8b1bbd6b070f",
          "imgPath": "https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/1735921280934_burger-with-melted-cheese.webp"
        }
      ],
      "promotion": [
        {
          "id": "019446d1-a9e0-7b83-b87e-eb59cc44bb31",
          "name": "ลดแรงต้อนรับปีใหม่",
          "sellStartedAt": "1/1/2025, 12:00:00 AM",
          "sellExpiredAt": "2/15/2025, 12:00:00 AM",
          "usableAt": "1/11/2025, 12:00:00 AM",
          "usableExpiredAt": "2/1/2025, 12:00:00 AM",
          "promotionPrice": 199
        }
      ]
    }`,
  })
  public data: OwnerDomain;

  public static success(
    data: OwnerDomain,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): GetAllOwnerInformationResponse {
    const responseMessage =
      message ?? `${HTTPMethod.Get}:: ${OwnerPath.Base} successful.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new GetAllOwnerInformationResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
