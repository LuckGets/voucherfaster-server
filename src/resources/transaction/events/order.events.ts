import { OrderItemDomain } from '../../order/domain/order-item.domain';

export const ORDER_EVENT_CONSTANT = {
  CREATED: 'ORDER_CREATED',
  SUCCESS: 'ORDER_SUCCESS',
} as const;

export class OrderCreatedEvent {
  public orderItems: OrderItemDomain['id'][];
  constructor(private items: OrderItemDomain['id'][]) {
    this.orderItems = items;
  }
}
