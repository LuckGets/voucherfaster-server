import { OrderItemDomain } from '@resources/order/domain/order-item.domain';
import { NullAble } from '@utils/types/common.type';
import { OrderItemRepository } from '../order-item.repository';
import { UpdateOrderItemDto } from '@resources/order-item/dto/update.dto';
import { PrismaService } from '../../config/prisma.service';
import { Prisma } from '@prisma/client';
import { OrderItemMapper } from './order-item.mapper';
import { Inject } from '@nestjs/common';

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

  private orderItemVoucherIncludeQuery: Prisma.OrderItemVoucherInclude = {
    voucher: {
      include: {
        ...this.voucherIncludeQuery,
      },
    },
  };

  private orderItemPromotionIncludeQuery: Prisma.OrderItemPromotionInclude = {
    voucherPromotion: {
      include: {
        voucher: {
          include: {
            ...this.voucherIncludeQuery,
          },
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
              include: {
                ...this.voucherIncludeQuery,
              },
            },
          },
        },
        PackageImg: {
          where: {
            mainImg: true,
          },
        },
        voucher: {
          include: {
            ...this.voucherIncludeQuery,
          },
        },
      },
    },
  };

  private includeQuery: Prisma.OrderItemInclude = {
    OrderItemPackage: {
      include: {
        ...this.orderItemPackageIncludeQuery,
      },
    },
    OrderItemVoucher: {
      include: {
        ...this.orderItemVoucherIncludeQuery,
      },
    },
    OrderItemPromotion: {
      include: {
        ...this.orderItemPromotionIncludeQuery,
      },
    },
  };

  private generateFindUniqueByIdQuery(
    id: OrderItemDomain['id'],
  ): Prisma.OrderItemFindUniqueArgs {
    return {
      where: { id },
      ...this.includeQuery,
    };
  }

  async findById(
    id: OrderItemDomain['id'],
  ): Promise<NullAble<OrderItemDomain>> {
    const findUniqueQuery = this.generateFindUniqueByIdQuery(id);
    const orderItem =
      await this.prismaService.orderItem.findUnique(findUniqueQuery);
    return OrderItemMapper.toDomain(orderItem);
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
              include: {
                ...this.includeQuery,
              },
            });
          }),
        );
      },
    );

    console.log('ALL updated order item', allUpdatedOrderItem);

    return allUpdatedOrderItem.map(OrderItemMapper.toDomain);
  }
  async update(data: UpdateOrderItemDto): Promise<OrderItemDomain> {
    const updatedOrderItem = await this.prismaService.orderItem.update({
      where: {
        id: data.id,
      },
      data,
      include: {
        ...this.includeQuery,
      },
    });
    return OrderItemMapper.toDomain(updatedOrderItem);
  }
}
