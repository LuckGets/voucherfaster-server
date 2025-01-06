import { Module } from '@nestjs/common';
import {
  VoucherCategoryRepository,
  VoucherImgRepository,
  VoucherPromotionRepository,
  VoucherRepository,
  VoucherTagRepository,
} from './voucher.repository';
import { VoucherRelationalPrismaORMRepository } from './prisma-relational/voucher.repository';
import { PrismaModule } from '../config/prisma.module';
import { VoucherCategoryRelationalPrismaORMRepository } from './prisma-relational/voucher-category.repository';
import { VoucherTagRelationalPrismaORMRepository } from './prisma-relational/voucher-tag.repository';
import { VoucherImgRelationalPrismaORMRepository } from './prisma-relational/voucher-img.repository';
import { VoucherPromotionRelationalOPrismaORMRepository } from './prisma-relational/voucher-promotion.repository';

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
  ],
  exports: [
    VoucherRepository,
    VoucherCategoryRepository,
    VoucherTagRepository,
    VoucherImgRepository,
  ],
})
export class VoucherRelationalRepositoryModule {}
