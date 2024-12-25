import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';
import { GetMeResponseDto } from './get-me-response.dto';
import { AccountDomain } from '../domain/account.domain';
import { GenerateAccountResponseHATEOASLink } from 'src/common/HATEOASLinks';

type VerifyEmailResponseDataType = AccountDomain;

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
    example: 'sdfsdf',
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
    const responseCode = statusCode ?? HttpStatus.ACCEPTED;
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
