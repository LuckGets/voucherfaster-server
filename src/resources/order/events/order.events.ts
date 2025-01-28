import { AccountDomain } from '@resources/account/domain/account.domain';
import { OrderItemDomain } from '../../order-item/domain/order-item.domain';

export const ORDER_EVENT_CONSTANT = {
  CREATED: 'ORDER_CREATED',
  SUCCESS: 'ORDER_SUCCESS',
} as const;

export class OrderSuccessEvent {
  public email: AccountDomain['id'];
  public orderItemIdList: OrderItemDomain[];
  constructor(email: AccountDomain['id'], orderItemList: OrderItemDomain[]) {
    this.email = email;
    this.orderItemIdList = [...orderItemList];
  }
}
