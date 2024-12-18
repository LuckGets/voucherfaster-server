import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';

type loginResponseDataType = { accessToken: string };

export class LoginResponseDto extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'Login Successfully',
  })
  public message: string;
  @ApiProperty({
    type: Object,
    example: '{"me": "/account/me"}',
  })
  public links: HATEOSLink;
  @ApiProperty({
    type: Object,
    example:
      '{"accessToken": "$2a$10$arotB0E5ZC2Y2Ly6j.x1Pedfu7/UldzaQAFoxLgHJ6u8reFO1sdE"}',
  })
  public data: loginResponseDataType;
  public static success(
    message: string,
    links: HATEOSLink,
    statusCode?: number,
    data?: loginResponseDataType,
  ): LoginResponseDto {
    const responseMessage = message ?? 'Login Successfully';
    const responseCode = statusCode ?? HttpStatus.ACCEPTED;
    return new LoginResponseDto(responseCode, responseMessage, links, data);
  }
}

export const LoginResponseHATEOASLink = {
  Me: '/account/me',
} as const;
