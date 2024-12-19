import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { HTTPMethod } from 'src/common/http.type';
import { AccountPath, AuthPath } from 'src/config/api-path';
import { UUIDTypes } from 'uuid';
import { AccountDomain } from '../domain/account.domain';

type GetMeResponseType = AccountDomain;

export class GetMeResponseDto extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'Account details for account id 123',
  })
  public message: string;
  @ApiProperty({
    type: Object,
    example: `{"logout": ${AuthPath.Logout}}`,
  })
  public links: HATEOSLink;
  @ApiProperty({
    type: Object,
    example: 'sdfsdf',
  })
  public data: GetMeResponseType;

  public static success(
    data: GetMeResponseType,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): GetMeResponseDto {
    const responseMessage = message ?? 'Login Successfully';
    const responseCode = statusCode ?? HttpStatus.ACCEPTED;
    const responseLink =
      links ??
      GenerateAccountResponseHATEOASLink(
        data.id as UUIDTypes,
        !!data.verifiedAt,
      );
    return new GetMeResponseDto(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}

export const GenerateAccountResponseHATEOASLink = (
  accountId: UUIDTypes,
  verify: boolean,
) => {
  const links = {
    account: {
      update: {
        method: HTTPMethod.Patch,
        path: `${AccountPath.Base}/${accountId}`,
      },
      changePassword: {
        method: HTTPMethod.Patch,
        path: `${AccountPath.Base}/${accountId}/${AccountPath.ChangePassword.split('/')[1]}`,
      },
      logout: {
        method: HTTPMethod.Get,
        path: `${AuthPath.Base}${AuthPath.Logout}`,
      },
    },
    order: {},
  };
  return verify
    ? links
    : {
        ...links,
        account: {
          ...links.account,
          reVerify: {
            method: HTTPMethod.Get,
            path: `${AccountPath.Base}/${accountId}/${AccountPath.Reverify.split('/')[1]}`,
          },
        },
      };
};
