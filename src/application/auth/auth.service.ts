import { Injectable } from '@nestjs/common';
import { AccountService } from '../../resources/account/account.service';
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
import { NullAble } from '@utils/types/common.type';
import { CreateAccountDto } from '@resources/account/dto/create-account.dto';
import { RequestGoogleUser } from '@application/auth-google/types/req-user.type';
import { plainToInstance } from 'class-transformer';
import {
  JwtPayloadType,
  RefreshTokenPayloadType,
  VerifyTokenPayloadType,
} from 'src/common/types/token-payload.type';

@Injectable()
export class AuthService {
  private readonly verifyEmailSecret: string;
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  constructor(
    private accountService: AccountService,
    private jwtService: JwtService,
    private cryptoService: CryptoService,
    private configService: ConfigService<AllConfigType>,
    private mailService: MailService,
    private uuidService: UUIDService,
    private sessionService: SessionService,
  ) {
    this.verifyEmailSecret = configService.get('auth.verifyEmailSecret', {
      infer: true,
    });
    this.accessTokenSecret = configService.get('auth.accessTokenSecret', {
      infer: true,
    });
    this.refreshTokenSecret = configService.get('auth.refreshTokenSecret', {
      infer: true,
    });
  }
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
      id: String(this.uuidService.make()),
      password: hashPassword,
    });

    const token = await this.jwtService.signAsync(
      { userId: user.id },
      {
        secret: this.verifyEmailSecret,
        expiresIn: this.configService.getOrThrow(
          'auth.verifyEmailExpiredTime',
          { infer: true },
        ),
      },
    );

    await this.mailService.verifyEmail({ to: data.email, data: { token } });
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
    socialData: RequestGoogleUser['user'],
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    sessionId: string;
  }> {
    let account: NullAble<AccountDomain> = null;
    let accountByEmail: NullAble<AccountDomain> = null;

    accountByEmail = await this.accountService.findByEmail(socialData.email);

    account = await this.accountService.findBySocialIdAndProvider(
      socialData.socialId,
      authProvider,
    );

    if (accountByEmail) {
      if (!account || accountByEmail.id != account.id) {
        throw ErrorApiResponse.conflictRequest(
          `This account have been provided identity via ${accountByEmail.accountProvider}. Please login via the correct provider}`,
        );
      }
      if (accountByEmail.accountProvider !== authProvider) {
        throw ErrorApiResponse.conflictRequest(
          `This account have been provided identity via ${accountByEmail.accountProvider}. Please login via the correct provider}`,
        );
      }
    }

    if (!account) {
      /**
       * Uncomment in case I can resolve the response from people API for phoneNumbers
       */
      // const googleUserPhoneResp = await fetch(
      //   `https://people.googleapis.com/v1/people/me?personFields=phoneNumbers`,
      //   {
      //     method: 'GET',
      //     headers: { Authorization: `Bearer ${req.user.accessToken}` },
      //   },
      // )
      //   .then((res) => res.json())
      //   .catch((err) => console.log('error', err));
      // console.log(googleUserPhoneResp);
      const createAccountObject: CreateAccountDto = {
        email: socialData.email,
        fullname: socialData.fullname,
        photo: socialData.photo,
        accountProvider: AccountProviderEnum.Google,
        socialId: socialData.socialId,
      };
      account = await this.accountService.create(
        plainToInstance(CreateAccountDto, createAccountObject),
      );
      console.log('Account after create', account);
      const payload: VerifyTokenPayloadType = { sub: account.id };
      const token: string = await this.jwtService.signAsync(payload, {
        secret: this.verifyEmailSecret,
      });
      console.log('Account email before sending mail', account.email);
      await this.mailService.verifyEmail({
        to: account.email,
        data: { token },
      });
    }
    return this.getTokenAndUpsertSession(account);
  }

  public async logout({
    refreshToken,
    sessionId,
  }: {
    refreshToken: string;
    sessionId: string;
  }): Promise<void> {
    if (refreshToken) {
      return this.sessionService.deleteById(sessionId);
    }
    return;
  }

  public async refreshToken(
    refreshToken: string,
    sessionId: SessionDomain['id'],
  ): Promise<{
    newAccessToken: string;
    newRefreshToken: string;
    sessionId: string;
  }> {
    const exisitingSession: NullAble<SessionDomain> =
      await this.sessionService.findById(sessionId);
    if (exisitingSession.token !== refreshToken) {
      throw ErrorApiResponse.unauthorizedRequest();
    }
    const refreshTokenPayload: RefreshTokenPayloadType = this.jwtService.verify(
      refreshToken,
      {
        secret: this.refreshTokenSecret,
      },
    );
    if (exisitingSession.account != refreshTokenPayload.sub) {
      throw ErrorApiResponse.unauthorizedRequest();
    }
    const account: AccountDomain = await this.accountService.findById(
      exisitingSession.account,
    );
    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.generateToken<JwtPayloadType>(
        {
          sub: account.id,
          role: account.role,
        },
        'access',
      ),
      this.generateToken<RefreshTokenPayloadType>(
        {
          sub: exisitingSession.account as string,
        },
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

  public async generateToken<
    T extends JwtPayloadType | RefreshTokenPayloadType,
  >(payload: T, tokenType: 'access' | 'refresh'): Promise<string> {
    const jwtSecret =
      tokenType === 'access' ? this.accessTokenSecret : this.refreshTokenSecret;
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
  public async getTokenAndUpsertSession(account: AccountDomain): Promise<{
    accessToken: string;
    refreshToken: string;
    sessionId: string;
  }> {
    let session: NullAble<SessionDomain> =
      await this.sessionService.findbyAccountId(account.id);
    const [accessToken, refreshToken] = await Promise.all([
      this.generateToken<JwtPayloadType>(
        {
          sub: account.id,
          role: account.role,
        },
        'access',
      ),
      this.generateToken<RefreshTokenPayloadType>(
        {
          sub: account.id,
        },
        'refresh',
      ),
    ]);

    if (!session) {
      session = await this.sessionService.create({
        account: account.id,
        token: refreshToken,
        id: this.uuidService.make(),
      });
    } else {
      session = await this.sessionService.update(session.id, {
        token: refreshToken,
      });
    }

    return { accessToken, refreshToken, sessionId: String(session.id) };
  }
}
