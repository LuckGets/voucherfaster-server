import { Inject } from '@nestjs/common';
import { PackageVoucherRepository } from '../package.repository';
import { PrismaService } from '../../config/prisma.service';
import {
  PackageVoucherCreateInput,
  PackageImgCreateInput,
  PackageRewardVoucherCreateInput,
  PackageVoucherDomain,
} from '@resources/package/domain/package-voucher.domain';
import { Prisma } from '@prisma/client';
import { PackageVoucherMapper } from './mapper/package.mapper';
import { generatePaginationQueryOption } from '@utils/prisma/service';

export class PackageVoucherRelationalPrismaORMRepository
  implements PackageVoucherRepository
{
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}

  private findManyJoinQuery:
    | Prisma.PackageVoucherFindManyArgs
    | Prisma.PackageVoucherFindFirstArgs = {
    include: {
      PackageImg: {
        where: {
          deletedAt: {
            equals: null,
          },
        },
      },
      PackageRewardVoucher: true,
    },
  };

  async createPackageVoucher({
    packageVoucherCreateInput,
    packageImage,
    packageRewardVoucher,
  }: {
    packageVoucherCreateInput: PackageVoucherCreateInput;
    packageImage: PackageImgCreateInput[];
    packageRewardVoucher: PackageRewardVoucherCreateInput[];
  }): Promise<PackageVoucherDomain> {
    const { price, quotaVoucherId, ...restData } = packageVoucherCreateInput;

    // Process the information
    const packageVoucherData: Prisma.PackageVoucherCreateInput = {
      ...restData,
      packagePrice: price,
      voucher: { connect: { id: quotaVoucherId } },
    };

    // transaction for creating all of the package related information
    const createdPackageVoucher = await this.prismaService.$transaction(
      async (txUnit) => {
        const packageVoucher = await txUnit.packageVoucher.create({
          data: packageVoucherData,
        });

        await Promise.all([
          txUnit.packageRewardVoucher.createMany({
            data: packageRewardVoucher,
          }),
          txUnit.packageImg.createMany({
            data: packageImage,
          }),
        ]);
        return packageVoucher;
      },
    );
    return PackageVoucherMapper.toDomain(createdPackageVoucher);
  }

  async findManyPackageVoucher(): Promise<PackageVoucherDomain[]> {
    // Grab the pagination query option
    const paginateQueryOption = generatePaginationQueryOption<
      any,
      PackageVoucherDomain['id']
    >({});
    // Set the today date for query.
    const currentDate: Date = new Date(Date.now());
    // Grab JOIN query
    const joinQuery = this.findManyJoinQuery;
    // Query the data in the database.
    const packageVoucherQueryList =
      await this.prismaService.packageVoucher.findMany({
        where: {
          deletedAt: {
            equals: null,
          },
          startedAt: {
            lte: currentDate,
          },
        },
        ...paginateQueryOption,
        ...joinQuery,
      });
    return packageVoucherQueryList.map(PackageVoucherMapper.toDomain);
  }

  async deletePackageVoucherById(
    id: PackageVoucherDomain['id'],
  ): Promise<void> {
    const currentDate: Date = new Date(Date.now());
    // Update the deletedAt column
    // So the package voucher can be marked as
    // deleted.
    await this.prismaService.packageVoucher.update({
      where: { id },
      data: { deletedAt: currentDate },
    });
    return;
  }
}
