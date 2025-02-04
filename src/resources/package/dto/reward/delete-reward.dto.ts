import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { PackageRewardVoucherDomain } from '@resources/package/domain/package-voucher.domain';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';

export class DeleteRewardVoucherResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.NO_CONTENT,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'Reward voucher ID: 777 have been deleted successfully.',
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
    code: DeleteRewardVoucherResponse['HTTPStatusCode'],
    message: DeleteRewardVoucherResponse['message'],
    links: DeleteRewardVoucherResponse['links'],
    data: null,
  ) {
    super(code, message, links);
    this.data = data;
  }

  public static success(
    rewardId: PackageRewardVoucherDomain['id'],
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): DeleteRewardVoucherResponse {
    const responseMessage =
      message ??
      `Reward voucher ID: ${rewardId} have been deleted successfully.`;
    const responseCode = statusCode ?? HttpStatus.NO_CONTENT;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new DeleteRewardVoucherResponse(
      responseCode,
      responseMessage,
      responseLink,
      null,
    );
  }
}
