import { HttpStatus } from '@nestjs/common';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { PackageVoucherDomain } from '../domain/package-voucher.domain';
import { ApiProperty } from '@nestjs/swagger';
import { AuthPath } from 'src/config/api-path';

export enum PackageSellDateQueryEnum {
  NOW = 'NOW',
  ALL = 'ALL',
  EXPIRED = 'EXPIRED',
}

export enum PackageStatusQueryEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ALL = 'ALL',
}

export class GetPaginationPackageVoucherResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'GET :: /packages successfully.',
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
            "id": "019492d8-e723-759a-bdf7-ec6256a08a07",
            "title": "เป็ดฮ่องกงแซ่บๆ 2 แถม 1",
            "price": 1200,
            "stockAmount": 1,
            "quotaVoucherId": "019492d8-e71a-7162-af8e-5b9f18f1f7ba",
            "quotaAmount": 2,
            "usableAt": "1/1/2025, 12:00:00 AM",
            "usableExpiredAt": "2/1/2025, 12:00:00 AM",
            "sellStartedAt": "1/1/2025, 12:00:00 AM",
            "sellExpiredAt": "2/1/2025, 12:00:00 AM",
            "createdAt": "1/23/2025, 6:08:03 PM",
            "updatedAt": "1/23/2025, 7:34:45 PM",
            "category": "Yok chinese restaurant",
            "images": [
                {
                    "id": "019492d8-e723-759a-bdf7-fffadccccc23",
                    "mainImg": true,
                    "imgPath": "d22pq9rbvhh9yl.cloudfront.net/package-img/เป็ด.jpg"
                }
            ],
            "rewardVouchers": [
                {
                    "id": "0194932c-1902-76b8-84b1-73935e79f729",
                    "voucherId": "019492d8-e71a-7162-af8e-5b9f18f1f7ba",
                    "amount": 1,
                    "category": "Yok chinese restaurant"
                },
                {
                    "id": "019492d8-e723-759a-bdf7-f7321580150e",
                    "voucherId": "019492d8-e71a-7162-af8e-5b9f18f1f7ba",
                    "amount": 1,
                    "category": "Yok chinese restaurant"
                }
            ]
        }]`,
  })
  public data: PackageVoucherDomain[];
  public cursor: string;

  constructor(
    code: GetPaginationPackageVoucherResponse['HTTPStatusCode'],
    message: GetPaginationPackageVoucherResponse['message'],
    link: GetPaginationPackageVoucherResponse['links'],
    data: GetPaginationPackageVoucherResponse['data'],
    cursor: GetPaginationPackageVoucherResponse['cursor'],
  ) {
    super(code, message, link);
    this.data = data;
    this.cursor = cursor;
  }

  public static success(
    data: GetPaginationPackageVoucherResponse['data'],
    cursor: GetPaginationPackageVoucherResponse['cursor'],
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): GetPaginationPackageVoucherResponse {
    const responseMessage = message ?? `GET :: /packages successfully.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new GetPaginationPackageVoucherResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
      cursor,
    );
  }
}

export class GetPackageVoucherByIdResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'GET :: /packages/123 successfully.',
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
        "id": "019492d8-e723-759a-bdf7-ec6256a08a07",
        "title": "เป็ดฮ่องกงแซ่บๆ 2 แถม 1",
        "price": 1200,
        "stockAmount": 1,
        "quotaVoucherId": "019492d8-e71a-7162-af8e-5b9f18f1f7ba",
        "quotaAmount": 2,
        "usableAt": "1/1/2025, 12:00:00 AM",
        "usableExpiredAt": "2/1/2025, 12:00:00 AM",
        "sellStartedAt": "1/1/2025, 12:00:00 AM",
        "sellExpiredAt": "2/1/2025, 12:00:00 AM",
        "createdAt": "1/23/2025, 6:08:03 PM",
        "updatedAt": "1/23/2025, 7:34:45 PM",
        "category": "Yok chinese restaurant",
        "images": [
            {
                "id": "019492d8-e723-759a-bdf7-fffadccccc23",
                "mainImg": true,
                "imgPath": "d22pq9rbvhh9yl.cloudfront.net/package-img/เป็ด.jpg"
            }
        ],
        "rewardVouchers": [
            {
                "id": "0194932c-1902-76b8-84b1-73935e79f729",
                "voucherId": "019492d8-e71a-7162-af8e-5b9f18f1f7ba",
                "amount": 1,
                "category": "Yok chinese restaurant"
            },
            {
                "id": "019492d8-e723-759a-bdf7-f7321580150e",
                "voucherId": "019492d8-e71a-7162-af8e-5b9f18f1f7ba",
                "amount": 1,
                "category": "Yok chinese restaurant"
            }
        ],
        "termAndCond": {
            "en": [
                {
                    "id": "019492d8-e723-759a-bdf8-0e46618a362d",
                    "description": "This voucher can only be used on roasted duck dishes."
                }
            ],
            "th": [
                {
                    "id": "019492d8-e723-759a-bdf8-07c69dc18f5f",
                    "description": "คูปองนี้สามารถใช้ได้เฉพาะกับจานเป็ดย่างเท่านั้น"
                }
            ]
        }
    }`,
  })
  public data: PackageVoucherDomain;

  public static success(
    data: PackageVoucherDomain,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): GetPackageVoucherByIdResponse {
    const responseMessage =
      message ?? `GET :: /packages${data?.id ?? ''} successfully.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new GetPackageVoucherByIdResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
