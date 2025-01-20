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
        "id": "0194842a-b475-70d9-8fb7-184668145512",
        "imgPath": "d22pq9rbvhh9yl.cloudfront.net/owner-img/1737386405498_vegan-salad.jpg",
        "type": "BACKGROUND",
        "createdAt": "1/20/2025, 9:42:58 PM",
        "updatedAt": "1/20/2025, 10:20:05 PM"
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
