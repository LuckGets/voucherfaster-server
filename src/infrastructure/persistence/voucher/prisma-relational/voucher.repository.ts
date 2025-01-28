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
import { DiscountStatus, Prisma, VoucherStatus } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { IPaginationOption } from 'src/common/types/pagination.type';
import { generatePaginationQueryOption } from '@utils/prisma/service';
import { VoucherMapper } from './voucher.mapper';
import { UpdateVoucherDto } from '@resources/voucher/dto/vouchers/update-voucher.dto';
import { VoucherDiscountCreateInput } from '@resources/voucher/domain/voucher-discount.domain';
import {
  PaginationDiscountQueryEnum,
  PaginationSellDateQueryEnum,
} from '@resources/voucher/dto/vouchers/get-voucher.dto';
import { CreateVoucherDto } from '@resources/voucher/dto/vouchers/create-voucher.dto';
import { isUUID } from 'class-validator';
import { ObjectHelper } from '@utils/services/object.helper';
import { CategoryDomain } from '@resources/category/domain/category.domain';
import { VoucherTagDomain } from '@resources/category/domain/tag.domain';

export class VoucherRelationalPrismaORMRepository implements VoucherRepository {
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}

  private activeDiscountIncludeQuery: Prisma.VoucherDiscountWhereInput = {
    deletedAt: {
      equals: null,
    },
    status: {
      equals: DiscountStatus.ACTIVE,
    },
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
    VoucherDiscount: {
      where: this.activeDiscountIncludeQuery,
    },
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
    VoucherDiscount: {
      where: this.activeDiscountIncludeQuery,
    },
  };

  private generateCategoryWhereQuery(
    category: CategoryDomain['id'] | CategoryDomain['name'],
  ): Prisma.VoucherWhereInput {
    if (!category) return {};

    if (isUUID(category)) {
      return {
        voucherTag: {
          category: {
            id: category,
          },
        },
      };
    } else {
      return {
        voucherTag: {
          category: {
            name: {
              contains: category,
              mode: 'insensitive',
            },
          },
        },
      };
    }
  }

  private generateSellDateWhereQuery(
    sellDate: PaginationSellDateQueryEnum,
  ): Prisma.VoucherWhereInput {
    const currentDate = new Date();
    switch (sellDate) {
      case PaginationSellDateQueryEnum.ALL:
        return {};
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
            is: {
              status: VoucherStatus.ACTIVE,
            },
          },
        };
      case PaginationDiscountQueryEnum.INACTIVE:
        return {
          VoucherDiscount: {
            is: {
              status: VoucherStatus.INACTIVE,
            },
          },
        };
      case PaginationDiscountQueryEnum.NONE:
        return {
          VoucherDiscount: null,
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
      VoucherDiscount: {
        create: voucherDiscount,
      },
      VoucherImg: {
        createMany: {
          data: image,
        },
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
    status: VoucherDomain['status'];
    sellDate: PaginationSellDateQueryEnum;
  }): Promise<VoucherDomain[]> {
    const paginatedQueryOptiion = generatePaginationQueryOption({
      cursor,
      paginationOption,
      sortOption,
    });
    const categoryWhereOption: Prisma.VoucherWhereInput =
      this.generateCategoryWhereQuery(category);
    let tagWhereOption: Prisma.VoucherWhereInput = {};

    if (tag)
      tagWhereOption = {
        voucherTag: {
          name: {
            contains: tag,
            mode: 'insensitive',
          },
        },
      };

    const discountQuery = this.generateDiscountWhereQuery(discount);

    // Prepare the variable
    // for using as prisma where query
    const whereQueryOption: Prisma.VoucherWhereInput = {
      AND: [
        { status },
        this.generateSellDateWhereQuery(sellDate),
        categoryWhereOption,
        tagWhereOption,
        discountQuery,
      ],
    };

    // Voucher Join query
    const voucherJoinQuery = this.voucherListJoinQuery;

    // If the request provide category query

    const voucherList = await this.prismaService.voucher.findMany({
      ...paginatedQueryOptiion,
      where: whereQueryOption,
      include: voucherJoinQuery,
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
      status: VoucherDomain['status'];
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

    const statusWhereQuery: Prisma.VoucherWhereInput = {
      status: status ?? VoucherStatus.ACTIVE,
    };

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

    const categoryWhereQuery: Prisma.VoucherWhereInput =
      this.generateCategoryWhereQuery(searchContent);
    const voucherList = await this.prismaService.voucher.findMany({
      ...paginationQueryOption,
      where: {
        OR: [voucherTitleWhereQuery, tagNameWhereQuery, categoryWhereQuery],
        AND: [statusWhereQuery, sellDateWhereQuery],
      },
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
      updateData.voucherTag = { update: { id: tagId } };
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
              data: { deletedAt: currentTime, status: DiscountStatus.ACTIVE },
            },
            create: {
              id: newId,
              discountedPrice,
              status: status ?? DiscountStatus.ACTIVE,
            },
          };
        } else {
          updateData.VoucherDiscount = {
            update: {
              where: { id: update.currentDiscountId },
              data: update,
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
