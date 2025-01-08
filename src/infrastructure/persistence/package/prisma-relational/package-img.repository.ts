import { PackageImgCreateInput } from '@resources/package/domain/package-voucher.domain';
import { PackageImgRepository } from '../package-img.repository';
import { Inject } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

export class PackageImgRelationalPrismaORMRepository
  implements PackageImgRepository
{
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}
  async createMany(imgData: PackageImgCreateInput[]): Promise<void> {
    await this.prismaService.packageImg.createMany({ data: imgData });
  }
}
