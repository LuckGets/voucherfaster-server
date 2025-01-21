import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';
import { GetMeResponseDto } from './get-me-response.dto';
import { AccountDomain } from '../domain/account.domain';
import { GenerateAccountResponseHATEOASLink } from 'src/common/HATEOASLinks';
import { IsJWT } from 'class-validator';

type VerifyEmailResponseDataType = AccountDomain;

export class VerifyEmailDto {
  @ApiProperty({
    type: String,
    description: 'Token which provided via hash field in URL query.',
  })
  @IsJWT()
  token: string;
}

export class VerifyEmailResponse extends CoreApiResponse {
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
        "createdAt": "1/18/2025, 12:43:15 PM",
        "updatedAt": "1/19/2025, 12:50:51 PM",
        "verifiedAt": null
    }`,
  })
  public data: VerifyEmailResponseDataType;

  public static success(
    data: VerifyEmailResponseDataType,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): GetMeResponseDto {
    const responseMessage =
      message ?? `Verify accountID : ${data.id} successfully`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink =
      links ??
      GenerateAccountResponseHATEOASLink(String(data.id), !!data.verifiedAt);
    return new VerifyEmailResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
