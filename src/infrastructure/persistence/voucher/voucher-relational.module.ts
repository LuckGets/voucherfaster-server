import { Module } from '@nestjs/common';
import {
  VoucherCategoryRepository,
  VoucherRepository,
  VoucherTagRepository,
} from './voucher.repository';
import {
  VoucherCategoryRelationalPrismaORMRepository,
  VoucherRelationalPrismaORMRepository,
  VoucherTagRelationalPrismaORMRepository,
} from './prisma-relational/voucher.repository';
import { PrismaModule } from '../config/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: VoucherRepository,
      useClass: VoucherRelationalPrismaORMRepository,
    },
    {
      provide: VoucherCategoryRepository,
      useClass: VoucherCategoryRelationalPrismaORMRepository,
    },
    {
      provide: VoucherTagRepository,
      useClass: VoucherTagRelationalPrismaORMRepository,
    },
  ],
  exports: [VoucherRepository, VoucherCategoryRepository, VoucherTagRepository],
})
export class VoucherRelationalRepositoryModule {}
