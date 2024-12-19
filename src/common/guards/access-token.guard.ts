import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UndefinAble } from '@utils/types/common.type';
import { Request } from 'express';
import { ErrorApiResponse } from '../core-api-response';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadType } from '@application/auth/types/jwt-payload.type';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/all-config.type';

@Injectable()
export class AccessTokenAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService<AllConfigType>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractJwtFromHeader(request);
    if (!token) throw ErrorApiResponse.unauthorizedRequest();
    try {
      const { sub }: JwtPayloadType = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('auth.accessTokenSecret', {
          infer: true,
        }),
      });
      const { accountId } = request.params;
      if (accountId && accountId !== sub.accountId) {
        throw ErrorApiResponse.unauthorizedRequest(
          'The URL path does not match with identifier',
        );
      }
      request['user'] = sub;
    } catch (err) {
      throw ErrorApiResponse.unauthorizedRequest(err.message);
    }
    return true;
  }

  private extractJwtFromHeader(req: Request): UndefinAble<string> {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
