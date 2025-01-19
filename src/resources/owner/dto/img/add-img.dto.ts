import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { OwnerImgDomain } from '@resources/owner/domain/owner.domain';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath, OwnerPath } from 'src/config/api-path';

export class AddOwnerImgResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.CREATED,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'POST: /owners/images successful. Created new 3 images.',
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
    "numberOfImgCreated": 3
  }`,
  })
  public data: object;

  public static success(
    numberOfImgCreated: number,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): AddOwnerImgResponse {
    const responseMessage =
      message ??
      `POST: ${OwnerPath.Base}${OwnerPath.Image} successful. Created new ${numberOfImgCreated} images.`;
    const responseCode = statusCode ?? HttpStatus.CREATED;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new AddOwnerImgResponse(
      responseCode,
      responseMessage,
      responseLink,
      { numberOfImgCreated: numberOfImgCreated },
    );
  }
}
