import { Module } from '@nestjs/common';
import { PrismaModule } from '../config/prisma.module';
import { AccountRepository } from './account.repository';
import { AccountRelationalPrismaORMRepository } from './prisma-relational/account.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: AccountRepository,
      useClass: AccountRelationalPrismaORMRepository,
    },
  ],
  exports: [AccountRepository],
})
export class AccountRelationalPersistenceModule {}
