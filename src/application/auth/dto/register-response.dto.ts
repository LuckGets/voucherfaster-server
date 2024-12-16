import { ApiResponse } from 'src/common/api-response';
import { AuthPath } from 'src/config/api-path';

export class RegisterResponseDto extends ApiResponse<null> {}

export const REGISTER_RESPONSE_MESSAGE = {
  sucess: 'Registered successfully.',
  failed: 'Registered unsuccess. Please try again',
} as const;

export enum RegisterHATEOASLinks {
  Login = `${AuthPath.Base}/${AuthPath.Login}`,
}
