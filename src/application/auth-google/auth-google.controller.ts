import {
  Controller,
  Get,
  Req,
  Res,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import { AuthGooglePath } from '../../config/api-path';
import { GoogleAuthGuard } from './guards/auth-google.guard';
import { AuthService } from '../auth/auth.service';
import { AccountProviderEnum } from '../../resources/account/types/account.type';
import { RequestGoogleUser } from './types/req-user.type';
import { Response } from 'express';
import { LoginResponseDto } from '@application/auth/dto/login-response.dto';
import { cookieOption } from 'src/common/cookie';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags()
@Controller({
  path: AuthGooglePath.Base,
  version: '1',
})
export class AuthGoogleController {
  constructor(private authService: AuthService) {}

  @ApiBody({
    description: 'Endpoint for login via google account',
  })
  @UseGuards(GoogleAuthGuard)
  @Get(AuthGooglePath.Login)
  loginViaGoogle() {}

  @ApiBody({
    description: 'This endpoint exist to only receive the request via google.',
  })
  @ApiResponse({ type: () => LoginResponseDto })
  @UseGuards(GoogleAuthGuard)
  @Get(AuthGooglePath.Callback)
  async googleAuthCallback(
    @Req() req: RequestGoogleUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const { accessToken, refreshToken, sessionId } =
      await this.authService.validateSocialLogin(
        AccountProviderEnum.Google,
        req.user,
      );

    res.cookie('sessionId', sessionId, cookieOption);
    res.cookie('refreshToken', refreshToken, cookieOption);
    return LoginResponseDto.success({ accessToken });
  }
}
