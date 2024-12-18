import { Module } from '@nestjs/common';
import { SessionRepository } from './session.respository';
import { SessionRelationalPrismaORMRepository } from './prisma-relational/session.repository';

@Module({
  providers: [
    {
      provide: SessionRepository,
      useClass: SessionRelationalPrismaORMRepository,
    },
  ],
  exports: [SessionRepository],
})
export class SessionRelationalPersistenceModule {}
