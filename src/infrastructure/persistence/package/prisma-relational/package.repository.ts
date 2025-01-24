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
import { ObjectHelper } from '@utils/services/object.helper';
import { VoucherCategoryDomain } from '@resources/voucher/domain/voucher.domain';
import {
  PackageSellDateQueryEnum,
  PackageStatusQueryEnum,
} from '@resources/package/dto/get-package.dto';

export class PackageVoucherRelationalPrismaORMRepository
  implements PackageVoucherRepository
{
  constructor(
    @Inject(PrismaService) private prismaService: PrismaService,
    private uuidService: UUIDService,
  ) {}

  private voucherCategoryInclude: Prisma.VoucherInclude = {
    voucherTag: {
      include: {
        voucherCategory: {
          select: { id: true, name: true },
        },
      },
    },
  };

  private rewardVoucherIncludeQuery: Prisma.PackageRewardVoucherInclude = {
    voucher: {
      include: {
        ...this.voucherCategoryInclude,
      },
    },
  };

  private detailIncludeQuery: Prisma.PackageVoucherInclude = {
    voucher: {
      include: {
        ...this.voucherCategoryInclude,
      },
    },
    PackageImg: true,
    PackageRewardVoucher: {
      include: {
        ...this.rewardVoucherIncludeQuery,
      },
    },
    PackageVoucherTermAndCondEN: {
      select: {
        id: true,
        description: true,
      },
      where: {
        inactiveAt: {
          equals: null,
        },
      },
    },
    PackageVoucherTermAndCondTH: {
      select: {
        id: true,
        description: true,
      },
      where: {
        inactiveAt: {
          equals: null,
        },
      },
    },
  };

  private findManyJoinQuery:
    | Prisma.PackageVoucherFindManyArgs
    | Prisma.PackageVoucherFindFirstArgs = {
    include: {
      voucher: {
        include: { ...this.voucherCategoryInclude },
      },
      PackageImg: { where: { mainImg: true } },
      PackageRewardVoucher: { include: { ...this.rewardVoucherIncludeQuery } },
    },
  };

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
      price,
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
        return txUnit.packageVoucher.findUnique({
          where: { id: packageVoucher.id },
          include: { ...this.detailIncludeQuery },
        });
      },
    );
    return PackageVoucherMapper.toDomain(createdPackageVoucher);
  }

  async findManyPackageVoucher({
    cursor,
    category,
    status,
    sellDate,
  }: {
    cursor?: PackageVoucherDomain['id'];
    category?: VoucherCategoryDomain['name'];
    status?: PackageStatusQueryEnum;
    sellDate?: PackageSellDateQueryEnum;
  }): Promise<PackageVoucherDomain[]> {
    // Grab the pagination query option
    const paginateQueryOption = generatePaginationQueryOption<
      PackageVoucherDomain['id']
    >({ cursor });
    const categoryWhereQuery: Prisma.PackageVoucherWhereInput =
      this.generateCategoryWhereQuery(category);
    // Set the today date for query.
    const sellDateQuery = this.generateSellDateWhereQuery(sellDate);

    const statusQuery = this.generateStatusWhereQuery(status);
    // Grab JOIN query
    const joinQuery = this.findManyJoinQuery;
    // Query the data in the database.
    const packageVoucherQueryList =
      await this.prismaService.packageVoucher.findMany({
        where: {
          deletedAt: {
            equals: null,
          },
          ...sellDateQuery,
          ...categoryWhereQuery,
          ...statusQuery,
        },
        ...paginateQueryOption,
        ...joinQuery,
      });
    return packageVoucherQueryList.map(PackageVoucherMapper.toDomain);
  }

  private generateCategoryWhereQuery(
    category: VoucherCategoryDomain['name'],
  ): Prisma.PackageVoucherWhereInput {
    return category
      ? {
          voucher: {
            voucherTag: {
              voucherCategory: {
                name: {
                  contains: category,
                  mode: 'insensitive',
                },
              },
            },
          },
        }
      : {};
  }

  private generateSellDateWhereQuery(
    sellDate: PackageSellDateQueryEnum,
  ): Prisma.PackageVoucherWhereInput {
    const currentDate: Date = new Date(Date.now());
    switch (sellDate) {
      case PackageSellDateQueryEnum.NOW:
        return {
          AND: [
            {
              sellStartedAt: {
                lte: currentDate,
              },
            },
            {
              sellExpiredAt: {
                gt: currentDate,
              },
            },
          ],
        };
      case PackageSellDateQueryEnum.ALL:
        return {};
      case PackageSellDateQueryEnum.EXPIRED:
        return {
          sellExpiredAt: {
            lte: currentDate,
          },
        };
      default:
        return {};
    }
  }

  private generateStatusWhereQuery(
    status: PackageStatusQueryEnum,
  ): Prisma.PackageVoucherWhereInput {
    switch (status) {
      case PackageStatusQueryEnum.ACTIVE:
        return {
          deletedAt: {
            equals: null,
          },
        };
      case PackageStatusQueryEnum.DELETED:
        return {
          deletedAt: {
            not: {
              equals: null,
            },
          },
        };
      default:
        return {};
    }
  }

  async findPackageVoucherById(
    id: PackageVoucherDomain['id'],
  ): Promise<NullAble<PackageVoucherDomain>> {
    const packageVoucher = await this.prismaService.packageVoucher.findUnique({
      where: {
        id,
      },
      include: {
        ...this.detailIncludeQuery,
      },
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

      if (!ObjectHelper.isObjectEmpty(rewardVouchers)) {
        await this.upsertManyRewardVoucher(tx, rewardVouchers, id);
      }

      return tx.packageVoucher.update({
        data,
        where: { id },
        include: {
          ...this.detailIncludeQuery,
        },
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
    rewardVoucherDatas: UpdatePackageRewardVoucherDto,
    packageId: PackageVoucherDomain['id'],
  ): Promise<unknown> {
    const rewardsArr: Prisma.PackageRewardVoucherCreateManyInput[] = [];
    const removeArr: Prisma.PackageRewardVoucherDeleteArgs[] = [];
    const updateArrPromise: Promise<unknown>[] = [];

    // Extract the data.
    const { addRewardVouchers, removedRewardIds, update } = rewardVoucherDatas;
    if (addRewardVouchers && addRewardVouchers.length > 0) {
      rewardVoucherDatas.addRewardVouchers.forEach((item) => {
        rewardsArr.push({
          id: String(this.uuidService.make()),
          packageId,
          rewardVoucherId: item.voucherId,
          amount: item.amount,
        });
      });
    }
    if (removedRewardIds && removedRewardIds.length > 0) {
      removedRewardIds.forEach((item) => {
        console.log(item);
        removeArr.push({
          where: {
            id: item,
          },
        });
      });
    }

    if (update && update.length > 0) {
      updateArrPromise.push(
        ...update.map((item) =>
          tx.packageRewardVoucher.update({
            where: { id: item.rewardId },
            data: { amount: item.amount },
          }),
        ),
      );
    }

    if (removeArr.length > 0) {
      removeArr.forEach(
        async (item) => await tx.packageRewardVoucher.delete(item),
      );
    }
    if (rewardsArr.length > 0) {
      await tx.packageRewardVoucher.createMany({ data: rewardsArr });
    }

    if (updateArrPromise.length > 0) {
      await Promise.all(updateArrPromise);
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
