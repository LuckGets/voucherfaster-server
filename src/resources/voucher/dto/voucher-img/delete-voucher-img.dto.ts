import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { VoucherImgDomain } from '@resources/voucher/domain/voucher.domain';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';

export class DeleteVoucherImgByIdResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.NO_CONTENT,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: String,
    example: 'Delete voucher image ID: 123 successful.',
  })
  public message: string;
  @ApiProperty({
    type: () => Object,
    example: `null`,
  })
  public data: null;

  public static success(
    imageId: VoucherImgDomain['id'],
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): DeleteVoucherImgByIdResponse {
    const responseMessage =
      message ?? `Delete voucher image ID: ${imageId} successful.`;
    const responseCode = statusCode ?? HttpStatus.NO_CONTENT;
    const responseLink = links;
    // links ??
    // GenerateAccountResponseHATEOASLink(
    //   data.id as UUIDTypes,
    //   !!data.verifiedAt,
    // );
    return new DeleteVoucherImgByIdResponse(
      responseCode,
      responseMessage,
      responseLink,
      null,
    );
  }
}
