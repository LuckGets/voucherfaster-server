import { Session } from '@prisma/client';
import { SessionDomain } from '@resources/session/domain/session.domain';

export class SessionMapper {
  public static toDomain(data: Session): SessionDomain {
    const domain = new SessionDomain();
    domain.id = data.id;
    domain.account = data.accountId;
    domain.token = data.token;
    domain.createdAt = data.createdAt;
    domain.updatedAt = data.updatedAt;
    return domain;
  }
}
