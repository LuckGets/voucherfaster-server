import { Module } from '@nestjs/common';
import {
  VoucherCategoryRepository,
  VoucherImgRepository,
  VoucherPromotionRepository,
  VoucherRepository,
  VoucherTagRepository,
  VoucherUsageDayRepository,
} from './voucher.repository';
import { VoucherRelationalPrismaORMRepository } from './prisma-relational/voucher.repository';
import { PrismaModule } from '../config/prisma.module';
import { VoucherCategoryRelationalPrismaORMRepository } from './prisma-relational/voucher-category.repository';
import { VoucherTagRelationalPrismaORMRepository } from './prisma-relational/voucher-tag.repository';
import { VoucherImgRelationalPrismaORMRepository } from './prisma-relational/voucher-img.repository';
import { VoucherPromotionRelationalOPrismaORMRepository } from './prisma-relational/voucher-promotion.repository';
import { VoucherUsageDayRelationalPrismaORMRepository } from './prisma-relational/voucher-usage-day.repository';

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
    {
      provide: VoucherPromotionRepository,
      useClass: VoucherPromotionRelationalOPrismaORMRepository,
    },
    {
      provide: VoucherUsageDayRepository,
      useClass: VoucherUsageDayRelationalPrismaORMRepository,
    },
  ],
  exports: [
    VoucherRepository,
    VoucherCategoryRepository,
    VoucherTagRepository,
    VoucherImgRepository,
    VoucherPromotionRepository,
    VoucherUsageDayRepository,
  ],
})
export class VoucherRelationalRepositoryModule {}
