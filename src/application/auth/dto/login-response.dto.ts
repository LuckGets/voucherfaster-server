import { HATEOSLink } from 'src/common/hateos.type';

export class LoginResponseDto {
  accessToken: string;
  links: HATEOSLink;
}
