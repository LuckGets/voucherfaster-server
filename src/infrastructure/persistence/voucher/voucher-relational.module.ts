import { Module } from '@nestjs/common';
import { VoucherImgRepository, VoucherRepository } from './voucher.repository';
import { VoucherRelationalPrismaORMRepository } from './prisma-relational/voucher.repository';
import { PrismaModule } from '../config/prisma.module';
import { VoucherImgRelationalPrismaORMRepository } from './prisma-relational/voucher-img/voucher-img.repository';

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
  ],
  exports: [VoucherRepository, VoucherImgRepository],
})
export class VoucherRelationalPersistenceModule {}
