import { HATEOSLink } from '../../../utils/types/hateos.type';

export class LoginResponseDto {
  accessToken: string;
  links: HATEOSLink;
}
