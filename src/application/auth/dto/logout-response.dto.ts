import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';

export class LogoutResponseDto extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'Logout Successfully',
  })
  public message: string;
  @ApiProperty({
    type: Object,
    example: '{"login": "/auth/login"}',
  })
  public links: HATEOSLink;
  @ApiProperty({
    type: () => Object,
  })
  public data: null;

  public static success(message?: string) {
    const responseMessage: string = message || 'Logout successfully.';
    return new LogoutResponseDto(HttpStatus.OK, responseMessage, null);
  }
}
