import { UpdateOrderItemDto } from '@resources/redeem/dto/update.dto';
import {
  OrderItemDomain,
  OrderItemRedeemStatusEnum,
  OrderItemTypeEnum,
} from '@resources/order-item/domain/order-item.domain';
import { NullAble } from '@utils/types/common.type';
import { VoucherCategoryDomain } from '@resources/voucher/domain/voucher.domain';
import { ISortOption } from 'src/common/types/pagination.type';

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
    category?: VoucherCategoryDomain['name'];
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
