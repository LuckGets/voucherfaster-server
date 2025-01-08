import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { VoucherPromotionDomain } from '@resources/voucher/domain/voucher-promotion.domain';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';

export class DeleteVoucherPromotionResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.NO_CONTENT,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'Promotion ID: 123 have been deleted successfully.',
  })
  public message: string;
  @ApiProperty({
    type: Object,
    example: `{"logout": ${AuthPath.Logout}}`,
  })
  public links: HATEOSLink;
  @ApiProperty({
    type: Object,
    example: 'null',
  })
  public data: null;

  public static success(
    promotionId: VoucherPromotionDomain['id'],
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): DeleteVoucherPromotionResponse {
    const responseMessage =
      message ??
      `Promotion for voucher ID: ${promotionId} have been deleted successfully.`;
    const responseCode = statusCode ?? HttpStatus.NO_CONTENT;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new DeleteVoucherPromotionResponse(
      responseCode,
      responseMessage,
      responseLink,
      null,
    );
  }
}
