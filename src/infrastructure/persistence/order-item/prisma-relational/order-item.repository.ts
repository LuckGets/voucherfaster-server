import {
  ORDER_ITEM_SORT_MAP_TO_DB,
  OrderItemDomain,
  OrderItemRedeemStatusEnum,
  OrderItemSortEnum,
  OrderItemTypeEnum,
} from '@resources/order-item/domain/order-item.domain';
import { NullAble } from '@utils/types/common.type';
import { OrderItemRepository } from '../order-item.repository';
import { UpdateOrderItemDto } from '@resources/redeem/dto/update.dto';
import { PrismaService } from '../../config/prisma.service';
import { Prisma } from '@prisma/client';
// const { getRedeemAbleOrderItem } = require('@prisma/client/sql');
import { getRedeemAbleOrderItemRawQuery } from '../../../../utils/prisma/getRedeemAbleOrderItemQuery';
import { OrderItemAndDetails, OrderItemMapper } from './order-item.mapper';
import { Inject } from '@nestjs/common';
import { generatePaginationQueryOption } from '@utils/prisma/service';
import { ISortOption } from 'src/common/types/pagination.type';
import { TransactionStatusEnum } from '@resources/transaction/domain/transaction.domain';
import { CategoryDomain } from '@resources/category/domain/category.domain';

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
        category: true,
      },
    },
  };

  private orderIncludeQuery: Prisma.OrderInclude = {
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
    VoucherDiscount: true,
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
    PackageDiscount: true,
  };

  private includeQuery: Prisma.OrderItemInclude = {
    OrderItemPackage: {
      include: this.orderItemPackageIncludeQuery,
    },
    OrderItemVoucher: {
      include: this.orderItemVoucherIncludeQuery,
    },
    order: {
      include: this.orderIncludeQuery,
    },
    RedeemOrderItem: {
      where: {
        deletedAt: {
          equals: null,
        },
      },
      select: {
        id: true,
        updatedAt: true,
      },
    },
  };

  private sucessOrderWhereQuery: Prisma.OrderItemWhereInput = {
    order: {
      Transaction: {
        status: {
          equals: TransactionStatusEnum.SUCCESS,
        },
      },
    },
  };

  private generatedSortQuery(
    sortOption: ISortOption[],
  ): Prisma.OrderItemOrderByWithRelationInput {
    if (!sortOption || sortOption.length === 0) return {};

    return sortOption.reduce<Prisma.OrderItemOrderByWithRelationInput>(
      (acc, { field, direction }) => {
        switch (field) {
          case ORDER_ITEM_SORT_MAP_TO_DB[OrderItemSortEnum.CREATED_AT]:
            acc = {
              ...acc,
              order: {
                createdAt: direction,
              },
            };
            return acc;
          case ORDER_ITEM_SORT_MAP_TO_DB[OrderItemSortEnum.EXPIRED_AT]:
            acc = {
              ...acc,
              OrderItemPackage: {
                package: {
                  usableExpiredAt: direction,
                },
              },
              OrderItemVoucher: {
                voucher: {
                  usableExpiredAt: direction,
                },
              },
            };
            return acc;
          case ORDER_ITEM_SORT_MAP_TO_DB[OrderItemSortEnum.CODE]:
            acc = {
              ...acc,
              code: direction,
            };
            return acc;
          case ORDER_ITEM_SORT_MAP_TO_DB[OrderItemSortEnum.FULLNAME]:
            acc = {
              ...acc,
              order: {
                account: {
                  fullname: direction,
                },
              },
            };

            return acc;
          case ORDER_ITEM_SORT_MAP_TO_DB[OrderItemSortEnum.EMAIL]:
            acc = {
              ...acc,
              order: {
                account: {
                  email: direction,
                },
              },
            };
            return acc;
        }
      },
      {},
    );
  }

  private async generateFindCategoryWhereQuery(
    categoryName?: CategoryDomain['name'],
  ): Promise<Prisma.OrderItemWhereInput> {
    if (!categoryName) return {};
    const category = await this.prismaService.category.findFirst({
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
      ],
    };
  }

  private async generateFindStatusWhereQuery(
    status?: OrderItemRedeemStatusEnum,
  ): Promise<Prisma.OrderItemWhereInput> {
    const currentDate = new Date();
    switch (status) {
      case OrderItemRedeemStatusEnum.REDEEMED:
        return {
          ...this.sucessOrderWhereQuery,
          RedeemOrderItem: {
            some: {},
          },
        };
      case OrderItemRedeemStatusEnum.EXPIRED:
        return {
          ...this.sucessOrderWhereQuery,
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
        };
      case OrderItemRedeemStatusEnum.REDEEMABLE:
        const allRedeemAbleOrderItem: {
          order_item_id: OrderItemDomain['id'];
        }[] = await this.prismaService.$queryRawUnsafe(
          getRedeemAbleOrderItemRawQuery,
        );
        console.log('testQuery', allRedeemAbleOrderItem);
        return {
          AND: [
            {
              RedeemOrderItem: {
                none: {},
              },
            },
            {
              id: {
                in: allRedeemAbleOrderItem.map((item) => item.order_item_id),
              },
            },
          ],
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
    category?: CategoryDomain['name'];
    sortQuery?: ISortOption[];
    status?: OrderItemRedeemStatusEnum;
    type?: OrderItemTypeEnum;
  }): Promise<OrderItemDomain[]> {
    const paginationOption = generatePaginationQueryOption({
      cursor,
      // sortOption: sortQuery,
    });

    let categoryQuery: Prisma.OrderItemWhereInput = {};

    if (category)
      categoryQuery = await this.generateFindCategoryWhereQuery(category);

    const orderBySortQuery = this.generatedSortQuery(sortQuery);
    const statusQuery = await this.generateFindStatusWhereQuery(status);

    const allWhereQuery = [
      categoryQuery,
      statusQuery,
      this.generateFindTypeWhereQuery(type),
    ];

    const orderItemsList = await this.prismaService.orderItem.findMany({
      ...paginationOption,
      orderBy: orderBySortQuery,
      where: {
        AND: allWhereQuery,
      },
      include: this.includeQuery,
    });

    return orderItemsList.map((item) =>
      OrderItemMapper.toDomain(item as OrderItemAndDetails, { allInfo: true }),
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
                qrcodeImagePath: item.qrcodeImagePath,
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
