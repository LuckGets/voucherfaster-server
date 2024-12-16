import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AccountService } from '../../resources/account/account.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { NullAble } from '../../utils/types/NullAble.type';
import { AccountDomain } from '../../resources/account/domain/account.domain';
import { AccountProvider } from '../../resources/account/types/account.type';
import { AuthEmailRegisterReqDto } from './dto/auth-email-register-req.dto';
import { ErrorApiResponse } from 'src/common/api-response';

@Injectable()
export class AuthService {
  constructor(private accountService: AccountService) {}
  async register(data: AuthEmailRegisterReqDto): Promise<AccountDomain> {
    const isEmailExist = await this.accountService.findByEmail(data.email);
    if (isEmailExist) {
      throw ErrorApiResponse.conflictRequest('This Email already registered');
    }
    const isPhoneExist = await this.accountService.findByPhoneNumber(
      data.phone,
    );
    if (isPhoneExist) {
      throw ErrorApiResponse.conflictRequest(
        'This Phone number already registered',
      );
    }
    return this.accountService.create(data);
  }

  async login(): Promise<LoginResponseDto> {
    return new LoginResponseDto();
  }

  public async validateSocialLogin(
    authProvider: AccountProvider,
    socialData: { socialId: string; email: string },
  ) {
    let user: NullAble<AccountDomain> = null;
    let userByEmail: NullAble<AccountDomain> = null;

    userByEmail = await this.accountService.findByEmail(socialData.email);

    user = await this.accountService.findBySocialIdAndProvider(
      socialData.socialId,
      authProvider,
    );

    if (userByEmail) {
      if (!user || userByEmail.id != user.id) {
        throw new HttpException(
          `This account have been provided identity via ${userByEmail.accountProvider}. Please login via the correct provider}`,
          HttpStatus.CONFLICT,
        );
      }
    }

    if (!user) {
      return null;
    }
  }
}
