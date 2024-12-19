import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RefreshTokenAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const { sessionId, refreshToken } = request.cookies;
    console.log(!!sessionId && !!refreshToken);
    return !!sessionId && !!refreshToken;
  }
}
