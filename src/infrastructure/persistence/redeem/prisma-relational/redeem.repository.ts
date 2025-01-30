import { OrderItemDomain } from '@resources/order-item/domain/order-item.domain';
import { PrismaService } from '../../config/prisma.service';
import { RedeemItemInput, RedeemItemRepository } from '../redeem.repository';
import { Prisma } from '@prisma/client';
import { RedeemItemEntity, RedeemItemMapper } from './redeem.mapper';
import { Inject } from '@nestjs/common';

export class RedeemRelationaPrismaORMRepository
  implements RedeemItemRepository
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

  private orderItemIncludeQuery: Prisma.OrderItemInclude = {
    OrderItemPackage: {
      include: this.orderItemPackageIncludeQuery,
    },
    OrderItemVoucher: {
      include: this.orderItemVoucherIncludeQuery,
    },
    order: {
      include: this.orderIncludeQuery,
    },
  };

  async create(data: RedeemItemInput): Promise<OrderItemDomain> {
    const redeemedOrderItem = await this.prismaService.redeemedOrderItem.create(
      {
        data,
        include: {
          orderItem: {
            include: this.orderItemIncludeQuery,
          },
        },
      },
    );

    return RedeemItemMapper.toDomain(redeemedOrderItem as RedeemItemEntity);
  }
}
