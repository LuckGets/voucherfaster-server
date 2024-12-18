import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AccountService } from '../../resources/account/account.service';
import { NullAble } from '../../utils/types/NullAble.type';
import { AccountDomain } from '../../resources/account/domain/account.domain';
import {
  AccountProvider,
  AccountProviderEnum,
} from '../../resources/account/types/account.type';
import { AuthEmailRegisterReqDto } from './dto/auth-email-register-req.dto';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { AuthEmailLoginReqDto } from './dto/auth-email-login-req.dto';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from '@utils/services/crypto.service';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/all-config.type';
import { MailService } from '@application/mail/mail.service';
import { UUIDService } from '@utils/services/uuid.service';
import { SessionDomain } from '@resources/session/domain/session.domain';
import { SessionService } from '@resources/session/session.service';

@Injectable()
export class AuthService {
  constructor(
    private accountService: AccountService,
    private jwtService: JwtService,
    private cryptoService: CryptoService,
    private configService: ConfigService<AllConfigType>,
    private mailService: MailService,
    private uuidService: UUIDService,
    private sessionService: SessionService,
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
      id: this.uuidService.make(),
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

  public async validateLogin(
    data: AuthEmailLoginReqDto,
  ): Promise<AccountDomain> {
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

    if (user.accountProvider !== AccountProviderEnum.Local) {
      throw ErrorApiResponse.conflictRequest(
        `This account has been registered via ${user.accountProvider}. Please login via ${user.accountProvider} to proceed`,
      );
    }
    const isPasswordMatch = await this.cryptoService.compare(
      data.password,
      user.password,
    );

    if (!isPasswordMatch) {
      throw ErrorApiResponse.unauthorizedRequest(
        'The identifier or password does not match',
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

  public async logout() {}

  public async refreshToken(
    refreshToken: string,
    sessionId: SessionDomain['id'],
  ): Promise<{
    newAccessToken: string;
    newRefreshToken: string;
    sessionId: string;
  }> {
    const exisitingSession = await this.sessionService.findById(sessionId);
    if (exisitingSession.token !== refreshToken) {
      throw ErrorApiResponse.unauthorizedRequest();
    }
    const refreshTokenPayload: { sub: string } = this.jwtService.verify(
      refreshToken,
      {
        secret: this.configService.get('auth.refreshTokenSecret', {
          infer: true,
        }),
      },
    );
    if (exisitingSession.account != refreshTokenPayload.sub) {
      throw ErrorApiResponse.unauthorizedRequest();
    }
    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.generateToken(
        { accountId: exisitingSession.id as string },
        'access',
      ),
      this.generateToken(
        { accountId: exisitingSession.id as string },
        'access',
      ),
    ]);

    const updateSession = await this.sessionService.update(
      exisitingSession.id,
      {
        token: refreshToken,
      },
    );
    return {
      newAccessToken: newAccessToken,
      newRefreshToken: newRefreshToken,
      sessionId: updateSession.id as string,
    };
  }

  public async generateToken(
    payload: Record<string, Record<string, string> | string>,
    tokenType: 'access' | 'refresh',
  ): Promise<string> {
    const jwtSecret = this.configService.get(
      tokenType === 'access'
        ? 'auth.accessTokenSecret'
        : 'auth.refreshTokenSecret',
      {
        infer: true,
      },
    );
    const expiredTime = this.configService.get(
      tokenType === 'access'
        ? 'auth.accessTokenExpireTime'
        : 'auth.refreshTokenExpireTime',
      {
        infer: true,
      },
    );

    return this.jwtService.signAsync(payload, {
      secret: jwtSecret,
      expiresIn: expiredTime,
    });
  }
}
