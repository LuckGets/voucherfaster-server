import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CookieOptions } from 'express';

export const cookieOption: CookieOptions = {
  httpOnly: true,
  sameSite: 'none',
  domain: `${process.env.SERVER_DOMAIN}:${process.env.APP_PORT}`,
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
