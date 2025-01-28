import { Module } from '@nestjs/common';
import {
  VoucherDiscountRepository,
  VoucherImgRepository,
  VoucherRepository,
} from './voucher.repository';
import { VoucherRelationalPrismaORMRepository } from './prisma-relational/voucher.repository';
import { PrismaModule } from '../config/prisma.module';
import { VoucherImgRelationalPrismaORMRepository } from './prisma-relational/voucher-img/voucher-img.repository';
import { VoucherDiscountRelationalPrismaORMRepository } from './prisma-relational/voucher-discount/voucher-discount.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: VoucherRepository,
      useClass: VoucherRelationalPrismaORMRepository,
    },
    {
      provide: VoucherImgRepository,
      useClass: VoucherImgRelationalPrismaORMRepository,
    },
    {
      provide: VoucherDiscountRepository,
      useClass: VoucherDiscountRelationalPrismaORMRepository,
    },
  ],
  exports: [VoucherRepository, VoucherImgRepository, VoucherDiscountRepository],
})
export class VoucherRelationalPersistenceModule {}
