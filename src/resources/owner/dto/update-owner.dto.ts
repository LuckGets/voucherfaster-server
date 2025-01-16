import { HttpStatus } from '@nestjs/common';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { HTTPMethod } from 'src/common/http.type';
import { AuthPath, OwnerPath } from 'src/config/api-path';
import { OwnerDomain, OwnerImgDomain } from '../domain/owner.domain';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateOwnerInformationDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  name?: string;
  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  colorCode?: string;
}

export class UpdateOwnerInformationResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'PATCH:: /owners successfully.',
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
      "name": "The Emerald Hotel",
      "email": "info@email.com",
      "colorCode": 300,
      "img": [
        {
          "id": "019446d1-6d44-73cf-bcdf-8b1bbd6b070f",
          "imgPath": "https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/1735921280934_burger-with-melted-cheese.webp"
          "type": "LOGO"
        }
      ],
    }`,
  })
  public data: OwnerDomain;

  public static success(
    data: OwnerDomain,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): UpdateOwnerInformationResponse {
    const responseMessage =
      message ?? `${HTTPMethod.Patch}:: ${OwnerPath.Base} successful.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new UpdateOwnerInformationResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}

export const UPDATE_IMG_FILE_FIELD = {
  IMAGE: 'image',
} as const;

export class UpdateOwnerImgDto {
  @ApiProperty({ type: String })
  @IsOptional()
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
