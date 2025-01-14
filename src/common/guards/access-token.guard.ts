import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { UndefinAble } from '@utils/types/common.type';
import { Request } from 'express';
import { ErrorApiResponse } from '../core-api-response';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/all-config.type';
import { JwtPayloadType } from '../types/token-payload.type';

@Injectable()
export class AccessTokenAuthGuard implements CanActivate {
  private readonly logger = new Logger(AccessTokenAuthGuard.name);
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
      const { accountId } = request.params;
      if (accountId && accountId !== payload.sub) {
        throw ErrorApiResponse.unauthorizedRequest(
          'The URL path does not match with identifier',
        );
      }
      request['user'] = { accountId: payload.sub, role: payload.role };
    } catch (err) {
      this.logger.error(
        `Request could not be proceed due to the Error : ${err.message}`,
      );
      throw ErrorApiResponse.unauthorizedRequest(err.message);
    }
    return true;
  }

  private extractJwtFromHeader(req: Request): UndefinAble<string> {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
