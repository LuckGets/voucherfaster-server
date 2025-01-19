import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { HTTPMethod } from 'src/common/http.type';
import { AuthPath, OwnerPath } from 'src/config/api-path';

export class DeleteOwnerImgByIdResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.NO_CONTENT,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'GET /usabledays successfully.',
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

  public static success(): DeleteOwnerImgByIdResponse {
    const responseMessage = `${HTTPMethod.Delete} ${OwnerPath.Base} successfully.`;
    const responseCode = HttpStatus.NO_CONTENT;
    // generateVoucherReponseHATEOASLink(data.id);
    return new DeleteOwnerImgByIdResponse(
      responseCode,
      responseMessage,
      null,
      null,
    );
  }
}
