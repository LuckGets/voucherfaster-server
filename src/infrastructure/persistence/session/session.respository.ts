import { Injectable } from '@nestjs/common';
import { SessionDomain } from '@resources/session/domain/session.domain';
import { NullAble } from '@utils/types/NullAble.type';

@Injectable()
export abstract class SessionRepository {
  abstract create(
    data: Pick<SessionDomain, 'id' | 'account' | 'token'>,
  ): Promise<SessionDomain>;
  abstract findById(id: SessionDomain['id']): Promise<NullAble<SessionDomain>>;
  abstract update(
    id: SessionDomain['id'],
    token: SessionDomain['token'],
  ): Promise<NullAble<SessionDomain>>;
  abstract findByAccountId(
    accountId: SessionDomain['account'],
  ): Promise<NullAble<SessionDomain>>;
}
