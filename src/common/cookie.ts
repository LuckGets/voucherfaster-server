import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CookieOptions } from 'express';

export const cookieOption: CookieOptions = {
  httpOnly: true,
  sameSite: 'none',
};

export const Cookies = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.cookies?.[data];
  },
);

export const CookiesKey = {
  refreshToken: 'refreshToken',
  sessionId: 'sessionId',
} as const;
