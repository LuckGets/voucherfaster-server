import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath, VoucherPath } from 'src/config/api-path';
import { VoucherDomain } from '../../domain/voucher.domain';
import { HTTPMethod } from 'src/common/http.type';
import { NullAble } from '@utils/types/common.type';

export class GetManyVoucherResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'GET:: /vouchers/123 successfully.',
  })
  public message: string;
  @ApiProperty({
    type: Object,
    example: `{"logout": ${AuthPath.Logout}}`,
  })
  public links: HATEOSLink;
  @ApiProperty({
    type: Object,
    example: `[{
      "id": "019446d1-6d43-760d-9a0b-489e626e2f8d",
      "code": "AA-101",
      "description": "Juicy burgers with crispy french fries.",
      "price": 300,
      "stockAmount": 10000,
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
          "stockAmount": 100,
          "sellStartedAt": "1/1/2025, 12:00:00 AM",
          "sellExpiredAt": "2/15/2025, 12:00:00 AM",
          "usableAt": "1/11/2025, 12:00:00 AM",
          "usableExpiredAt": "2/1/2025, 12:00:00 AM",
          "promotionPrice": 199
        }
      ]
    }]`,
  })
  public data: VoucherDomain[];
  @ApiProperty({
    type: String,
    description:
      "The last data's ID using in the next query to retrive the next data pages.",
  })
  public cursor: VoucherDomain['id'];

  public static success(
    data: VoucherDomain[],
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): GetManyVoucherResponse {
    const responseMessage =
      message ?? `${HTTPMethod.Get}:: ${VoucherPath.Base} successful.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    const cursor = data[data.length - 1].id;
    // generateVoucherReponseHATEOASLink(data.id);
    const response = new GetManyVoucherResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
    response.cursor = cursor;
    return response;
  }
}

export class GetVoucherBySearchContentResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'GET:: /vouchers/search/ข้าวเหนียว successfully.',
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
  public data: NullAble<VoucherDomain[]>;

  public static success(
    data: VoucherDomain[],
    searchContent: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): GetVoucherBySearchContentResponse {
    const responseMessage = `${HTTPMethod.Get} ${VoucherPath.Base}/${VoucherPath.SearchVoucher.split('/')[0]}/${searchContent} successful.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new GetVoucherBySearchContentResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}

export class GetVoucherByIdResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'GET:: /vouchers/1  successfully.',
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
  public data: NullAble<VoucherDomain>;

  public static success(
    data: VoucherDomain,
    paramId: VoucherDomain['id'],
    links?: HATEOSLink,
    statusCode?: number,
  ): GetVoucherByIdResponse {
    const responseMessage = `${HTTPMethod.Get} ${VoucherPath.Base}/${paramId} successful.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new GetVoucherByIdResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
