import { CoreApiResponse } from 'src/common/core-api-response';

export class LoginResponseDto extends CoreApiResponse<{
  accessToken: string;
}> {}

export const LoginResponseHATEOASLink = {
  Me: '/account/me',
} as const;
