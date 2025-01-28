import { Module } from '@nestjs/common';
import { PrismaModule } from '../config/prisma.module';
import { VoucherTagRepository } from './voucher-tag.repository';
import { VoucherTagRelationalPrismaORMRepository } from './prisma-relational/voucher-tag.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: VoucherTagRepository,
      useClass: VoucherTagRelationalPrismaORMRepository,
    },
  ],
  exports: [VoucherTagRepository],
})
export class VoucherTagRelationalPersistenceModule {}
