import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { PackageQuotaVoucherDomain } from '@resources/package/domain/package-voucher.domain';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';

export class DeleteQuotaVoucherResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.NO_CONTENT,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'Quota ID: 334 have been deleted successfully.',
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

  constructor(
    code: DeleteQuotaVoucherResponse['HTTPStatusCode'],
    message: DeleteQuotaVoucherResponse['message'],
    links: DeleteQuotaVoucherResponse['links'],
    data: null,
  ) {
    super(code, message, links);
    this.data = data;
  }

  public static success(
    quotaId: PackageQuotaVoucherDomain['id'],
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): DeleteQuotaVoucherResponse {
    const responseMessage =
      message ?? `Quota ID: ${quotaId} have been deleted successfully.`;
    const responseCode = statusCode ?? HttpStatus.NO_CONTENT;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new DeleteQuotaVoucherResponse(
      responseCode,
      responseMessage,
      responseLink,
      null,
    );
  }
}
