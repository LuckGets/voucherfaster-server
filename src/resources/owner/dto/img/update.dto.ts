import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { OwnerImgDomain } from '@resources/owner/domain/owner.domain';
import { IsUUID } from 'class-validator';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { HTTPMethod } from 'src/common/http.type';
import { AuthPath, OwnerPath } from 'src/config/api-path';

export const UPDATE_IMG_FILE_FIELD = {
  IMAGE: 'image',
} as const;
export class UpdateOwnerImgDto {
  @ApiProperty({ type: String })
  @IsUUID(7)
  imageId?: string;
}

export class UpdateOwnerImgResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'PATCH:: /owners/images ID:1 successfully.',
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
      "id": "019446d1-6d43-760d-9a0b-489e626e2f8d",
      "imgPath": "facebook.com",
      "type": "LOGO",
    }`,
  })
  public data: OwnerImgDomain;

  public static success(
    data: OwnerImgDomain,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): UpdateOwnerImgResponse {
    const responseMessage =
      message ??
      `${HTTPMethod.Patch}:: ${OwnerPath.Base}/${OwnerPath.Image}/${data.id} successful.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new UpdateOwnerImgResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
