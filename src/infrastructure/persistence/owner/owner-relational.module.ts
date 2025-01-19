import { Module } from '@nestjs/common';
import { PrismaModule } from '../config/prisma.module';
import { OwnerRepository } from './owner.repository';
import { OwnerRelationalPrismaORMRepository } from './prisma-relational/owner.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    { provide: OwnerRepository, useClass: OwnerRelationalPrismaORMRepository },
  ],
  exports: [OwnerRepository],
})
export class OwnerRelationalRepositoryModule {}
