import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGooglePath, FRONTEND_PATH } from '../../config/api-path';
import { GoogleAuthGuard } from './guards/auth-google.guard';
import { AuthService } from '../auth/auth.service';
import { AccountProviderEnum } from '../../resources/account/types/account.type';
import { RequestGoogleUser } from './types/req-user.type';
import { Response } from 'express';
import { LoginResponseDto } from '@application/auth/dto/login-response.dto';
import { cookieOption } from 'src/common/cookie';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

@ApiTags()
@Controller({
  path: AuthGooglePath.Base,
  version: '1',
})
export class AuthGoogleController {
  private frontEndDomain: string;
  constructor(
    private configServie: ConfigService,
    private authService: AuthService,
  ) {
    this.frontEndDomain = configServie.getOrThrow('client.domain', {
      infer: true,
    });
  }

  @ApiBody({
    description: 'Endpoint for login via google account',
  })
  @UseGuards(GoogleAuthGuard)
  @Get(AuthGooglePath.Login)
  loginViaGoogle() {}

  @ApiBody({
    description: 'This endpoint exist to only receive the request via google.',
  })
  @ApiResponse({
    description:
      'After request success, the response will redirect user to frontend domain.',
  })
  @UseGuards(GoogleAuthGuard)
  @Get(AuthGooglePath.Callback)
  async googleAuthCallback(
    @Req() req: RequestGoogleUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const { accessToken, refreshToken, sessionId } =
      await this.authService.validateSocialLogin(
        AccountProviderEnum.Google,
        req.user,
      );

    res.cookie('sessionId', sessionId, cookieOption);
    res.cookie('refreshToken', refreshToken, cookieOption);
    res.redirect(
      `${this.frontEndDomain}/${FRONTEND_PATH.GOOGLE_SUCCESS}?token=${accessToken}`,
    );
  }
}
