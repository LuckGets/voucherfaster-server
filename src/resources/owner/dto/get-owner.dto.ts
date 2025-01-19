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
        "email": "kasides12@gmail.com",
        "colorCode": "006838",
        "name": "The Emerald Hotel",
        "img": [
            {
                "id": "01947d72-d747-7718-9cbc-373aface36fe",
                "imgPath": "d22pq9rbvhh9yl.cloudfront.net/owner-img/logo.png",
                "type": "LOGO",
                "createdAt": "1/19/2025, 2:24:29 PM",
                "updatedAt": "1/19/2025, 2:24:29 PM"
            },
            {
                "id": "01947d72-d747-7718-9cbc-39288701b13a",
                "imgPath": "d22pq9rbvhh9yl.cloudfront.net/owner-img/Seafood-on-ice-2.jpg",
                "type": "BACKGROUND",
                "createdAt": "1/19/2025, 2:24:29 PM",
                "updatedAt": "1/19/2025, 2:24:29 PM"
            },
            {
                "id": "01947d72-d747-7718-9cbc-3d2545b9898a",
                "imgPath": "d22pq9rbvhh9yl.cloudfront.net/owner-img/pexels-jimbear-1458457.jpg",
                "type": "BACKGROUND",
                "createdAt": "1/19/2025, 2:24:29 PM",
                "updatedAt": "1/19/2025, 2:24:29 PM"
            },
            {
                "id": "01947d72-d747-7718-9cbc-4397737d4f26",
                "imgPath": "d22pq9rbvhh9yl.cloudfront.net/owner-img/images.jpg",
                "type": "BACKGROUND",
                "createdAt": "1/19/2025, 2:24:29 PM",
                "updatedAt": "1/19/2025, 2:24:29 PM"
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
