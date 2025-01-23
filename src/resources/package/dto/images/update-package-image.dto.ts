import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { PackageImgDomain } from '@resources/package/domain/package-voucher.domain';
import { IsUUID } from 'class-validator';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';

export class UpdatePackageVoucherImgDto {
  @IsUUID(7)
  packageImgId: PackageImgDomain['id'];
}

export class UpdatePackageVoucherImgResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'Package ID: 123 have been updated successfully.',
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
        "id": "01949403-38c5-742b-a60d-f2acde5ef74c",
        "imgPath": "d22pq9rbvhh9yl.cloudfront.net/package-img/1737650480374_610441.jpg",
        "packageId": "019493bc-c4d9-7154-88dc-e68bc6650e31",
        "mainImg": false,
        "createdAt": "1/23/2025, 11:33:46 PM",
        "updatedAt": "1/23/2025, 11:41:20 PM"
    }`,
  })
  public data: PackageImgDomain;

  public static success(
    data: PackageImgDomain,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): UpdatePackageVoucherImgResponse {
    const responseMessage =
      message ?? `Image ID: ${data.id} have been updated successfully.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new UpdatePackageVoucherImgResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
