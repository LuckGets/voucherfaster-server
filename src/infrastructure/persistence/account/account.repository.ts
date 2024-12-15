import { AccountDomain } from '../../../resources/account/domain/account.domain';
import { CreateAccountDto } from '../../../resources/account/dto/create-account.dto';
import { NullAble } from '../../../utils/types/NullAble.type';

export abstract class AccountRepository {
  abstract create(data: CreateAccountDto): Promise<AccountDomain>;
  abstract findById(id: AccountDomain['id']): Promise<NullAble<AccountDomain>>;
  abstract findByEmail(
    email: AccountDomain['email'],
  ): Promise<NullAble<AccountDomain>>;
  abstract findBySocialIdAndProvider(
    socialId: AccountDomain['socialId'],
    provider: AccountDomain['accountProvider'],
  ): Promise<NullAble<AccountDomain>>;
  abstract update(
    id: AccountDomain['id'],
    data: Partial<AccountDomain>,
  ): Promise<NullAble<AccountDomain>>;
}
