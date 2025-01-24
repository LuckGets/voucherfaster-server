import { Injectable } from '@nestjs/common';
import { OrderItemDomain } from '@resources/order/domain/order-item.domain';

export type RedeemItemInput = {
  id: string;
  orderItemId: OrderItemDomain['id'];
};

@Injectable()
export abstract class RedeemItemRepository {
  abstract create(payload: RedeemItemInput): Promise<OrderItemDomain>;
}
