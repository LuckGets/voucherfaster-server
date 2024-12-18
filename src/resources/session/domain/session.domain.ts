import { AccountDomain } from '@resources/account/domain/account.domain';
export class SessionDomain {
  id: string | number;
  token: string;
  account: AccountDomain['id'];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
