import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthPath } from '../../config/api-path';
import { AuthService } from './auth.service';
import {
  ApiOkResponse,
  ApiCreatedResponse,
  ApiTags,
  ApiConflictResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import {
  LoginResponseDto,
  LoginResponseHATEOASLink,
} from './dto/login-response.dto';
import { AuthEmailRegisterReqDto } from './dto/auth-email-register-req.dto';
import { AuthEmailLoginReqDto } from './dto/auth-email-login-req.dto';
import {
  REGISTER_RESPONSE_MESSAGE,
  RegisterHATEOASLinks,
  RegisterResponseDto,
} from './dto/register-response.dto';
import { SessionService } from '@resources/session/session.service';
import { SessionDomain } from '@resources/session/domain/session.domain';
import { NullAble } from '@utils/types/NullAble.type';
import { Response } from 'express';
import { cookieOption, Cookies, CookiesKey } from 'src/common/cookie';
import { RefreshTokenAuthGuard } from './auth.guard';
import {
  refreshReponseHATEOASLink,
  RefreshResponseDto,
} from './dto/refresh-response.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';

@ApiTags(AuthPath.Name)
@Controller({ path: AuthPath.Base, version: '1' })
export class AuthController {
  constructor(
    private authService: AuthService,
    private sessionService: SessionService,
  ) {}

  @ApiCreatedResponse({
    type: () => RegisterResponseDto,
  })
  @ApiConflictResponse()
  @HttpCode(HttpStatus.CREATED)
  @Post(AuthPath.Register)
  async register(
    @Body() body: AuthEmailRegisterReqDto,
  ): Promise<RegisterResponseDto> {
    await this.authService.register(body);
    return RegisterResponseDto.success(
      REGISTER_RESPONSE_MESSAGE.sucess,
      {
        login: RegisterHATEOASLinks.Login,
      },
      HttpStatus.CREATED,
    );
  }

  @ApiOkResponse({
    type: LoginResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  @Post(AuthPath.Login)
  async login(
    @Body() body: AuthEmailLoginReqDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    // validate the account via local login
    const account = await this.authService.validateLogin(body);
    // finding the existing account session
    let session: NullAble<SessionDomain> =
      await this.sessionService.findbyAccountId(account.id);

    const [accessToken, refreshToken] = await Promise.all([
      this.authService.generateToken(
        {
          sub: {
            accountId: account.id as string,
            role: account.role,
          },
        },
        'access',
      ),
      this.authService.generateToken({ sub: account.id as string }, 'refresh'),
    ]);

    // If account does not have session before
    if (!session) {
      // Creating new session for this account
      session = await this.sessionService.create({
        account: account.id,
        token: refreshToken,
      });
    }

    res.cookie('sessionId', session.id, cookieOption);
    res.cookie('refreshToken', session.token, cookieOption);
    return LoginResponseDto.success(
      'Login Successfully.',
      LoginResponseHATEOASLink,
      HttpStatus.OK,
      { accessToken },
    );
  }

  @ApiCookieAuth('Refresh')
  @ApiOkResponse({
    type: RefreshResponseDto,
  })
  @UseGuards(RefreshTokenAuthGuard)
  @Get(AuthPath.Refresh)
  async refresh(
    @Cookies(CookiesKey.refreshToken) refreshToken: string,
    @Cookies(CookiesKey.sessionId) session: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefreshResponseDto> {
    const { newAccessToken, newRefreshToken, sessionId } =
      await this.authService.refreshToken(refreshToken, session);
    res.cookie(CookiesKey.sessionId, sessionId, cookieOption);
    res.cookie(CookiesKey.sessionId, newRefreshToken, cookieOption);
    return RefreshResponseDto.success(refreshReponseHATEOASLink, {
      accessToken: newAccessToken,
    });
  }

  @ApiOkResponse()
  @Get(AuthPath.Logout)
  async logout(
    @Res({ passthrough: true }) res: Response,
  ): Promise<LogoutResponseDto> {
    // Should clear session or not?
    res.clearCookie(CookiesKey.refreshToken);
    res.clearCookie(CookiesKey.sessionId);
    return LogoutResponseDto.success();
  }
}
