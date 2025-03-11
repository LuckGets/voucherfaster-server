import { Inject } from '@nestjs/common';
import {
  PackageVoucherCreateInput,
  PackageVoucherDiscountNestedCreateInput,
  PackageVoucherRepository,
  UpdatePackageVoucherRepositoryInput,
} from '../package.repository';
import { PrismaService } from '../../config/prisma.service';
import {
  PackageImgCreateInput,
  PackageQuotaVoucherDomain,
  PackageRewardVoucherCreateInput,
  PackageRewardVoucherDomain,
  PackageVoucherDomain,
} from '@resources/package/domain/package-voucher.domain';
import { DiscountStatus, Prisma, VoucherStatus } from '@prisma/client';
import { PackageVoucherMapper } from './mapper/package.mapper';
import { generatePaginationQueryOption } from '@utils/prisma/service';
import { NullAble } from '@utils/types/common.type';
import { UUIDService } from '@utils/services/uuid.service';
import { ObjectHelper } from '@utils/services/object.helper';
import {
  PackageDiscountQueryEnum,
  PackageSellDateQueryEnum,
  PackageStatusQueryEnum,
} from '@resources/package/dto/get-package.dto';
import { CategoryDomain } from '@resources/category/domain/category.domain';
import { VoucherTagDomain } from '@resources/category/domain/tag.domain';
import { isUUID } from 'class-validator';
import { AddNewPackageQuotaVoucherDto } from '@resources/package/dto/quota/add-quota.dto';
import { PackageQuotaVoucherMapper } from './mapper/package-quota.mapper';
import { UpdateQuotaVoucherDto } from '@resources/package/dto/quota/update-quota.dto';
import { AddNewPackageRewardVoucherDto } from '@resources/package/dto/reward/add-reward.dto';
import { PackageRewardMapper } from './mapper/package-reward.mapper';
import { UpdateRewardVoucherDto } from '@resources/package/dto/reward/update-reward.dto';
import { NIL } from 'uuid';

export class PackageVoucherRelationalPrismaORMRepository
  implements PackageVoucherRepository
{
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}

  private currentlyDiscountIncludeQuery: Prisma.PackageVoucher$PackageDiscountArgs =
    {
      orderBy: {
        createdAt: 'desc',
      },
      take: 1,
    };

  private voucherTagAndCategoryInclude: Prisma.VoucherTagInclude = {
    category: {
      select: { id: true, name: true },
    },
  };

  private packageQuotaIncludeQuery: Prisma.PackageVoucherInclude = {
    PackageQuotaVoucher: {
      where: {
        deletedAt: {
          equals: null,
        },
      },
    },
  };

  private packageRewardIncludeQuery: Prisma.PackageVoucherInclude = {
    PackageRewardVoucher: {
      where: {
        deletedAt: {
          equals: null,
        },
      },
    },
  };

  private detailIncludeQuery: Prisma.PackageVoucherInclude = {
    voucherTag: {
      include: this.voucherTagAndCategoryInclude,
    },
    PackageQuotaVoucher: true,
    PackageImg: true,
    ...this.packageQuotaIncludeQuery,
    ...this.packageRewardIncludeQuery,
    PackageDiscount: this.currentlyDiscountIncludeQuery,
  };

  private findManyJoinQuery: Prisma.PackageVoucherInclude = {
    voucherTag: {
      include: this.voucherTagAndCategoryInclude,
    },
    ...this.packageQuotaIncludeQuery,
    ...this.packageRewardIncludeQuery,
    PackageImg: { where: { mainImg: true } },
    PackageDiscount: this.currentlyDiscountIncludeQuery,
  };

  private generateCategoryOrTagWhereQuery(
    category: CategoryDomain['name'],
    tag?: VoucherTagDomain['id'],
  ): Prisma.PackageVoucherWhereInput {
    const baseQuery: Prisma.PackageVoucherWhereInput = {};

    if (!category && !tag) return {};

    if (tag) {
      baseQuery.voucherTag = {
        id: tag,
      };
      return baseQuery;
    }

    if (isUUID(category)) {
      baseQuery.voucherTag = {
        category: {
          id: category,
        },
      };
    } else {
      baseQuery.voucherTag = {
        category: {
          name: {
            contains: category,
            mode: 'insensitive',
          },
        },
      };
    }

    return baseQuery;
  }

  private generateSellDateWhereQuery(
    sellDate: PackageSellDateQueryEnum,
  ): Prisma.PackageVoucherWhereInput {
    const currentDate: Date = new Date(Date.now());
    switch (sellDate) {
      case PackageSellDateQueryEnum.NOW:
        return {
          sellStartedAt: {
            lte: currentDate,
          },
          sellExpiredAt: {
            gt: currentDate,
          },
        };
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
          status: {
            equals: VoucherStatus.ACTIVE,
          },
        };
      case PackageStatusQueryEnum.INACTIVE:
        return {
          status: {
            equals: VoucherStatus.INACTIVE,
          },
        };
      default:
        return {};
    }
  }

  private generateDiscoutWhereQuery(
    discount: PackageDiscountQueryEnum,
  ): Prisma.PackageVoucherWhereInput {
    switch (discount) {
      case PackageDiscountQueryEnum.ACTIVE:
        return {
          PackageDiscount: {
            some: {
              status: DiscountStatus.ACTIVE,
              deletedAt: {
                equals: null,
              },
            },
          },
        };
      case PackageDiscountQueryEnum.INACTIVE:
        return {
          PackageDiscount: {
            some: {
              status: DiscountStatus.INACTIVE,
              deletedAt: {
                equals: null,
              },
            },
          },
        };
      case PackageDiscountQueryEnum.NONE:
        return {
          PackageDiscount: {
            none: {},
          },
        };
      default:
        return {};
    }
  }

  async createPackageVoucher({
    packageVoucherCreateInput,
    packageDiscount,
    packageImage,
    packageRewardVoucher,
  }: {
    packageVoucherCreateInput: PackageVoucherCreateInput;
    packageDiscount: PackageVoucherDiscountNestedCreateInput;
    packageImage: PackageImgCreateInput[];
    packageRewardVoucher: PackageRewardVoucherCreateInput[];
  }): Promise<PackageVoucherDomain> {
    const { quotaVouchers, tagId, ...restPackageInfo } =
      packageVoucherCreateInput;

    const createPackageData: Prisma.PackageVoucherCreateInput = {
      ...restPackageInfo,
      voucherTag: { connect: { id: tagId } },
      PackageQuotaVoucher: {
        createMany: {
          data: quotaVouchers.map((item) => ({
            quotaVoucherId: item.voucherId,
            amount: item.amount,
          })),
        },
      },
      PackageImg: {
        createMany: {
          data: packageImage.map((item) => ({
            id: item.id,
            imgPath: item.imgPath,
            mainImg: item.mainImg,
          })),
        },
      },
      PackageRewardVoucher: {
        createMany: {
          data: packageRewardVoucher.map((item) => ({
            id: item.id,
            amount: item.amount,
            rewardVoucherId: item.rewardVoucherId,
            img: item.img ?? null,
          })),
        },
      },
    };

    if (!ObjectHelper.isObjectEmpty(packageDiscount))
      createPackageData.PackageDiscount = {
        create: {
          id: packageDiscount.id,
          discountedPrice: packageDiscount.discountedPrice,
        },
      };

    const createdVoucher = await this.prismaService.$transaction(
      async (txUnit) => {
        return txUnit.packageVoucher.create({
          data: createPackageData,
          include: this.detailIncludeQuery,
        });
      },
    );
    return PackageVoucherMapper.toDomain(createdVoucher, { allInfo: true });
  }

  async findManyPackageVoucher({
    cursor,
    category,
    status,
    sellDate,
    tag,
    discount,
  }: {
    cursor?: PackageVoucherDomain['id'];
    category?: CategoryDomain['name'];
    status?: PackageStatusQueryEnum;
    sellDate?: PackageSellDateQueryEnum;
    tag?: VoucherTagDomain['id'];
    discount?: PackageDiscountQueryEnum;
  }): Promise<PackageVoucherDomain[]> {
    // Grab the pagination query option
    const paginateQueryOption = generatePaginationQueryOption<
      PackageVoucherDomain['id']
    >({ cursor });
    const categoryWhereQuery: Prisma.PackageVoucherWhereInput =
      this.generateCategoryOrTagWhereQuery(category, tag);

    // Set the today date for query.
    const sellDateQuery = this.generateSellDateWhereQuery(sellDate);

    const statusQuery = this.generateStatusWhereQuery(status);

    const discountQuery = this.generateDiscoutWhereQuery(discount);

    const allWhereQuery: Prisma.PackageVoucherWhereInput = {
      AND: [
        categoryWhereQuery,
        sellDateQuery,
        statusQuery,
        discountQuery,
      ].filter((item) => ObjectHelper.isObjectEmpty(item) === false),
    };

    const packageVoucherQueryList =
      await this.prismaService.packageVoucher.findMany({
        where: allWhereQuery,
        include: this.findManyJoinQuery,
        ...paginateQueryOption,
      });

    return packageVoucherQueryList.map((item) =>
      PackageVoucherMapper.toDomain(item, { allInfo: false }),
    );
  }

  async findPackageVoucherById(
    id: PackageVoucherDomain['id'],
  ): Promise<NullAble<PackageVoucherDomain>> {
    const packageVoucher = await this.prismaService.packageVoucher.findUnique({
      where: {
        id,
      },
      include: this.detailIncludeQuery,
    });
    return PackageVoucherMapper.toDomain(packageVoucher, { allInfo: true });
  }

  async updatePackageVoucher(
    payload: UpdatePackageVoucherRepositoryInput,
  ): Promise<PackageVoucherDomain> {
    const { discount, id, ...data } = payload;

    const updateData: Prisma.PackageVoucherUpdateInput = data;

    if (!ObjectHelper.isObjectEmpty(discount)) {
      const { create, update } = discount;
      if (!ObjectHelper.isObjectEmpty(create)) {
        updateData.PackageDiscount = { create };
      } else if (!ObjectHelper.isObjectEmpty(update)) {
        const { currentDiscountId, discountedPrice } = update;
        if (update.discountedPrice) {
          const currentTime = new Date();
          updateData.PackageDiscount = {
            update: {
              where: { id: currentDiscountId },
              data: { deletedAt: currentTime, status: DiscountStatus.INACTIVE },
            },
            create: {
              id: update.newId,
              discountedPrice,
              status: update.status ?? DiscountStatus.ACTIVE,
            },
          };
        } else {
          updateData.PackageDiscount = {
            update: {
              where: { id: currentDiscountId },
              data: update,
            },
          };
        }
      }
    }

    const updatedPackage = await this.prismaService.$transaction(async (tx) => {
      return tx.packageVoucher.update({
        data,
        where: { id },
        include: this.detailIncludeQuery,
      });
    });
    return PackageVoucherMapper.toDomain(updatedPackage, { allInfo: true });
  }

  async deletePackageVoucherById(
    id: PackageVoucherDomain['id'],
  ): Promise<void> {
    await this.prismaService.packageVoucher.update({
      where: { id },
      data: { status: VoucherStatus.INACTIVE },
    });
    return;
  }

  // -------------------------------------------------------------------- //
  // ------------------------- PACKAGE QUOTA PART ----------------------- //
  // -------------------------------------------------------------------- //

  private includePackageForQuotaQuery: Prisma.PackageQuotaVoucherInclude = {
    package: {
      include: this.detailIncludeQuery,
    },
  };

  private includePackageForRewardQuery: Prisma.PackageRewardVoucherInclude = {
    package: {
      include: this.detailIncludeQuery,
    },
  };

  async addNewQuotaVoucher(
    payload: AddNewPackageQuotaVoucherDto,
  ): Promise<PackageVoucherDomain> {
    const newQuotaVoucher = await this.prismaService.packageQuotaVoucher.create(
      {
        data: {
          amount: payload.amount,
          voucher: { connect: { id: payload.voucherId } },
          package: { connect: { id: payload.packageId } },
        },
        include: this.includePackageForQuotaQuery,
      },
    );
    return PackageQuotaVoucherMapper.toPackageDomain(newQuotaVoucher);
  }

  async findQuotaById(
    id: PackageQuotaVoucherDomain['id'],
  ): Promise<PackageQuotaVoucherDomain> {
    const quota = await this.prismaService.packageQuotaVoucher.findUnique({
      where: { id },
    });
    return PackageQuotaVoucherMapper.toDomain(quota);
  }

  async updateQuotaVoucher(
    payload: UpdateQuotaVoucherDto,
  ): Promise<PackageVoucherDomain> {
    const { quotaId, updateAmount, updateVoucherId } = payload;

    const updateData: Prisma.PackageQuotaVoucherUpdateInput = {};
    if (updateVoucherId) {
      updateData.voucher = { connect: { id: updateVoucherId } };
    }

    if (updateAmount) updateData.amount = updateAmount;

    const updatedQuota = await this.prismaService.packageQuotaVoucher.update({
      where: { id: quotaId },
      data: updateData,
      include: this.includePackageForQuotaQuery,
    });

    return PackageQuotaVoucherMapper.toPackageDomain(updatedQuota);
  }

  async deleteQuotaVoucher(
    quotaId: PackageQuotaVoucherDomain['id'],
  ): Promise<void> {
    await this.prismaService.packageQuotaVoucher.update({
      where: { id: quotaId },
      data: {
        deletedAt: new Date(Date.now()),
      },
    });
  }

  // -------------------------------------------------------------------- //
  // ------------------------- PACKAGE REWARD PART ---------------------- //
  // -------------------------------------------------------------------- //

  async addNewRewardVoucher(
    payload: AddNewPackageRewardVoucherDto,
  ): Promise<PackageVoucherDomain> {
    const newRewardVoucher =
      await this.prismaService.packageRewardVoucher.create({
        data: {
          amount: payload.amount,
          voucher: { connect: { id: payload.voucherId } },
          package: { connect: { id: payload.packageId } },
        },
        include: this.includePackageForRewardQuery,
      });

    return PackageRewardMapper.toPackageDomain(newRewardVoucher);
  }

  async findRewardById(
    id: PackageRewardVoucherDomain['id'],
  ): Promise<NullAble<PackageRewardVoucherDomain>> {
    const reward = await this.prismaService.packageRewardVoucher.findUnique({
      where: { id },
    });

    return PackageRewardMapper.toDomain(reward);
  }

  async updateRewardVoucher(
    payload: UpdateRewardVoucherDto,
  ): Promise<PackageVoucherDomain> {
    const { rewardId, updateAmount, updateVoucherId } = payload;
    const updateData: Prisma.PackageRewardVoucherUpdateInput = {};

    if (updateVoucherId) {
      updateData.voucher = { connect: { id: updateVoucherId } };
    }

    if (updateAmount) updateData.amount = updateAmount;

    const updatedReward = await this.prismaService.packageRewardVoucher.update({
      where: { id: rewardId },
      data: updateData,
      include: this.includePackageForRewardQuery,
    });

    return PackageRewardMapper.toPackageDomain(updatedReward);
  }

  async deleteRewardVoucher(
    id: PackageRewardVoucherDomain['id'],
  ): Promise<void> {
    await this.prismaService.packageRewardVoucher.update({
      where: { id },
      data: {
        deletedAt: new Date(Date.now()),
      },
    });
  }
  return;
}
