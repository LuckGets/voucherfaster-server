import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { UUIDService } from '@utils/services/uuid.service';
import { SessionRelationalPersistenceModule } from 'src/infrastructure/persistence/session/session-relational.module';

@Module({
  imports: [SessionRelationalPersistenceModule],
  providers: [SessionService, UUIDService],
  exports: [SessionService],
})
export class SessionModule {}
