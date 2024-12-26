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
import { LoginResponseDto } from './dto/login-response.dto';
import { AuthEmailRegisterReqDto } from './dto/auth-email-register-req.dto';
import { AuthEmailLoginReqDto } from './dto/auth-email-login-req.dto';
import {
  REGISTER_RESPONSE_MESSAGE,
  RegisterHATEOASLinks,
  RegisterResponseDto,
} from './dto/register-response.dto';
import { Response } from 'express';
import { Cookies, CookiesKey, cookieOption } from 'src/common/cookie';
import { RefreshTokenAuthGuard } from './auth.guard';
import {
  refreshReponseHATEOASLink,
  RefreshResponseDto,
} from './dto/refresh-response.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';

@ApiTags(AuthPath.Name)
@Controller({ path: AuthPath.Base, version: '1' })
export class AuthController {
  constructor(private authService: AuthService) {}

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
    type: () => LoginResponseDto,
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
    const { accessToken, refreshToken, sessionId } =
      await this.authService.getTokenAndUpsertSession(account);
    res.cookie('sessionId', sessionId, cookieOption);
    res.cookie('refreshToken', refreshToken, cookieOption);
    return LoginResponseDto.success({ accessToken });
  }

  @ApiCookieAuth()
  @ApiOkResponse({
    type: () => RefreshResponseDto,
  })
  @UseGuards(RefreshTokenAuthGuard)
  @Get(AuthPath.Refresh)
  async refresh(
    @Cookies(CookiesKey.refreshToken) refreshToken: string,
    @Cookies(CookiesKey.sessionId) session: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefreshResponseDto> {
    // Get all the token and create session
    const { newAccessToken, newRefreshToken, sessionId } =
      await this.authService.refreshToken(refreshToken, session);
    // Attach the cookie in response
    res.cookie(CookiesKey.sessionId, sessionId, cookieOption);
    res.cookie(CookiesKey.sessionId, newRefreshToken, cookieOption);
    return RefreshResponseDto.success(refreshReponseHATEOASLink, {
      accessToken: newAccessToken,
    });
  }

  @ApiCookieAuth()
  @ApiOkResponse({ type: () => LogoutResponseDto })
  @Get(AuthPath.Logout)
  async logout(
    @Cookies(CookiesKey.refreshToken) refreshToken: string,
    @Cookies(CookiesKey.sessionId) sessionId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LogoutResponseDto> {
    // Delete the session for logout
    await this.authService.logout({ refreshToken, sessionId });
    // Clearing the cookies from the response
    res.clearCookie(CookiesKey.refreshToken);
    res.clearCookie(CookiesKey.sessionId);
    return LogoutResponseDto.success();
  }
}
