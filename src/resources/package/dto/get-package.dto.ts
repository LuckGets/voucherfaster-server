import { HttpStatus } from '@nestjs/common';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { PackageVoucherDomain } from '../domain/package-voucher.domain';
import { ApiProperty } from '@nestjs/swagger';
import { AuthPath } from 'src/config/api-path';

export class GetAllPackageVoucherResponse extends CoreApiResponse {
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
            "id": "0194462e-a077-7616-b2d8-f8f14121ec54",
            "name": "โปรโมชั่นแพ็คเกจ ซื้อ1แถม1",
            "price": 300,
            "quotaVoucherId": "019440b4-c932-72ae-b774-51d15cc52848",
            "quotaAmount": 1,
            "startedAt": "1/1/2025, 12:00:00 AM",
            "expiredAt": "2/1/2025, 12:00:00 AM",
            "createdAt": "1/8/2025, 8:50:48 PM",
            "updatedAt": "1/8/2025, 8:50:48 PM",
            "image": [
                {
                    "id": "0194462e-a078-7066-a7c3-25eb04f4ada9",
                    "mainImg": true,
                    "path": "d22pq9rbvhh9yl.cloudfront.net/package-img/1736344247063_voucher-template-with-offer_23-2148479796.avif"
                }
            ],
            "rewardVoucher": [
                {
                    "id": "0194462e-a078-7066-a7c3-22a08538d134",
                    "voucherId": "019440b4-c932-72ae-b774-51d15cc52848"
                }
            ]
  }]
        `,
  })
  public data: PackageVoucherDomain[];

  public static success(
    data: PackageVoucherDomain[],
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): GetAllPackageVoucherResponse {
    const responseMessage = message ?? `GET :: /packages successfully.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new GetAllPackageVoucherResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
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
            "id": "0194462e-a077-7616-b2d8-f8f14121ec54",
            "name": "โปรโมชั่นแพ็คเกจ ซื้อ1แถม1",
            "price": 300,
            "quotaVoucherId": "019440b4-c932-72ae-b774-51d15cc52848",
            "quotaAmount": 1,
            "startedAt": "1/1/2025, 12:00:00 AM",
            "expiredAt": "2/1/2025, 12:00:00 AM",
            "createdAt": "1/8/2025, 8:50:48 PM",
            "updatedAt": "1/8/2025, 8:50:48 PM",
            "image": [
                {
                    "id": "0194462e-a078-7066-a7c3-25eb04f4ada9",
                    "mainImg": true,
                    "path": "d22pq9rbvhh9yl.cloudfront.net/package-img/1736344247063_voucher-template-with-offer_23-2148479796.avif"
                }
            ],
            "rewardVoucher": [
                {
                    "id": "0194462e-a078-7066-a7c3-22a08538d134",
                    "voucherId": "019440b4-c932-72ae-b774-51d15cc52848"
                }
            ]
  }
        `,
  })
  public data: PackageVoucherDomain;

  public static success(
    data: PackageVoucherDomain,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): GetPackageVoucherByIdResponse {
    const responseMessage =
      message ?? `GET :: /packages${data?.id} successfully.`;
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
