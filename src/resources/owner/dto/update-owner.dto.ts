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
        "id": "0194834a-ff5f-77de-b7cb-fc07ffe3b131",
        "emailForSendNotification": "kasides12@gmail.com",
        "colorCode": "006838",
        "name": "Sausage"
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
