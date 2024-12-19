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

@Injectable()
export class AccountService {
  constructor(
    private accountRepository: AccountRepository,
    private cryptoService: CryptoService,
    private configService: ConfigService<AllConfigType>,
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
    accountId: AccountDomain['id'],
    reqUser: HttpRequestWithUser['user'],
    data: ChangePasswordDto,
  ): Promise<AccountDomain> {
    const account = await this.findById(accountId);
    if (!account) {
      throw ErrorApiResponse.notFoundRequest();
    }
    if (reqUser.accountId !== account.id) {
      throw ErrorApiResponse.unauthorizedRequest();
    }
    if (account.accountProvider !== AccountProviderEnum.Local) {
      throw ErrorApiResponse.conflictRequest();
    }

    const isPasswordMatch = await this.cryptoService.compare(
      data.oldPassword,
      account.password,
    );
    if (!isPasswordMatch) {
      throw ErrorApiResponse.unauthorizedRequest(
        'The identifier information is incorrect. Please try again.',
      );
    }

    // Sending confirm email for changing password

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
