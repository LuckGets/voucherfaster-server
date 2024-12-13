import { PassportStrategy } from '@nestjs/passport';
import { AuthStrategyEnum } from '../types/strategy.type';
import { ConfigService } from '@nestjs/config';
import { AuthConfig } from '../config/auth-config.type';
import { Inject } from '@nestjs/common';
import { VerifyCallback, Strategy } from 'passport-google-oauth20';
import {
  AllConfigType,
  AllConfigTypeEnum,
} from '../../../config/all-config.type';

export class GoogleStrategy extends PassportStrategy(
  Strategy,
  AuthStrategyEnum.Google,
) {
  constructor(
    @Inject(ConfigService) private configService: ConfigService<AllConfigType>,
  ) {
    super({
      clientID: configService.getOrThrow(
        `${AllConfigTypeEnum.Auth}.googleClientID`,
        {
          infer: true,
        },
      ),
      clientSecret: configService.getOrThrow(
        `${AllConfigTypeEnum.Auth}.googleClientSecret`,
        { infer: true },
      ),
      callbackURL: configService.getOrThrow(
        `${AllConfigTypeEnum.Auth}.googleCallbackURL`,
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
    console.log(profile);
    done(null, profile);
  }
}
