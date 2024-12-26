import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';
import { UUIDTypes } from 'uuid';
import { AccountDomain } from '../domain/account.domain';
import { GenerateAccountResponseHATEOASLink } from 'src/common/HATEOASLinks';

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
    type: () => GetMeResponseDto,
    example: 'sdfsdf',
  })
  public data: AccountDomain;

  public static success(
    data: AccountDomain,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): GetMeResponseDto {
    const responseMessage = message ?? 'Get my information Successfully';
    const responseCode = statusCode ?? HttpStatus.OK;
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
