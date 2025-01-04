import { Module } from '@nestjs/common';
import {
  VoucherCategoryRepository,
  VoucherImgRepository,
  VoucherRepository,
  VoucherTagRepository,
} from './voucher.repository';
import { VoucherRelationalPrismaORMRepository } from './prisma-relational/voucher.repository';
import { PrismaModule } from '../config/prisma.module';
import { VoucherCategoryRelationalPrismaORMRepository } from './prisma-relational/voucher-category.repository';
import { VoucherTagRelationalPrismaORMRepository } from './prisma-relational/voucher-tag.repository';
import { VoucherImgRelationalPrismaORMRepository } from './prisma-relational/voucher-img.repository';

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
