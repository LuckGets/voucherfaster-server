import { UpdateOrderItemDto } from '@resources/order-item/dto/update.dto';
import { OrderItemDomain } from '@resources/order/domain/order-item.domain';
import { NullAble } from '@utils/types/common.type';

export abstract class OrderItemRepository {
  abstract findById(
    id: OrderItemDomain['id'],
  ): Promise<NullAble<OrderItemDomain>>;

  abstract update(data: UpdateOrderItemDto): Promise<OrderItemDomain>;

  abstract transactionForUpdateMany(
    data: UpdateOrderItemDto[],
  ): Promise<OrderItemDomain[]>;
}
