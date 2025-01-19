import { Inject, Module } from '@nestjs/common';
import { UsableDaysController } from './usable-days.controller';
import { UsableDaysService } from './usable-days.service';
import { UsableDaysRelationalRepositoryModule } from 'src/infrastructure/persistence/usable-days/usable-days-relational.module';
import { UUIDService } from '@utils/services/uuid.service';
import { UsableDaysAfterPurchasedRepository } from 'src/infrastructure/persistence/usable-days/usable-days.repository';

@Module({
  imports: [UsableDaysRelationalRepositoryModule],
  controllers: [UsableDaysController],
  providers: [UsableDaysService, UUIDService],
  exports: [UsableDaysService],
})
export class UsableDaysModule {}
