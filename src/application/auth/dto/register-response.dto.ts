import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';

export class RegisterResponseDto extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.ACCEPTED,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'Registered Successfully',
  })
  public message: string;
  @ApiProperty({
    type: Object,
    example: '{"login": "/auth/login"}',
  })
  public links: HATEOSLink;
  public data: null;
  public static success(
    message: string,
    links: HATEOSLink,
    statusCode?: number,
    data?: null,
  ): RegisterResponseDto {
    const responseMessage = message ?? 'Login Successfully';
    const responseCode = statusCode ?? HttpStatus.ACCEPTED;
    return new RegisterResponseDto(responseCode, responseMessage, links, data);
  }
}

export const REGISTER_RESPONSE_MESSAGE = {
  sucess: 'Registered successfully.',
  failed: 'Registered unsuccess. Please try again',
} as const;

export enum RegisterHATEOASLinks {
  Login = `${AuthPath.Base}${AuthPath.Login}`,
}
