import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';
import { UUIDTypes } from 'uuid';
import { AccountDomain } from '../domain/account.domain';
import { GenerateAccountResponseHATEOASLink } from 'src/common/HATEOASLinks';

export class GetMeResponse extends CoreApiResponse {
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
    example: `{
        "id": "01948762-dfe1-702b-9ccf-65716725fb39",
        "fullname": "Me Me",
        "phone": "0812345556",
        "email": "kasides15@gmail.com",
        "photo": null,
        "accountProvider": "LOCAL",
        "createdAt": "1/21/2025, 12:43:15 PM",
        "updatedAt": "1/21/2025, 12:54:19 PM",
        "verifiedAt": "1/21/2025, 12:50:51 PM"
    }`,
  })
  public data: AccountDomain;

  public static success(
    data: AccountDomain,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): GetMeResponse {
    const responseMessage = message ?? 'Get my information Successfully';
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink =
      links ??
      GenerateAccountResponseHATEOASLink(
        data.id as UUIDTypes,
        !!data.verifiedAt,
      );
    return new GetMeResponse(responseCode, responseMessage, responseLink, data);
  }
}
