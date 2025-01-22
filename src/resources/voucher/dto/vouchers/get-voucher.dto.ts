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
            "id": "01948d4a-de2a-73eb-9277-293247919501",
            "stockAmount": 10000,
            "description": "Juicy burgers with crispy french fries.",
            "price": 300,
            "sellExpiredAt": "12/26/2025, 12:00:00 AM",
            "title": "Burger with fries",
            "usableExpiredAt": "12/26/2025, 12:00:00 AM",
            "status": "ACTIVE",
            "tag": "Lunch",
            "category": "All-international",
            "img": [
                {
                    "id": "01948d4a-de2a-73eb-9277-550531ea1f95",
                    "imgPath": "https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/1735921280934_burger-with-melted-cheese.webp"
                }
            ],
            "promotion": [
                {
                    "id": "01948d4a-de2a-73eb-9277-81c269877cae",
                    "name": "ลดแรงต้อนรับปีใหม่",
                    "stockAmount": 150,
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
    let cursor = null;
    // generateVoucherReponseHATEOASLink(data.id);
    const response = new GetManyVoucherResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
    if (data && data.length > 0) {
      cursor = data[data.length - 1].id;
    }
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
    example: `[
        {
            "id": "01948da7-a4e9-710f-a31a-3a1fc1a810a7",
            "stockAmount": 10000,
            "description": "CRISPY BURGER",
            "price": 30000,
            "sellExpiredAt": "12/26/2025, 12:00:00 AM",
            "title": "CRISPY BURGER",
            "usableExpiredAt": "12/26/2025, 12:00:00 AM",
            "status": "ACTIVE",
            "tag": "main courses",
            "category": "Yok chinese restaurant",
            "img": [
                {
                    "id": "01948da7-a4e9-710f-a31a-4fa3793003dd",
                    "imgPath": "d22pq9rbvhh9yl.cloudfront.net/voucher-img/1737543361333_rocks.jpg"
                }
            ],
            "promotion": [
                {
                    "id": "01948da7-a4e9-710f-a31a-4adc498cfb2d",
                    "name": "ลดแรงต้อนรับปีใหม่",
                    "stockAmount": 100,
                    "sellStartedAt": "1/1/2025, 7:00:00 AM",
                    "sellExpiredAt": "1/1/2026, 6:59:59 AM",
                    "usableAt": "1/1/2024, 7:00:00 AM",
                    "usableExpiredAt": "1/1/2026, 6:59:59 AM",
                    "promotionPrice": 199
                }
            ]
        }
    ]`,
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
    example: `{
        "id": "01948da7-a4e9-710f-a31a-3a1fc1a810a7",
        "stockAmount": 10000,
        "description": "CRISPY BURGER",
        "price": 30000,
        "sellExpiredAt": "12/26/2025, 12:00:00 AM",
        "title": "CRISPY BURGER",
        "usableExpiredAt": "12/26/2025, 12:00:00 AM",
        "status": "ACTIVE",
        "tag": "main courses",
        "category": "Yok chinese restaurant",
        "img": [
            {
                "id": "01948da7-a4e9-710f-a31a-4fa3793003dd",
                "imgPath": "d22pq9rbvhh9yl.cloudfront.net/voucher-img/1737543361333_rocks.jpg",
                "mainImg": true
            },
            {
                "id": "01948db4-b174-7157-812e-8ac2e333b961",
                "imgPath": "d22pq9rbvhh9yl.cloudfront.net/voucher-img/1737544216531_red-food-gift-card-voucher-design-template-97e81f812b13d305d852edc6d17b86e1_screen.jpg",
                "mainImg": false
            },
            {
                "id": "01948db4-b175-71d9-a975-804f8c4b8dd6",
                "imgPath": "d22pq9rbvhh9yl.cloudfront.net/voucher-img/1737544216531_a872c327-e398-4e0c-95b7-9fb77fd0464a_1024.jpeg",
                "mainImg": false
            }
        ],
        "termAndCond": {
            "th": [
                {
                    "id": "01948da7-a4e9-710f-a31a-3dbf85c53202",
                    "description": "เคี้ยวมันส์ๆ"
                }
            ],
            "en": [
                {
                    "id": "01948da7-a4e9-710f-a31a-423559e46cf3",
                    "description": "Enjoy eating"
                },
                {
                    "id": "01948da7-a4e9-710f-a31a-4539b7c185a8",
                    "description": "Have fun"
                }
            ]
        },
        "promotion": [
            {
                "id": "01948da7-a4e9-710f-a31a-4adc498cfb2d",
                "name": "ลดแรงต้อนรับปีใหม่",
                "stockAmount": 100,
                "sellStartedAt": "1/1/2025, 7:00:00 AM",
                "sellExpiredAt": "1/1/2026, 6:59:59 AM",
                "usableAt": "1/1/2024, 7:00:00 AM",
                "usableExpiredAt": "1/1/2026, 6:59:59 AM",
                "promotionPrice": 199
            }
        ]
    }`,
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
