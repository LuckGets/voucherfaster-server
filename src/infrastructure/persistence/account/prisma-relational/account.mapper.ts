import { AccountDomain } from '@resources/account/domain/account.domain';
import { plainToInstance } from 'class-transformer';
import { Account } from '@prisma/client';
import { RoleEnum } from '@resources/account/types/account.type';

export class AccountMapper {
  static toDomain(accountEntity: Account): AccountDomain {
    const account = plainToInstance(AccountDomain, accountEntity);
    account.role = RoleEnum.User;
    return account;
  }
}
