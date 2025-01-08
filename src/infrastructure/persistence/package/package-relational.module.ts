import { Module } from '@nestjs/common';
import { PackageVoucherRepository } from './package.repository';
import { PackageVoucherRelationalPrismaORMRepository } from './prisma-relational/package.repository';
import { PrismaService } from '../config/prisma.service';
import { PackageRewardVoucherRepository } from './package-reward.repository';
import { PackageRewardRelationalPrismaORMRepository } from './prisma-relational/package-reward.repository';
import { PackageImgRepository } from './package-img.repository';
import { PackageImgRelationalPrismaORMRepository } from './prisma-relational/package-img.repository';

@Module({
  providers: [
    {
      provide: PackageVoucherRepository,
      useClass: PackageVoucherRelationalPrismaORMRepository,
    },
    {
      provide: PackageRewardVoucherRepository,
      useClass: PackageRewardRelationalPrismaORMRepository,
    },
    {
      provide: PackageImgRepository,
      useClass: PackageImgRelationalPrismaORMRepository,
    },
    PrismaService,
  ],
  exports: [
    PackageVoucherRepository,
    PackageRewardVoucherRepository,
    PackageImgRepository,
  ],
})
export class PackageVoucherRelationalPersistenceModule {}
