import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';
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
    example: 'Verify accountID : 123 successfully',
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
  public data: VerifyEmailResponseDataType;

  public static success(
    data: AccountDomain,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): VerifyEmailResponse {
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
