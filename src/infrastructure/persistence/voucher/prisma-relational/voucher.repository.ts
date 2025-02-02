import {
  VoucherDomain,
  VoucherImgCreateInput,
} from '@resources/voucher/domain/voucher.domain';
import { NullAble } from '@utils/types/common.type';
import { PrismaService } from '../../config/prisma.service';
import {
  UpdateVoucherRepositoryInput,
  VoucherRepository,
} from '../voucher.repository';
import {
  DiscountStatus,
  Prisma,
  VoucherStatus,
  VoucherTag,
} from '@prisma/client';
import { Inject } from '@nestjs/common';
import { IPaginationOption } from 'src/common/types/pagination.type';
import { generatePaginationQueryOption } from '@utils/prisma/service';
import { VoucherMapper } from './voucher.mapper';
import {
  VoucherDiscountCreateInput,
  VoucherDiscountDomain,
  VoucherDiscountStatusEnum,
} from '@resources/voucher/domain/voucher-discount.domain';
import {
  PaginationDiscountQueryEnum,
  PaginationSellDateQueryEnum,
  PaginationStatusQueryEnum,
} from '@resources/voucher/dto/vouchers/get-voucher.dto';
import { CreateVoucherDto } from '@resources/voucher/dto/vouchers/create-voucher.dto';
import { isUUID } from 'class-validator';
import { ObjectHelper } from '@utils/services/object.helper';
import { CategoryDomain } from '@resources/category/domain/category.domain';
import { VoucherTagDomain } from '@resources/category/domain/tag.domain';

export class VoucherRelationalPrismaORMRepository implements VoucherRepository {
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}

  private currentlyDiscountIncludeQuery: Prisma.Voucher$VoucherDiscountArgs = {
    orderBy: {
      createdAt: 'desc',
    },
    take: 1,
  };

  private tagAndCategoryIncludeQuery: Prisma.VoucherInclude = {
    voucherTag: {
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    },
  };

  private voucherListJoinQuery: Prisma.VoucherInclude = {
    VoucherImg: {
      where: {
        mainImg: true,
      },
      select: {
        id: true,
        imgPath: true,
      },
    },
    VoucherDiscount: this.currentlyDiscountIncludeQuery,
    ...this.tagAndCategoryIncludeQuery,
  };

  private voucherAllDetailJoinQuery: Prisma.VoucherInclude = {
    ...this.tagAndCategoryIncludeQuery,
    VoucherImg: {
      select: {
        id: true,
        imgPath: true,
        mainImg: true,
      },
    },
    VoucherDiscount: this.currentlyDiscountIncludeQuery,
  };

  private generateCategoryOrTagWhereQuery(
    category: CategoryDomain['id'] | CategoryDomain['name'],
    tag?: VoucherTagDomain['id'],
  ): Prisma.VoucherWhereInput {
    if (!category && !tag) return {};

    const baseQuery: Prisma.VoucherWhereInput = {};

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
    sellDate: PaginationSellDateQueryEnum,
  ): Prisma.VoucherWhereInput {
    const currentDate = new Date();
    switch (sellDate) {
      case PaginationSellDateQueryEnum.NOW:
        return {
          AND: [
            {
              sellStartedAt: {
                lte: currentDate,
              },
              sellExpiredAt: {
                gt: currentDate,
              },
            },
          ],
        };
      case PaginationSellDateQueryEnum.EXPIRED:
        return {
          sellExpiredAt: {
            lte: currentDate,
          },
        };
      default:
        return {};
    }
  }

  private generateDiscountWhereQuery(
    discount: PaginationDiscountQueryEnum,
  ): Prisma.VoucherWhereInput {
    switch (discount) {
      case PaginationDiscountQueryEnum.ACTIVE:
        return {
          VoucherDiscount: {
            some: {
              status: VoucherStatus.ACTIVE,
              deletedAt: {
                equals: null,
              },
            },
          },
        };
      case PaginationDiscountQueryEnum.INACTIVE:
        return {
          VoucherDiscount: {
            some: {
              status: VoucherStatus.INACTIVE,
              deletedAt: {
                equals: null,
              },
            },
          },
        };
      case PaginationDiscountQueryEnum.NONE:
        return {
          VoucherDiscount: {
            none: {},
          },
        };
      default:
        return {};
    }
  }

  private generateStatusWhereQuery(
    status: PaginationStatusQueryEnum,
  ): Prisma.VoucherWhereInput {
    switch (status) {
      case PaginationStatusQueryEnum.ACTIVE:
        return {
          status: VoucherStatus.ACTIVE,
        };
      case PaginationStatusQueryEnum.INACTIVE:
        return {
          status: VoucherStatus.INACTIVE,
        };
      default:
        return {};
    }
  }

  /**
   * We need to
   * creating a voucher
   * term and condition
   * and store the voucher-related image
   * in one transaction
   */
  async createVoucherAndTermAndImgAndPromotionTransaction({
    voucherData,
    image,
    voucherDiscount,
  }: {
    voucherData: CreateVoucherDto;
    image: VoucherImgCreateInput[];
    voucherDiscount?: VoucherDiscountCreateInput;
  }): Promise<VoucherDomain> {
    const { tagId, discountedPrice, ...data } = voucherData;
    const createVoucherData: Prisma.VoucherCreateInput = {
      ...data,
      voucherTag: {
        connect: {
          id: tagId,
        },
      },
      VoucherImg: {
        createMany: {
          data: image.map((item) => ({
            imgPath: item.imgPath,
            mainImg: item.mainImg,
          })),
        },
      },
    };

    if (voucherDiscount)
      createVoucherData.VoucherDiscount = {
        create: {
          id: voucherDiscount.id,
          discountedPrice: voucherDiscount.discountedPrice,
        },
      };
    const createdVoucher = await this.prismaService.$transaction(
      async (txUnit) => {
        return txUnit.voucher.create({
          data: createVoucherData,
          include: this.voucherAllDetailJoinQuery,
        });
      },
    );
    return VoucherMapper.toDomain(createdVoucher, { allInfo: true });
  }

  async findById(id: VoucherDomain['id']): Promise<NullAble<VoucherDomain>> {
    const voucher = await this.prismaService.voucher.findUnique({
      where: {
        id,
      },
      include: this.voucherAllDetailJoinQuery,
    });
    return VoucherMapper.toDomain(voucher, { allInfo: true });
  }

  async findByIds(idList: VoucherDomain['id'][]): Promise<VoucherDomain[]> {
    const voucherList = await this.prismaService.voucher.findMany({
      where: {
        id: { in: idList },
      },
      include: this.voucherAllDetailJoinQuery,
    });
    return voucherList.map((item) =>
      VoucherMapper.toDomain(item, { allInfo: false }),
    );
  }

  async findMany({
    tag,
    category,
    paginationOption,
    cursor,
    sortOption,
    discount,
    status,
    sellDate,
  }: {
    tag?: VoucherTagDomain['id'];
    category?: CategoryDomain['name'] | CategoryDomain['id'];
    paginationOption?: IPaginationOption;
    cursor?: VoucherDomain['id'];
    discount: PaginationDiscountQueryEnum;
    sortOption?: any;
    status?: PaginationStatusQueryEnum;
    sellDate?: PaginationSellDateQueryEnum;
  }): Promise<VoucherDomain[]> {
    const paginatedQueryOptiion = generatePaginationQueryOption({
      cursor,
      paginationOption,
      sortOption,
    });
    const categoryOrTagWhereOption: Prisma.VoucherWhereInput =
      this.generateCategoryOrTagWhereQuery(category, tag);
    const tagWhereOption: Prisma.VoucherWhereInput = {};

    const discountQuery = this.generateDiscountWhereQuery(discount);
    const statusQuery = this.generateStatusWhereQuery(status);

    // Prepare the variable
    // for using as prisma where query
    const whereQueryOption: Prisma.VoucherWhereInput = {
      AND: [
        statusQuery,
        this.generateSellDateWhereQuery(sellDate),
        categoryOrTagWhereOption,
        tagWhereOption,
        discountQuery,
      ],
    };

    // Voucher Join query

    // If the request provide category query

    const voucherList = await this.prismaService.voucher.findMany({
      ...paginatedQueryOptiion,
      where: whereQueryOption,
      include: this.voucherListJoinQuery,
    });

    return voucherList.map((item) =>
      VoucherMapper.toDomain(item, { allInfo: false }),
    );
  }

  async findBySearchContent(
    searchContent: string,
    {
      sellDate,
      status,
      cursor,
    }: {
      sellDate: PaginationSellDateQueryEnum;
      status: PaginationStatusQueryEnum;
      cursor: VoucherDomain['id'];
    },
  ): Promise<VoucherDomain[]> {
    const paginationQueryOption = generatePaginationQueryOption({
      cursor,
    });

    let sellDateWhereQuery: Prisma.VoucherWhereInput = {};
    if (sellDate) {
      sellDateWhereQuery = this.generateSellDateWhereQuery(sellDate);
    }

    const statusWhereQuery: Prisma.VoucherWhereInput =
      this.generateStatusWhereQuery(status);
    const voucherTitleWhereQuery: Prisma.VoucherWhereInput = {
      title: {
        contains: searchContent,
        mode: 'insensitive',
      },
    };

    const tagNameWhereQuery: Prisma.VoucherWhereInput = {
      voucherTag: {
        name: {
          contains: searchContent,
          mode: 'insensitive',
        },
      },
    };

    const categoryWhereQuery: Prisma.VoucherWhereInput = {
      voucherTag: {
        category: {
          name: {
            contains: searchContent,
            mode: 'insensitive',
          },
        },
      },
    };

    const voucherList = await this.prismaService.voucher.findMany({
      ...paginationQueryOption,
      where: {
        AND: [
          {
            OR: [voucherTitleWhereQuery, tagNameWhereQuery, categoryWhereQuery],
          },
          statusWhereQuery,
          sellDateWhereQuery,
        ],
      },
      include: this.voucherAllDetailJoinQuery,
    });

    return voucherList.map((item) =>
      VoucherMapper.toDomain(item, { allInfo: false }),
    );
  }

  /**
   *
   * @param payload
   * @returns VoucherDomain
   * Service for updating voucher information in database
   */
  async update(payload: UpdateVoucherRepositoryInput): Promise<VoucherDomain> {
    // Extract term and condition which need to
    // update in another table
    const { id, discount, tagId, ...data } = payload;

    const updateData: Prisma.VoucherUpdateInput = data;

    if (tagId && isUUID(tagId)) {
      updateData.voucherTag = { connect: { id: tagId } };
    }

    if (!ObjectHelper.isObjectEmpty(discount)) {
      const { create, update } = discount;

      if (!ObjectHelper.isObjectEmpty(create)) {
        updateData.VoucherDiscount = { create };
      } else if (!ObjectHelper.isObjectEmpty(update)) {
        if (update.discountedPrice) {
          const currentTime = new Date();
          const { newId, currentDiscountId, discountedPrice, status } = update;
          updateData.VoucherDiscount = {
            update: {
              where: { id: currentDiscountId },
              data: { deletedAt: currentTime, status: DiscountStatus.INACTIVE },
            },
            create: {
              id: newId,
              discountedPrice,
              status: status ?? DiscountStatus.ACTIVE,
            },
          };
        } else {
          const { currentDiscountId, discountedPrice, newId, ...data } = update;
          updateData.VoucherDiscount = {
            update: {
              where: { id: currentDiscountId },
              data: data,
            },
          };
        }
      }
    }

    const updatedVoucher = await this.prismaService.$transaction(
      async (txUnit) => {
        return txUnit.voucher.update({
          where: { id },
          data: updateData,
          include: this.voucherAllDetailJoinQuery,
        });
      },
    );

    return VoucherMapper.toDomain(updatedVoucher, { allInfo: true });
  }
}
