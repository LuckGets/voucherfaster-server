import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { VerifyCallback, Strategy } from 'passport-google-oauth20';
import {
  AllConfigType,
  AllConfigTypeEnum,
} from '../../../config/all-config.type';
import { AuthStrategyEnum } from '../../auth/types/strategy.type';

export class GoogleStrategy extends PassportStrategy(
  Strategy,
  AuthStrategyEnum.Google,
) {
  constructor(
    @Inject(ConfigService) private configService: ConfigService<AllConfigType>,
  ) {
    super({
      clientID: configService.getOrThrow(
        `${AllConfigTypeEnum.Google}.googleClientID`,
        {
          infer: true,
        },
      ),
      clientSecret: configService.getOrThrow(
        `${AllConfigTypeEnum.Google}.googleClientSecret`,
        { infer: true },
      ),
      callbackURL: configService.getOrThrow(
        `${AllConfigTypeEnum.Google}.googleCallbackURL`,
        { infer: true },
      ),
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const { id, displayName, emails, photos, provider } = profile;
    const user = {
      socialId: id,
      fullname: displayName,
      email: emails[0].value,
      photo: photos[0].value,
      accountProvider: provider,
    };
    console.log(profile);
    done(null, user);
  }
}
