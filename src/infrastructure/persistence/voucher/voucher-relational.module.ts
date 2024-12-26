import { Module } from '@nestjs/common';
import {
  VoucherCategoryRepository,
  VoucherImgRepository,
  VoucherRepository,
  VoucherTagRepository,
} from './voucher.repository';
import {
  VoucherCategoryRelationalPrismaORMRepository,
  VoucherImgRelationalPrismaORMRepository,
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
    {
      provide: VoucherImgRepository,
      useClass: VoucherImgRelationalPrismaORMRepository,
    },
  ],
  exports: [
    VoucherRepository,
    VoucherCategoryRepository,
    VoucherTagRepository,
    VoucherImgRepository,
  ],
})
export class VoucherRelationalRepositoryModule {}
