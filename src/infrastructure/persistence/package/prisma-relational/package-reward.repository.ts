import { Inject } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { PackageRewardVoucherRepository } from '../package-reward.repository';
import {
  PackageRewardVoucherCreateInput,
  PackageRewardVoucherDomain,
} from '@resources/package/domain/package-voucher.domain';
import { PackageRewardVoucherMapper } from './mapper/package-reward.mapper';

export class PackageRewardRelationalPrismaORMRepository
  implements PackageRewardVoucherRepository
{
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}
  async create(
    data: PackageRewardVoucherCreateInput,
  ): Promise<PackageRewardVoucherDomain> {
    const rewardVoucher = await this.prismaService.packageRewardVoucher.create({
      data,
    });
    return PackageRewardVoucherMapper.toDomain(rewardVoucher);
  }
}
