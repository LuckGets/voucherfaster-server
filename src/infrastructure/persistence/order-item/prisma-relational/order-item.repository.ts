import {
  OrderItemDomain,
  OrderItemRedeemStatusEnum,
  OrderItemTypeEnum,
} from '@resources/order/domain/order-item.domain';
import { NullAble } from '@utils/types/common.type';
import { OrderItemRepository } from '../order-item.repository';
import { UpdateOrderItemDto } from '@resources/redeem/dto/update.dto';
import { PrismaService } from '../../config/prisma.service';
import { Prisma } from '@prisma/client';
import { OrderItemAndDetails, OrderItemMapper } from './order-item.mapper';
import { Inject } from '@nestjs/common';
import { VoucherCategoryDomain } from '@resources/voucher/domain/voucher.domain';
import { generatePaginationQueryOption } from '@utils/prisma/service';
import { ISortOption } from 'src/common/types/pagination.type';

export class OrderItemRelationPrismaORMRepository
  implements OrderItemRepository
{
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}

  private voucherIncludeQuery: Prisma.VoucherInclude = {
    VoucherImg: {
      where: {
        mainImg: true,
      },
    },
    voucherTag: {
      include: {
        voucherCategory: true,
      },
    },
  };

  private orderIncludeQuery: Prisma.OrderInclude = {
    usableDaysAfterPurchased: {
      select: {
        id: true,
        usableDays: true,
      },
    },
    Transaction: {
      include: {
        transactionSystem: {
          select: {
            id: true,
            system: true,
          },
        },
      },
    },
    account: {
      select: {
        id: true,
        role: true,
        email: true,
        fullname: true,
        phone: true,
        verifiedAt: true,
      },
    },
  };

  private orderItemVoucherIncludeQuery: Prisma.OrderItemVoucherInclude = {
    voucher: {
      include: this.voucherIncludeQuery,
    },
  };

  private orderItemPromotionIncludeQuery: Prisma.OrderItemPromotionInclude = {
    voucherPromotion: {
      include: {
        voucher: {
          include: this.voucherIncludeQuery,
        },
      },
    },
  };

  private orderItemPackageIncludeQuery: Prisma.OrderItemPackageInclude = {
    package: {
      include: {
        PackageRewardVoucher: {
          include: {
            voucher: {
              include: this.voucherIncludeQuery,
            },
          },
        },
        PackageImg: {
          where: {
            mainImg: true,
          },
        },
        voucher: {
          include: this.voucherIncludeQuery,
        },
      },
    },
  };

  private includeQuery: Prisma.OrderItemInclude = {
    OrderItemPackage: {
      include: this.orderItemPackageIncludeQuery,
    },
    OrderItemVoucher: {
      include: this.orderItemVoucherIncludeQuery,
    },
    OrderItemPromotion: {
      include: this.orderItemPromotionIncludeQuery,
    },
    order: {
      include: this.orderIncludeQuery,
    },
    RedeemOrderItem: {
      select: {
        id: true,
        updatedAt: true,
      },
    },
  };

  private categoryWhereQuery(
    category: VoucherCategoryDomain['name'],
  ): Prisma.VoucherWhereInput {
    if (!category) return {};
    return {
      voucherTag: {
        is: {
          voucherCategory: {
            name: {
              contains: category,
              mode: 'insensitive',
            },
          },
        },
      },
    };
  }

  private async generateFindCategoryWhereQuery(
    categoryName?: VoucherCategoryDomain['name'],
  ): Promise<Prisma.OrderItemWhereInput> {
    if (!categoryName) return {};
    const category = await this.prismaService.voucherCategory.findFirst({
      where: {
        name: {
          contains: categoryName,
          mode: 'insensitive',
        },
      },
      include: {
        VoucherTags: {
          include: {
            Voucher: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!category) return {};

    const allVoucherIds: string[] = category.VoucherTags.flatMap((voucherTag) =>
      voucherTag.Voucher.map((voucher) => voucher.id),
    );

    // If no voucher IDs, no need to filter
    if (allVoucherIds.length === 0) return {};

    return {
      OR: [
        {
          OrderItemPackage: {
            voucherId: { in: allVoucherIds },
          },
        },
        {
          OrderItemVoucher: {
            voucherId: { in: allVoucherIds },
          },
        },
        {
          OrderItemPromotion: {
            voucherPromotionId: { in: allVoucherIds },
          },
        },
      ],
    };
  }

  private generateFindStatusWhereQuery(
    status?: OrderItemRedeemStatusEnum,
  ): Prisma.OrderItemWhereInput {
    const currentDate = new Date();
    switch (status) {
      case OrderItemRedeemStatusEnum.REDEEMED:
        return {
          RedeemOrderItem: {
            some: {},
          },
        };
      case OrderItemRedeemStatusEnum.EXPIRED:
        return {
          OrderItemPackage: {
            package: {
              usableExpiredAt: {
                lte: currentDate,
              },
            },
          },
          OrderItemVoucher: {
            voucher: {
              usableExpiredAt: {
                lte: currentDate,
              },
            },
          },
          OrderItemPromotion: {
            voucherPromotion: {
              usableExpiredAt: {
                lte: currentDate,
              },
            },
          },
        };
      case OrderItemRedeemStatusEnum.REDEEMABLE:
        return {
          RedeemOrderItem: {
            none: {},
          },
        };
      default:
        return {};
    }
  }

  private generateFindTypeWhereQuery(
    type?: OrderItemTypeEnum,
  ): Prisma.OrderItemWhereInput {
    switch (type) {
      case OrderItemTypeEnum.VOUCHER:
        return {
          OrderItemVoucher: {
            isNot: null,
          },
        };
      case OrderItemTypeEnum.PROMOTION:
        return {
          OrderItemPromotion: {
            isNot: null,
          },
        };
      case OrderItemTypeEnum.PACKAGE:
        return {
          OrderItemPackage: {
            isNot: null,
          },
        };
      default:
        return {};
    }
  }

  async findById(
    id: OrderItemDomain['id'],
  ): Promise<NullAble<OrderItemDomain>> {
    const orderItem = await this.prismaService.orderItem.findUnique({
      where: {
        id,
      },
      include: this.includeQuery,
    });
    return OrderItemMapper.toDomain(orderItem as OrderItemAndDetails, {
      allInfo: true,
    });
  }

  async findManyExistingCode(
    codeList: OrderItemDomain['code'][],
  ): Promise<OrderItemDomain['code'][]> {
    const codeListObject = await this.prismaService.orderItem.findMany({
      where: {
        code: {
          in: codeList,
        },
      },
      select: {
        code: true,
      },
    });
    return codeListObject.map((item) => item.code);
  }

  async findMany({
    cursor,
    category,
    sortQuery,
    status,
    type,
  }: {
    cursor?: OrderItemDomain['id'];
    category?: VoucherCategoryDomain['name'];
    sortQuery?: ISortOption[];
    status?: OrderItemRedeemStatusEnum;
    type?: OrderItemTypeEnum;
  }): Promise<OrderItemDomain[]> {
    const paginationOption = generatePaginationQueryOption({
      cursor,
      sortOption: sortQuery,
    });

    let categoryQuery: Prisma.OrderItemWhereInput = {};

    if (category)
      categoryQuery = await this.generateFindCategoryWhereQuery(category);

    const allQuery = [
      categoryQuery,
      this.generateFindStatusWhereQuery(status),
      this.generateFindTypeWhereQuery(type),
    ];

    const orderItemsList = await this.prismaService.orderItem.findMany({
      ...paginationOption,
      where: {
        AND: allQuery,
      },
      include: this.includeQuery,
    });

    return orderItemsList.map((item) =>
      OrderItemMapper.toDomain(item as OrderItemAndDetails, { allInfo: false }),
    );
  }

  async transactionForUpdateMany(
    data: UpdateOrderItemDto[],
  ): Promise<OrderItemDomain[]> {
    const allUpdatedOrderItem = await this.prismaService.$transaction(
      (txUnit) => {
        return Promise.all(
          data.map((item) => {
            return txUnit.orderItem.update({
              where: {
                id: item.id,
              },
              data: {
                qrcodeImgPath: item.qrcodeImagePath,
              },
              include: this.includeQuery,
            });
          }),
        );
      },
    );

    return allUpdatedOrderItem.map((item) =>
      OrderItemMapper.toDomain(item as OrderItemAndDetails, { allInfo: true }),
    );
  }
  async update(data: UpdateOrderItemDto): Promise<OrderItemDomain> {
    const updatedOrderItem = await this.prismaService.orderItem.update({
      where: {
        id: data.id,
      },
      data,
      include: this.includeQuery,
    });
    return OrderItemMapper.toDomain(updatedOrderItem as OrderItemAndDetails, {
      allInfo: true,
    });
  }
}
