import { AccountDomain } from '@resources/account/domain/account.domain';
import { UUIDTypes } from 'uuid';

export class CreateSessionDto {
  id?: string | UUIDTypes;
  account: AccountDomain['id'];
  token: string;
}
export class UpdateSessionDto {
  token: string;
}
