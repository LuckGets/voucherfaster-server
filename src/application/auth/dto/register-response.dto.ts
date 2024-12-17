import { CoreApiResponse } from 'src/common/core-api-response';
import { AuthPath } from 'src/config/api-path';

export class RegisterResponseDto extends CoreApiResponse<null> {}

export const REGISTER_RESPONSE_MESSAGE = {
  sucess: 'Registered successfully.',
  failed: 'Registered unsuccess. Please try again',
} as const;

export enum RegisterHATEOASLinks {
  Login = `${AuthPath.Base}${AuthPath.Login}`,
}
