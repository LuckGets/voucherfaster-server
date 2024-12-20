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
  constructor(
    private accountRepository: AccountRepository,
    private cryptoService: CryptoService,
    private configService: ConfigService<AllConfigType>,
    private mailService: MailService,
    private jwtService: JwtService,
  ) {}
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
    if (data.password) {
      data.verifiedAt = null;
    }
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw ErrorApiResponse.notFoundRequest(
        'This account with provided ID does not exist',
      );
    }

    return this.accountRepository.update(accountId, data);
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
      sub: {
        accountId: account.id,
      },
    };
    // sign the token the
    const token = await this.jwtService.signAsync(tokenPayload, {
      secret: this.configService.get('account.changePasswordSecret', {
        infer: true,
      }),
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
  public async confirmChangePassword(
    accountId: AccountDomain['id'],
    data: ChangePasswordDto,
  ) {
    const newPassword = await this.cryptoService.hash(
      data.newPassword,
      this.configService.get('auth.bcryptSaltRound', { infer: true }),
    );
    return this.update(accountId, {
      password: newPassword,
    });
  }
}
