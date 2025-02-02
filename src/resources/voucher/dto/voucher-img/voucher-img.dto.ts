import { ApiProperty } from '@nestjs/swagger';
import { VoucherDomain, VoucherImgDomain } from '../../domain/voucher.domain';
import { IsUUID } from 'class-validator';
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
    example: ` [
        {
            "id": "01948e26-99fc-7092-9dff-719572c3e12f",
            "imgPath": "d22pq9rbvhh9yl.cloudfront.net/voucher-img/1737551681277_red-food-gift-card-voucher-design-template-97e81f812b13d305d852edc6d17b86e1_screen.jpg",
            "voucherId": "01948da7-a4e9-710f-a31a-3a1fc1a810a7",
            "mainImg": false,
            "createdAt": "1/22/2025, 8:14:42 PM",
            "updatedAt": "1/22/2025, 8:14:42 PM"
        }
  ]`,
  })
  public data: VoucherImgDomain[];

  public static success(
    data: VoucherImgDomain[],
    voucherId: VoucherDomain['id'],
    links?: HATEOSLink,
    statusCode?: number,
  ): AddVoucherImgResponse {
    const responseMessage = `Add image for voucher ID: ${voucherId} successful.`;
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

  public static getRequiredFields(): Array<keyof UpdateVoucherImgDto> {
    return ['voucherId', 'voucherImgId'];
  }
}

export class UpdateVoucherImgResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: String,
    example: 'Update voucher image ID: 123 successful.',
  })
  public message: string;
  @ApiProperty({
    type: Object,
    example: `{"logout": ${AuthPath.Logout}}`,
  })
  public links: HATEOSLink;
  @ApiProperty({
    type: () => Object,
    example: {
      id: '01948db4-b175-71d9-a975-804f8c4b8dd6',
      imgPath:
        'd22pq9rbvhh9yl.cloudfront.net/voucher-img/1737549384989_610441.jpg',
      voucherId: '01948da7-a4e9-710f-a31a-3a1fc1a810a7',
      mainImg: false,
      createdAt: '1/22/2025, 6:10:16 PM',
      updatedAt: '1/22/2025, 7:36:25 PM',
    },
  })
  public data: VoucherImgDomain;

  public static success(
    data: VoucherImgDomain,
    imageId: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): UpdateVoucherImgResponse {
    const responseMessage = `Update voucher image ID: ${imageId} successful.`;
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
