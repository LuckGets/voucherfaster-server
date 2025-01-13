import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  PackageImgDomain,
  PackageVoucherDomain,
} from '@resources/package/domain/package-voucher.domain';
import { VoucherDomain } from '@resources/voucher/domain/voucher.domain';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';

export class CreatePackageVoucherImgDto {
  packageId: PackageVoucherDomain['id'];
}

export class CreatePackageVoucherImgResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.CREATED,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'Create image for package ID: 123 successfully.',
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
  public data: PackageImgDomain[];

  public static success(
    data: PackageImgDomain[],
    voucherId: VoucherDomain['id'],
    links?: HATEOSLink,
    statusCode?: number,
  ): CreatePackageVoucherImgResponse {
    const responseMessage = `Create image for package ID: ${voucherId} successfully.`;
    const responseCode = statusCode ?? HttpStatus.CREATED;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new CreatePackageVoucherImgResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
