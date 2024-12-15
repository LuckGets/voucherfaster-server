import { Injectable } from '@nestjs/common';
import { AccountRepository } from '../../infrastructure/persistence/account/account.repository';
import { NullAble } from '../../utils/types/NullAble.type';
import { AccountDomain } from './domain/account.domain';
import { AccountProvider } from './types/account.type';
import { CreateAccountDto } from './dto/create-account.dto';

@Injectable()
export class AccountService {
  constructor(private accountRepository: AccountRepository) {}
  public create(createAccountDto: CreateAccountDto): Promise<AccountDomain> {
    return this.accountRepository.create(createAccountDto);
  }
  public findById(id: AccountDomain['id']): Promise<NullAble<AccountDomain>> {
    return this.accountRepository.findById(id);
  }

  public findByEmail(
    email: AccountDomain['email'],
  ): Promise<NullAble<AccountDomain>> {
    return this.accountRepository.findByEmail(email);
  }

  public findBySocialIdAndProvider(
    socialId: string,
    provider: AccountProvider,
  ): Promise<NullAble<AccountDomain>> {
    return this.accountRepository.findBySocialIdAndProvider(socialId, provider);
  }
}
