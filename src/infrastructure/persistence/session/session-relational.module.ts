import { Module } from '@nestjs/common';
import { SessionRepository } from './session.respository';
import { SessionRelationalPrismaORMRepository } from './prisma-relational/session.repository';
import { PrismaService } from '../config/prisma.service';

@Module({
  providers: [
    {
      provide: SessionRepository,
      useClass: SessionRelationalPrismaORMRepository,
    },
    PrismaService,
  ],
  exports: [SessionRepository],
})
export class SessionRelationalPersistenceModule {}
