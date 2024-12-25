import { AccountDomain } from '@resources/account/domain/account.domain';
import { plainToInstance } from 'class-transformer';
import { Account } from '@prisma/client';
import {
  AccountProviderEnum,
  RoleEnum,
} from '@resources/account/types/account.type';

export class AccountMapper {
  static toDomain(accountEntity: Account): AccountDomain {
    const accountDomain = plainToInstance(AccountDomain, accountEntity);

    accountDomain.accountProvider =
      AccountProviderEnum[
        `${accountEntity.accountProvider[0]}${accountEntity.accountProvider.toLowerCase().slice(1)}`
      ];
    accountDomain.role =
      RoleEnum[
        `${accountEntity.role[0]}${accountEntity.role.toLowerCase().slice(1)}`
      ];
    return accountDomain;
  }
}
