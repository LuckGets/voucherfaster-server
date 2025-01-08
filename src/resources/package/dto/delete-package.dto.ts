import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';
import { PackageVoucherDomain } from '../domain/package-voucher.domain';

export class DeletePackageVoucherByIdResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.NO_CONTENT,
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
    example: null,
  })
  public data: null;

  public static success(
    packageId: PackageVoucherDomain['id'],
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): DeletePackageVoucherByIdResponse {
    const responseMessage =
      message ?? `DELETE package voucher ID: ${packageId} successfully.`;
    const responseCode = statusCode ?? HttpStatus.NO_CONTENT;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new DeletePackageVoucherByIdResponse(
      responseCode,
      responseMessage,
      responseLink,
      null,
    );
  }
}
