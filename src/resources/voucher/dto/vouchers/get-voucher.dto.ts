import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath, VoucherPath } from 'src/config/api-path';
import { VoucherDomain } from '../../domain/voucher.domain';
import { HTTPMethod } from 'src/common/http.type';
import { NullAble } from '@utils/types/common.type';

export enum PaginationSellDateQueryEnum {
  NOW = 'NOW',
  EXPIRED = 'EXPIRED',
  ALL = 'ALL',
}

export enum PaginationDiscountQueryEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  NONE = 'NONE',
  ALL = 'ALL',
}

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
            "id": "01948e4f-ceee-779e-bb82-d5509924f01f",
            "stockAmount": 10000,
            "description": "Spicy and hot tofu.",
            "price": 210,
            "usableAt": "1/1/2025, 12:00:00 AM",
            "usableExpiredAt": "12/26/2025, 12:00:00 AM",
            "sellStartedAt": "12/26/2024, 12:00:00 AM",
            "sellExpiredAt": "12/26/2025, 12:00:00 AM",
            "title": "Mapo tofu",
            "status": "ACTIVE",
            "tag": "main courses",
            "category": "Yok chinese restaurant",
            "img": [
                {
                    "id": "01948e4f-ceee-779e-bb83-007291c47fb0",
                    "imgPath": "https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/กะเพาะปลาน้ำแดง.jpg"
                }
            ],
            "promotion": []
        }]`,
  })
  public data: VoucherDomain[];
  @ApiProperty({
    type: String,
    description:
      "The last data's ID using in the next query to retrive the next data pages.",
  })
  public cursor: VoucherDomain['id'];

  constructor(
    code: number,
    message: string,
    link: HATEOSLink,
    data: VoucherDomain[],
    cursor: VoucherDomain['id'],
  ) {
    super(code, message, link);

    this.data = data;
    this.cursor = cursor;
  }

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
    // generateVoucherReponseHATEOASLink(data.id);
    const nxtPageCursor = data.length > 0 ? data[data.length - 1].id : null;

    return new GetManyVoucherResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
      nxtPageCursor,
    );
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
    example: `[
        {
            "id": "01948e4f-ceee-779e-bb82-aff619243c99",
            "stockAmount": 10000,
            "description": "Juicy burgers with crispy french fries.",
            "price": 300,
            "usableAt": "1/1/2025, 12:00:00 AM",
            "usableExpiredAt": "12/26/2025, 12:00:00 AM",
            "sellStartedAt": "12/26/2024, 12:00:00 AM",
            "sellExpiredAt": "12/26/2025, 12:00:00 AM",
            "title": "Burger with fries",
            "status": "ACTIVE",
            "tag": "Lunch",
            "category": "All-international",
            "img": [
                {
                    "id": "01948e4f-ceee-779e-bb82-d856ec856bda",
                    "imgPath": "https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/1735921280934_burger-with-melted-cheese.webp"
                }
            ],
            "promotion": [
                {
                    "id": "01948e4f-ceee-779e-bb83-048c2c7462fa",
                    "name": "ลดแรงต้อนรับปีใหม่",
                    "stockAmount": 150,
                    "sellStartedAt": "1/1/2025, 12:00:00 AM",
                    "sellExpiredAt": "2/15/2025, 12:00:00 AM",
                    "usableAt": "1/11/2025, 12:00:00 AM",
                    "usableExpiredAt": "2/1/2025, 12:00:00 AM",
                    "promotionPrice": 199
                }
            ]
        }
    ]`,
  })
  public data: NullAble<VoucherDomain[]>;
  @ApiProperty({
    type: String,
    example: `9HrBC1jMQ3KlZw4CssPUeQ`,
  })
  public cursor: NullAble<VoucherDomain['id']>;

  constructor(
    code: number,
    message: string,
    link: HATEOSLink,
    data: GetVoucherBySearchContentResponse['data'],
    cursor: GetVoucherBySearchContentResponse['cursor'],
  ) {
    super(code, message, link);

    this.data = data;
    this.cursor = cursor;
  }

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
    const nxtPageCursor = data.length > 0 ? data[data.length - 1].id : null;

    return new GetVoucherBySearchContentResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
      nxtPageCursor,
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
    example: `{
        "id": "01948e7f-845f-774d-ad8d-29e5f496eacd",
        "stockAmount": 10000,
        "description": "CRISPY BURGER",
        "price": 30000,
        "usableAt": "12/25/2025, 12:00:00 AM",
        "usableExpiredAt": "12/26/2025, 12:00:00 AM",
        "sellStartedAt": "10/24/2025, 12:00:00 AM",
        "sellExpiredAt": "12/26/2025, 12:00:00 AM",
        "title": "CRISPY BURGER",
        "status": "ACTIVE",
        "tag": "main courses",
        "category": "Yok chinese restaurant",
        "img": [
            {
                "id": "01948e7f-8460-717e-b372-509aebfcf5f3",
                "imgPath": "d22pq9rbvhh9yl.cloudfront.net/voucher-img/1737557508730_rocks.jpg",
                "mainImg": true
            }
        ],
        "termAndCond": {
            "th": [
                {
                    "id": "01948e7f-8460-717e-b372-4339444a35eb",
                    "description": "เคี้ยวมันส์ๆ"
                }
            ],
            "en": [
                {
                    "id": "01948e7f-8460-717e-b372-4752ec43a770",
                    "description": "Enjoy eating"
                },
                {
                    "id": "01948e7f-8460-717e-b372-487aeb43ca87",
                    "description": "Have fun"
                }
            ]
        },
        "promotion": []
    }`,
  })
  public data: NullAble<VoucherDomain>;

  constructor(
    code: number,
    message: string,
    link,
    data: GetVoucherByIdResponse['data'],
  ) {
    super(code, message, link);
    this.data = data;
  }

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
