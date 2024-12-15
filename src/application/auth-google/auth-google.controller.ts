import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGooglePath } from '../../config/api-path';
import { GoogleAuthGuard } from './guards/auth-google.guard';
import { AuthService } from '../auth/auth.service';
import { Request, Response } from 'express';
import { AccountProviderEnum } from '../../resources/account/types/account.type';
import { RequestGoogleUser } from './types/req-user.type';
import { AccountDomain } from '../../resources/account/domain/account.domain';
import { AccountService } from '../../resources/account/account.service';
import { CreateAccountDto } from '../../resources/account/dto/create-account.dto';
import { plainToInstance } from 'class-transformer';
import { v7 as uuid } from 'uuid';

@Controller({
  path: 'auth/google',
  version: '1',
})
export class AuthGoogleController {
  constructor(
    private authService: AuthService,
    private accountService: AccountService,
  ) {}

  @UseGuards(GoogleAuthGuard)
  @Get(AuthGooglePath.Login)
  loginViaGoogle() {}

  @UseGuards(GoogleAuthGuard)
  @Get(AuthGooglePath.Callback)
  private async googleAuthCallback(
    @Req() req: RequestGoogleUser,
    @Res() res: Response,
  ) {
    let user: AccountDomain = await this.authService.validateSocialLogin(
      AccountProviderEnum.Google,
      { socialId: req.user.socialId, email: req.user.email },
    );

    if (!user) {
      const createAccountObject: CreateAccountDto = {
        email: req.user.email,
        fullname: req.user.fullname,
        photo: req.user.photo,
        account_provider: AccountProviderEnum.Google,
        socialId: req.user.socialId,
      };
      user = await this.accountService.create(
        plainToInstance(CreateAccountDto, createAccountObject),
      );
    }
  }
}
