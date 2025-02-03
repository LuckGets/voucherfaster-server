import { Module } from '@nestjs/common';
import { PackageVoucherRepository } from './package.repository';
import { PackageVoucherRelationalPrismaORMRepository } from './prisma-relational/package.repository';
import { PrismaService } from '../config/prisma.service';
import { PackageImgRepository } from './package-img.repository';
import { PackageImgRelationalPrismaORMRepository } from './prisma-relational/package-img.repository';
import { UUIDService } from '@utils/services/uuid.service';

@Module({
  providers: [
    {
      provide: PackageVoucherRepository,
      useClass: PackageVoucherRelationalPrismaORMRepository,
    },
    {
      provide: PackageImgRepository,
      useClass: PackageImgRelationalPrismaORMRepository,
    },
    PrismaService,
    UUIDService,
  ],
  exports: [PackageVoucherRepository, PackageImgRepository],
})
export class PackageVoucherRelationalPersistenceModule {}
