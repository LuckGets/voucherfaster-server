import { RedeemedOrderItem } from '@prisma/client';
import {
  OrderItemAndDetails,
  OrderItemMapper,
} from '../../order-item/prisma-relational/order-item.mapper';
import { OrderItemDomain } from '@resources/order-item/domain/order-item.domain';

export type RedeemItemEntity = RedeemedOrderItem & {
  orderItem: Omit<OrderItemAndDetails, 'RedeemedOrderItem'>;
};

export class RedeemItemMapper {
  public static toDomain(entity: RedeemItemEntity): OrderItemDomain {
    const { orderItem, id, updatedAt } = entity;
    return OrderItemMapper.toDomain({
      ...orderItem,
      RedeemOrderItem: { id, updatedAt },
    });
  }
}
