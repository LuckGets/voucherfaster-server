import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { PackageImgDomain } from '@resources/package/domain/package-voucher.domain';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';

export class DeletePackageVoucherImgResponse extends CoreApiResponse {
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
        "id": "01944636-568f-770a-920a-421b9f96ba49",
        "imgPath": "facebook.com",
        "false": false,
        "createdAt": "1/8/2025, 8:59:13 PM",
        "updatedAt": "1/8/2025, 8:59:13 PM",
  }`,
  })
  public static success(
    imageId: PackageImgDomain['id'],
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): DeletePackageVoucherImgResponse {
    const responseMessage =
      message ?? `Image ID: ${imageId} have been deleted successfully.`;
    const responseCode = statusCode ?? HttpStatus.NO_CONTENT;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new DeletePackageVoucherImgResponse(
      responseCode,
      responseMessage,
      responseLink,
    );
  }
}