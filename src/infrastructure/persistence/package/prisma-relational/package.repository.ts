import { Inject } from '@nestjs/common';
import { PackageVoucherRepository } from '../package.repository';
import { PrismaService } from '../../config/prisma.service';
import {
  PackageVoucherCreateInput,
  PackageImgCreateInput,
  PackageRewardVoucherCreateInput,
  PackageVoucherDomain,
} from '@resources/package/domain/package-voucher.domain';
import { PackageVoucher, Prisma } from '@prisma/client';
import { PackageVoucherMapper } from './mapper/package.mapper';
import { generatePaginationQueryOption } from '@utils/prisma/service';
import { NullAble } from '@utils/types/common.type';
import {
  packageVoucherTermAndCondENCreateInput,
  packageVoucherTermAndCondTHCreateInput,
} from '@resources/package/domain/package-voucher-term-cond.domain';
import {
  UpdatePackageRewardVoucherDto,
  UpdatePackageVoucherDto,
} from '@resources/package/dto/update-package.dto';
import { TermAndCondUpdateDto } from '@resources/voucher/dto/vouchers/update-voucher.dto';
import { UUIDService } from '@utils/services/uuid.service';

export class PackageVoucherRelationalPrismaORMRepository
  implements PackageVoucherRepository
{
  constructor(
    @Inject(PrismaService) private prismaService: PrismaService,
    private uuidService: UUIDService,
  ) {}

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

  private generateFindUniqueQuery(
    id: PackageVoucherDomain['id'],
  ): Prisma.PackageVoucherFindUniqueArgs {
    return {
      include: {
        PackageImg: {
          where: {
            deletedAt: {
              equals: null,
            },
          },
        },
        PackageRewardVoucher: true,
        PackageVoucherTermAndCondEN: {
          where: {
            inactiveAt: {
              equals: null,
            },
          },
        },
        PackageVoucherTermAndCondTH: {
          where: {
            inactiveAt: {
              equals: null,
            },
          },
        },
      },
      where: { id },
    };
  }

  async createPackageVoucher({
    packageVoucherCreateInput,
    packageImage,
    packageRewardVoucher,
    packageVoucherTermAndCondTH,
    packageVoucherTermAndCondEN,
  }: {
    packageVoucherCreateInput: PackageVoucherCreateInput;
    packageImage: PackageImgCreateInput[];
    packageRewardVoucher: PackageRewardVoucherCreateInput[];
    packageVoucherTermAndCondTH: packageVoucherTermAndCondTHCreateInput[];
    packageVoucherTermAndCondEN: packageVoucherTermAndCondENCreateInput[];
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
          txUnit.packageVoucherTermAndCondTH.createMany({
            data: packageVoucherTermAndCondTH,
          }),
          txUnit.packageVoucherTermAndCondEN.createMany({
            data: packageVoucherTermAndCondEN,
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

  async findPackageVoucherById(
    id: PackageVoucherDomain['id'],
  ): Promise<NullAble<PackageVoucherDomain>> {
    const query = this.generateFindUniqueQuery(id);
    const packageVoucher = await this.prismaService.packageVoucher.findUnique({
      ...query,
    });
    return PackageVoucherMapper.toDomain(packageVoucher);
  }

  async updatePackageVoucher(
    payload: UpdatePackageVoucherDto,
  ): Promise<PackageVoucherDomain> {
    const { rewardVouchers, termAndCondTh, termAndCondEn, id, ...data } =
      payload;

    const updatedPackage = await this.prismaService.$transaction(async (tx) => {
      if (termAndCondTh && termAndCondTh.length > 0) {
        await this.upsertManyTermAndCond(tx, termAndCondTh, id, 'TH');
      }

      if (termAndCondEn && termAndCondEn.length > 0) {
        await this.upsertManyTermAndCond(tx, termAndCondEn, id, 'EN');
      }

      if (rewardVouchers && rewardVouchers.length > 0) {
        await this.upsertManyRewardVoucher(tx, rewardVouchers, id);
      }

      return tx.packageVoucher.update({
        data,
        where: { id },
      });
    });
    return PackageVoucherMapper.toDomain(updatedPackage);
  }

  async upsertManyTermAndCond(
    tx: Prisma.TransactionClient,
    data: TermAndCondUpdateDto[],
    packageId: PackageVoucher['id'],
    lang: 'TH' | 'EN',
  ): Promise<unknown> {
    const termAndCondInsertArr: Prisma.PackageVoucherTermAndCondTHCreateManyInput[] =
      [];
    const termAndCondUpdateArr: Array<{
      id: string; // primary key in your table, presumably
      data: Prisma.PackageVoucherTermAndCondTHUpdateInput;
    }> = [];

    // Process the data which can also be
    // the update or insert
    data.forEach((item) => {
      if (item.id && !item.description) {
        const { id, inactive, updatedDescription } = item;
        const data: Prisma.PackageVoucherTermAndCondTHUpdateInput = { id };
        if (inactive) {
          data.inactiveAt = new Date(Date.now());
        } else if (updatedDescription) {
          data.description = updatedDescription;
        }
        termAndCondUpdateArr.push({ id, data });
      } else {
        termAndCondInsertArr.push({
          description: item.description,
          packageVoucherId: packageId,
        });
      }
    });

    if (lang === 'TH') {
      if (termAndCondInsertArr.length > 0) {
        await tx.packageVoucherTermAndCondTH.createMany({
          data: termAndCondInsertArr,
        });
      }
      // 1. multiple updates if
      // there is the data for update
      if (termAndCondUpdateArr.length > 0) {
        for (const item of termAndCondUpdateArr) {
          await tx.packageVoucherTermAndCondTH.update({
            where: { id: item.id },
            data: item.data,
          });
        }
      }
    } else if (lang === 'EN') {
      if (termAndCondInsertArr.length > 0) {
        await tx.packageVoucherTermAndCondEN.createMany({
          data: termAndCondInsertArr,
        });
      }
      if (termAndCondUpdateArr.length > 0) {
        for (const item of termAndCondUpdateArr) {
          await tx.packageVoucherTermAndCondEN.update({
            where: { id: item.id },
            data: item.data,
          });
        }
      }
    }
    return;
  }

  async upsertManyRewardVoucher(
    tx: Prisma.TransactionClient,
    rewardVoucherDatas: UpdatePackageRewardVoucherDto[],
    packageId: PackageVoucherDomain['id'],
  ): Promise<unknown> {
    const rewardsArr: Prisma.PackageRewardVoucherCreateManyInput[] = [];
    const removeArr: Prisma.PackageRewardVoucherDeleteArgs[] = [];
    rewardVoucherDatas.forEach((item) => {
      if (item.removedVoucherId) {
        removeArr.push({ where: { id: item.removedVoucherId } });
      } else if (item.rewardVouchersId) {
        rewardsArr.push({
          id: String(this.uuidService.make()),
          packageId,
          rewardVoucherId: item.rewardVouchersId,
        });
      }
    });
    if (removeArr.length > 0) {
      removeArr.forEach(
        async (item) => await tx.packageRewardVoucher.delete(item),
      );
    } else if (rewardsArr.length > 0) {
      await tx.packageRewardVoucher.createMany({ data: rewardsArr });
    }
    return;
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
