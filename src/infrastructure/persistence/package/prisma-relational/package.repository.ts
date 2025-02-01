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
  PackageRewardVoucherCreateInput,
  PackageVoucherDomain,
} from '@resources/package/domain/package-voucher.domain';
import { DiscountStatus, Prisma, VoucherStatus } from '@prisma/client';
import { PackageVoucherMapper } from './mapper/package.mapper';
import { generatePaginationQueryOption } from '@utils/prisma/service';
import { NullAble } from '@utils/types/common.type';
import { UpdatePackageRewardVoucherDto } from '@resources/package/dto/update-package.dto';
import { UUIDService } from '@utils/services/uuid.service';
import { ObjectHelper } from '@utils/services/object.helper';
import {
  PackageSellDateQueryEnum,
  PackageStatusQueryEnum,
} from '@resources/package/dto/get-package.dto';
import { CategoryDomain } from '@resources/category/domain/category.domain';

export class PackageVoucherRelationalPrismaORMRepository
  implements PackageVoucherRepository
{
  constructor(
    @Inject(PrismaService) private prismaService: PrismaService,
    private uuidService: UUIDService,
  ) {}

  private activeDiscountIncludeQuery: Prisma.PackageDiscountWhereInput = {
    deletedAt: {
      equals: null,
    },
    status: {
      equals: DiscountStatus.ACTIVE,
    },
  };

  private voucherCategoryInclude: Prisma.VoucherInclude = {
    voucherTag: {
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    },
  };

  private rewardVoucherIncludeQuery: Prisma.PackageRewardVoucherInclude = {
    voucher: {
      include: this.voucherCategoryInclude,
    },
  };

  private detailIncludeQuery: Prisma.PackageVoucherInclude = {
    voucher: {
      include: this.voucherCategoryInclude,
    },
    PackageImg: true,
    PackageRewardVoucher: {
      include: this.rewardVoucherIncludeQuery,
    },
    PackageDiscount: {
      where: this.activeDiscountIncludeQuery,
    },
  };

  private findManyJoinQuery: Prisma.PackageVoucherInclude = {
    voucher: {
      include: this.voucherCategoryInclude,
    },
    PackageImg: { where: { mainImg: true } },
    PackageRewardVoucher: { include: this.rewardVoucherIncludeQuery },
    PackageDiscount: { where: this.activeDiscountIncludeQuery },
  };

  private generateCategoryWhereQuery(
    category: CategoryDomain['name'],
  ): Prisma.PackageVoucherWhereInput {
    return category
      ? {
          voucher: {
            voucherTag: {
              category: {
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
          sellStartedAt: {
            lte: currentDate,
          },
          sellExpiredAt: {
            gt: currentDate,
          },
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
    const { quotaVoucherId, tagId, ...restPackageInfo } =
      packageVoucherCreateInput;

    const createPackageData: Prisma.PackageVoucherCreateInput = {
      ...restPackageInfo,
      voucherTag: { connect: { id: tagId } },
      voucher: { connect: { id: quotaVoucherId } },
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

    console.log('Package Discount in create repo', packageDiscount);

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
  }: {
    cursor?: PackageVoucherDomain['id'];
    category?: CategoryDomain['name'];
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

    const allWhereQuery: Prisma.PackageVoucherWhereInput = {
      AND: [categoryWhereQuery, statusQuery, sellDateQuery],
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
    const { rewardVouchers, discount, id, ...data } = payload;

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
      if (!ObjectHelper.isObjectEmpty(rewardVouchers)) {
        await this.upsertManyRewardVoucher(tx, rewardVouchers, id);
      }

      return tx.packageVoucher.update({
        data,
        where: { id },
        include: this.detailIncludeQuery,
      });
    });
    return PackageVoucherMapper.toDomain(updatedPackage, { allInfo: true });
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
    await this.prismaService.packageVoucher.update({
      where: { id },
      data: { status: VoucherStatus.INACTIVE },
    });
    return;
  }
}
