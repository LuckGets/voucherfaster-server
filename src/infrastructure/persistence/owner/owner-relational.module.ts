import { Module } from '@nestjs/common';
import { PrismaModule } from '../config/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [],
  exports: [],
})
export class OwnerRelationalRepositoryModule {}
