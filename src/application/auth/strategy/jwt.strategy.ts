import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../types/jwt-payload.type';
import { AuthStrategyEnum } from '../types/strategy.type';

export class JwtStrategy extends PassportStrategy(
  Strategy,
  AuthStrategyEnum.Jwt,
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies.accessToken,
      ]),
    });
  }
  public validate(payload: JwtPayload) {
    return payload;
  }
}
