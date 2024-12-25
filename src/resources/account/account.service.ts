import { Injectable } from '@nestjs/common';
import { AccountRepository } from '../../infrastructure/persistence/account/account.repository';
import { AccountDomain } from './domain/account.domain';
import { AccountProvider, AccountProviderEnum } from './types/account.type';
import { CreateAccountDto } from './dto/create-account.dto';
import { NullAble } from '@utils/types/common.type';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { HttpRequestWithUser } from 'src/common/http.type';
import { CryptoService } from '@utils/services/crypto.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/all-config.type';
import { UpdateAccountDto } from './dto/update-account.dto';
import { MailService } from '@application/mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { VerifyTokenPayloadType } from 'src/common/types/token-payload.type';

@Injectable()
export class AccountService {
  private readonly verifyEmailSecret: string;
  private readonly changePasswordSecret: string;
  constructor(
    private accountRepository: AccountRepository,
    private cryptoService: CryptoService,
    private configService: ConfigService<AllConfigType>,
    private mailService: MailService,
    private jwtService: JwtService,
  ) {
    this.changePasswordSecret = configService.get(
      'account.changePasswordSecret',
      { infer: true },
    );
    this.verifyEmailSecret = configService.get('auth.verifyEmailSecret', {
      infer: true,
    });
  }
  public create(createAccountDto: CreateAccountDto): Promise<AccountDomain> {
    return this.accountRepository.create(createAccountDto);
  }
  public async findById(
    id: AccountDomain['id'],
  ): Promise<NullAble<AccountDomain>> {
    const account = await this.accountRepository.findById(id);
    if (!account) throw ErrorApiResponse.notFoundRequest();
    return account;
  }

  public findByEmail(
    email: AccountDomain['email'],
  ): Promise<NullAble<AccountDomain>> {
    return this.accountRepository.findByEmail(email);
  }

  public findByPhoneNumber(
    phone: AccountDomain['phone'],
  ): Promise<NullAble<AccountDomain>> {
    return this.accountRepository.findByPhoneNumber(phone);
  }

  public findBySocialIdAndProvider(
    socialId: string,
    provider: AccountProvider,
  ): Promise<NullAble<AccountDomain>> {
    return this.accountRepository.findBySocialIdAndProvider(socialId, provider);
  }

  public async update(
    accountId: AccountDomain['id'],
    data: UpdateAccountDto,
  ): Promise<NullAble<AccountDomain>> {
    if (data.email) {
      data.verifiedAt = null;
    }
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw ErrorApiResponse.notFoundRequest(
        'This account with provided ID does not exist',
      );
    }

    const updatedAccount = await this.accountRepository.update(accountId, data);
    if (updatedAccount.email !== account.email) {
      const payload: VerifyTokenPayloadType = { sub: updatedAccount.id };
      const token = await this.jwtService.signAsync(payload, {
        secret: this.verifyEmailSecret,
        expiresIn: this.configService.get('auth.verifyEmailExpiredTime', {
          infer: true,
        }),
      });
      await this.mailService.verifyEmail({
        to: updatedAccount.email,
        data: { token },
      });
    }
    return updatedAccount;
  }

  public async changePassword(
    reqUser: HttpRequestWithUser['user'],
    data: ChangePasswordDto,
  ): Promise<AccountDomain> {
    // Finding the account via access token
    const account = await this.findById(reqUser.accountId);
    // If account not existing throw an error
    if (!account) {
      throw ErrorApiResponse.notFoundRequest();
    }
    // If account not registered via local, there should not have password
    if (account.accountProvider !== AccountProviderEnum.Local) {
      throw ErrorApiResponse.conflictRequest();
    }

    // Check if old password match the registered password
    const isPasswordMatch = await this.cryptoService.compare(
      data.oldPassword,
      account.password,
    );
    if (!isPasswordMatch) {
      throw ErrorApiResponse.unauthorizedRequest(
        'The identifier information is incorrect. Please try again.',
      );
    }

    // setting the payload before sending via email
    const tokenPayload: VerifyTokenPayloadType = {
      sub: account.id,
      newPassword: data.newPassword,
    };
    // sign the token the
    const token = await this.jwtService.signAsync(tokenPayload, {
      secret: this.changePasswordSecret,
      expiresIn: this.configService.get('account.changePasswordExpiredTime', {
        infer: true,
      }),
    });

    // Sending confirm email for changing password
    await this.mailService.changePassword({
      to: account.email,
      data: { token },
    });
    // Returning the account for sending link
    return account;
  }
  public async confirmChangePassword(token: string): Promise<AccountDomain> {
    const { sub, newPassword } =
      await this.jwtService.verifyAsync<VerifyTokenPayloadType>(token, {
        secret: this.changePasswordSecret,
      });
    return this.update(sub, {
      password: newPassword,
    });
  }

  public async verifyEmail(token: string): Promise<AccountDomain> {
    const payload: VerifyTokenPayloadType = await this.jwtService.verifyAsync(
      token,
      {
        secret: this.verifyEmailSecret,
      },
    );
    return this.accountRepository.update(payload.sub, {
      verifiedAt: new Date(Date.now()),
    });
  }

  public async resendVerifyEmail(
    id: AccountDomain['id'],
  ): Promise<AccountDomain> {
    const account = await this.findById(id);
    if (!account) {
      throw ErrorApiResponse.notFoundRequest();
    }

    const payload: VerifyTokenPayloadType = { sub: account.id };
    const token: string = await this.jwtService.signAsync(payload, {
      secret: this.verifyEmailSecret,
      expiresIn: this.configService.getOrThrow('auth.verifyEmailExpiredTime', {
        infer: true,
      }),
    });
    await this.mailService.verifyEmail({
      data: { token },
      to: account.email,
    });
    return account;
  }
}
