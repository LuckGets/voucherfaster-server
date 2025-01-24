import { Module } from '@nestjs/common';
import { PrismaModule } from '../config/prisma.module';
import { RedeemItemRepository } from './redeem.repository';
import { RedeemRelationaPrismaORMRepository } from './prisma-relational/redeem.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: RedeemItemRepository,
      useClass: RedeemRelationaPrismaORMRepository,
    },
  ],
  exports: [RedeemItemRepository],
})
export class RedeemRelationalPersistenceModule {}
