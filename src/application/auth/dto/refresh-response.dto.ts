import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';

type RefreshResponseDataType = { accessToken: string };

export class RefreshResponseDto extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'Refresh token successfully',
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
  public data: RefreshResponseDataType;
  public static success(
    links: HATEOSLink,
    data?: RefreshResponseDataType,
  ): RefreshResponseDto {
    const responseMessage = 'Refresh token successfully.';
    const responseCode = HttpStatus.OK;
    return new RefreshResponseDto(responseCode, responseMessage, links, data);
  }
}

export const refreshReponseHATEOASLink = {
  Me: '/account/me',
  Verify: '/account/verify',
};
