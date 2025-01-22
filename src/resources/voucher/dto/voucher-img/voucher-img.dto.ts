import { ApiProperty } from '@nestjs/swagger';
import { VoucherDomain, VoucherImgDomain } from '../../domain/voucher.domain';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HttpStatus } from '@nestjs/common';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';

export const VOUCHER_FILE_FILED = {
  VOUCHER_IMG: 'voucherImg',
  MAIN_IMG: 'mainImg',
} as const;

export class AddVoucherImgDto {
  @ApiProperty({ type: String })
  @IsUUID(7)
  voucherId: VoucherDomain['id'];
}

export class AddVoucherImgResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.CREATED,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: String,
    example: 'Add image for the voucher ID: 123 successful.',
  })
  public message: string;
  @ApiProperty({
    type: Object,
    example: `{"logout": ${AuthPath.Logout}}`,
  })
  public links: HATEOSLink;
  @ApiProperty({
    type: () => Object,
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
  public data: VoucherDomain;

  public static success(
    data: VoucherDomain,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): AddVoucherImgResponse {
    const responseMessage =
      message ?? `Add image for voucher ID: ${data.id} successful.`;
    const responseCode = statusCode ?? HttpStatus.CREATED;
    const responseLink = links;
    // links ??
    // GenerateAccountResponseHATEOASLink(
    //   data.id as UUIDTypes,
    //   !!data.verifiedAt,
    // );
    return new AddVoucherImgResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}

export class UpdateVoucherImgDto {
  @ApiProperty({ type: String })
  @IsUUID(7)
  voucherId: VoucherDomain['id'];
  @ApiProperty({ type: String })
  @IsUUID(7)
  voucherImgId: VoucherImgDomain['id'];
}

export class UpdateVoucherImgResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: String,
    example: 'Update image ID: 123 successful.',
  })
  public message: string;
  @ApiProperty({
    type: Object,
    example: `{"logout": ${AuthPath.Logout}}`,
  })
  public links: HATEOSLink;
  @ApiProperty({
    type: () => Object,
    example: '',
  })
  public data: VoucherImgDomain;

  public static success(
    data: unknown,
    imageId: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): UpdateVoucherImgResponse {
    const responseMessage = `Update image ID: ${imageId} successful.`;
    const responseCode = statusCode ?? HttpStatus.CREATED;
    const responseLink = links;
    // links ??
    // GenerateAccountResponseHATEOASLink(
    //   data.id as UUIDTypes,
    //   !!data.verifiedAt,
    // );
    return new UpdateVoucherImgResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
