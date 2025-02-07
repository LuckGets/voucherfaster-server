import { OrderItemDomain } from '@resources/order-item/domain/order-item.domain';
import { PrismaService } from '../../config/prisma.service';
import { RedeemItemInput, RedeemItemRepository } from '../redeem.repository';
import { Prisma } from '@prisma/client';
import { RedeemItemEntity, RedeemItemMapper } from './redeem.mapper';
import { Inject } from '@nestjs/common';
import { OrderItemRelationPrismaORMRepository } from '../../order-item/prisma-relational/order-item.repository';
import { OrderItemRelationalPrismaORMStatic } from '../../order-item/prisma-relational/static-class/order-item-static.repository';

export class RedeemRelationaPrismaORMRepository
  implements RedeemItemRepository
{
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}

  private orderItemIncludeQuery: Prisma.OrderItemInclude =
    OrderItemRelationalPrismaORMStatic.orderItemIncludeQuery;

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
