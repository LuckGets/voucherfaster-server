import { Injectable } from '@nestjs/common';
import { SessionRepository } from 'src/infrastructure/persistence/session/session.respository';
import { SessionDomain } from './domain/session.domain';
import { UUIDService } from '@utils/services/uuid.service';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { CreateSessionDto, UpdateSessionDto } from './dto/session.dto';
import { NullAble } from '@utils/types/common.type';

@Injectable()
export class SessionService {
  constructor(
    private sessionRepository: SessionRepository,
    private uuidService: UUIDService,
  ) {}

  public findById(id: SessionDomain['id']): Promise<NullAble<SessionDomain>> {
    return this.sessionRepository.findById(id);
  }

  public findByToken(
    token: SessionDomain['token'],
  ): Promise<NullAble<SessionDomain>> {
    return this.sessionRepository.findByToken(token);
  }

  public create(
    createSessionDto: CreateSessionDto,
  ): Promise<NullAble<SessionDomain>> {
    return this.sessionRepository.create({
      ...createSessionDto,
      id: this.uuidService.make() as string,
    });
  }

  public async update(
    id: SessionDomain['id'],
    updateSessonDto: UpdateSessionDto,
  ): Promise<SessionDomain> {
    return await this.sessionRepository.update(id, updateSessonDto.token);
  }

  public findbyAccountId(
    accountId: SessionDomain['account'],
  ): Promise<NullAble<SessionDomain>> {
    return this.sessionRepository.findByAccountId(accountId);
  }
  public async deleteById(sessionId: SessionDomain['id']): Promise<void> {
    const isSessionExist = await this.sessionRepository.findById(sessionId);
    if (!isSessionExist) return;
    return this.sessionRepository.deleteById(sessionId);
  }
}
