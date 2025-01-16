import { Module } from '@nestjs/common';
import { UsableDaysAfterPurchasedRepository } from './usable-days.repository';
import { UsableDaysRelationalPrismaORMRepository } from './prisma-relational/usable-days.repository';
import { PrismaModule } from '../config/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: UsableDaysAfterPurchasedRepository,
      useClass: UsableDaysRelationalPrismaORMRepository,
    },
  ],
  exports: [UsableDaysAfterPurchasedRepository],
})
export class UsableDaysRelationalRepositoryModule {}
