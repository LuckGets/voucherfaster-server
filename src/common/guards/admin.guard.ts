import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AllConfigType } from 'src/config/all-config.type';
import { ErrorApiResponse } from '../core-api-response';
import { JwtPayloadType } from '../types/token-payload.type';
import { Request } from 'express';
import { UndefinAble } from '@utils/types/common.type';
import { RoleEnum } from '@resources/account/types/account.type';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService<AllConfigType>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractJwtFromHeader(request);
    if (!token) throw ErrorApiResponse.unauthorizedRequest();
    try {
      const payload: JwtPayloadType = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('auth.accessTokenSecret', {
          infer: true,
        }),
      });

      if (payload.role !== RoleEnum.Admin) {
        throw ErrorApiResponse.unauthorizedRequest();
      }
      request['user'] = payload;
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
