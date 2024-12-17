import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AccountService } from '../../resources/account/account.service';
import { NullAble } from '../../utils/types/NullAble.type';
import { AccountDomain } from '../../resources/account/domain/account.domain';
import { AccountProvider } from '../../resources/account/types/account.type';
import { AuthEmailRegisterReqDto } from './dto/auth-email-register-req.dto';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { AuthEmailLoginReqDto } from './dto/auth-email-login-req.dto';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from '@utils/services/crypto.service';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/all-config.type';
import { MailService } from '@application/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private accountService: AccountService,
    private jwtService: JwtService,
    private cryptoService: CryptoService,
    private configService: ConfigService<AllConfigType>,
    private mailService: MailService,
  ) {}
  public async register(data: AuthEmailRegisterReqDto): Promise<void> {
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
    delete data.confirmPassword;
    const hashPassword = await this.cryptoService.hash(
      data.password,
      this.configService.getOrThrow('auth.bcryptSaltRound', { infer: true }),
    );
    const user = await this.accountService.create({
      ...data,
      password: hashPassword,
    });

    const hash = await this.jwtService.signAsync(
      { userId: user.id },
      {
        secret: this.configService.getOrThrow('auth.verifyEmailSecret', {
          infer: true,
        }),
        expiresIn: this.configService.getOrThrow(
          'auth.verifyEmailExpiredTime',
          { infer: true },
        ),
      },
    );

    await this.mailService.verifyEmail({ to: data.email, data: { hash } });
  }

  public async login(data: AuthEmailLoginReqDto): Promise<AccountDomain> {
    let user: NullAble<AccountDomain> = null;
    if (data.identifier.match(new RegExp(/^(\+66|0)[0-9]{9}$/))) {
      user = await this.accountService.findByPhoneNumber(data.identifier);
    } else {
      user = await this.accountService.findByEmail(data.identifier);
    }
    if (!user) {
      throw ErrorApiResponse.notFoundRequest(
        'The email requested could not be find on this server',
      );
    }
    return user;
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
