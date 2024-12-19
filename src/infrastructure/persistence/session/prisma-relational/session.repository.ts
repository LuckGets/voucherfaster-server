import { Injectable } from '@nestjs/common';
import { SessionRepository } from '../session.respository';
import { SessionDomain } from '@resources/session/domain/session.domain';
import { PrismaService } from '../../config/prisma.service';
import { Prisma } from '@prisma/client';
import { SessionMapper } from './session.mapper';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { NullAble } from '@utils/types/common.type';

@Injectable()
export class SessionRelationalPrismaORMRepository implements SessionRepository {
  constructor(private prismaService: PrismaService) {}
  async create(
    data: Pick<SessionDomain, 'id' | 'account' | 'token'>,
  ): Promise<SessionDomain> {
    const createInput: Prisma.SessionUncheckedCreateInput = {
      id: data.id as string,
      accountId: data.account as string,
      token: data.token,
    };
    return SessionMapper.toDomain(
      await this.prismaService.session.create({ data: createInput }),
    );
  }
  async findByAccountId(
    accountId: SessionDomain['account'],
  ): Promise<NullAble<SessionDomain>> {
    const session = await this.prismaService.session.findUnique({
      where: {
        accountId: accountId as string,
      },
    });
    return session ? SessionMapper.toDomain(session) : null;
  }
  async findById(id: SessionDomain['id']): Promise<NullAble<SessionDomain>> {
    const session = await this.prismaService.session.findUnique({
      where: {
        id: String(id),
      },
    });
    return session ? SessionMapper.toDomain(session) : null;
  }
  async update(
    id: SessionDomain['id'],
    token: SessionDomain['token'],
  ): Promise<NullAble<SessionDomain>> {
    const session = await this.findById(id);
    if (!session) {
      throw ErrorApiResponse.notFoundRequest(
        'This session ID can not be found in this server.',
      );
    }
    return SessionMapper.toDomain(
      await this.prismaService.session.update({
        where: {
          id: session.id as string,
        },
        data: {
          token,
        },
      }),
    );
  }
  async deleteById(sessionId: SessionDomain['id']): Promise<void> {
    await this.prismaService.session.delete({
      where: {
        id: String(sessionId),
      },
    });
    return;
  }
}
