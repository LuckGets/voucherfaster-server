import { UpdateOrderItemDto } from '@resources/redeem/dto/update.dto';
import {
  OrderItemDomain,
  OrderItemRedeemStatusEnum,
  OrderItemTypeEnum,
} from '@resources/order-item/domain/order-item.domain';
import { NullAble } from '@utils/types/common.type';
import { ISortOption } from 'src/common/types/pagination.type';
import { CategoryDomain } from '@resources/category/domain/category.domain';

export abstract class OrderItemRepository {
  abstract findById(
    id: OrderItemDomain['id'],
  ): Promise<NullAble<OrderItemDomain>>;

  abstract findMany({
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
  }): Promise<OrderItemDomain[]>;

  abstract findManyExistingCode(
    codeList: OrderItemDomain['code'][],
  ): Promise<OrderItemDomain['code'][]>;

  abstract update(data: UpdateOrderItemDto): Promise<OrderItemDomain>;

  abstract transactionForUpdateMany(
    data: UpdateOrderItemDto[],
  ): Promise<OrderItemDomain[]>;
}
