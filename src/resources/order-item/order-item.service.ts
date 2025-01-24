import { Injectable } from '@nestjs/common';
import {
  ORDER_ITEM_SORT_MAP_TO_DB,
  OrderItemDomain,
  OrderItemRedeemStatusEnum,
  OrderItemSortEnum,
  OrderItemTypeEnum,
} from '@resources/order/domain/order-item.domain';
import { OrderItemRepository } from 'src/infrastructure/persistence/order-item/order-item.repository';
import { UpdateOrderItemDto } from '../redeem/dto/update.dto';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { VoucherCategoryDomain } from '@resources/voucher/domain/voucher.domain';
import { isUUID } from 'class-validator';
import { EnumCheckerHelper } from '@utils/services/enum-checker.helper';
import { ISortOption, SORT_DIRECTION } from 'src/common/types/pagination.type';

@Injectable()
export class OrderItemService {
  constructor(private readonly orderItemRepository: OrderItemRepository) {}

  public async findExistingCode(
    codeList: OrderItemDomain['code'][],
  ): Promise<OrderItemDomain['code'][]> {
    return this.orderItemRepository.findManyExistingCode(codeList);
  }

  public async findById(id: OrderItemDomain['id']): Promise<OrderItemDomain> {
    const orderItem = await this.orderItemRepository.findById(id);
    if (!orderItem)
      throw ErrorApiResponse.notFoundRequest(
        `Order Item ID: ${id} could not be found.`,
      );

    return orderItem;
  }

  public async getPagination({
    cursor,
    category,
    sortOption,
    status,
    type,
  }: {
    sortOption?: string;
    cursor?: OrderItemDomain['id'];
    category?: VoucherCategoryDomain['name'];
    status?: OrderItemRedeemStatusEnum;
    type?: OrderItemTypeEnum;
  }) {
    if (cursor && !isUUID(cursor, 7))
      throw ErrorApiResponse.conflictRequest(
        `${cursor} is not valid data type for cursor query.`,
      );

    const statusToQuery = this.checkStatusQuery(status);
    const typeToQuery = this.checkTypeToQuery(type);
    // const sortQuery = this.formatSortQueryOption(sortOption);

    return this.orderItemRepository.findMany({
      cursor,
      category,
      // sortQuery,
      status: statusToQuery,
      type: typeToQuery,
    });
  }

  private checkStatusQuery = (
    status: OrderItemRedeemStatusEnum,
  ): OrderItemRedeemStatusEnum => {
    return EnumCheckerHelper.getEnumValueOrThrow(
      OrderItemRedeemStatusEnum,
      status,
      OrderItemRedeemStatusEnum.ALL,
    );
  };

  private checkTypeToQuery = (type: OrderItemTypeEnum): OrderItemTypeEnum => {
    return EnumCheckerHelper.getEnumValueOrThrow(
      OrderItemTypeEnum,
      type,
      OrderItemTypeEnum.ALL,
    );
  };

  private formatSortQueryOption = (sortQuery: string): ISortOption[] => {
    if (!sortQuery)
      // Default query
      return [
        {
          field: ORDER_ITEM_SORT_MAP_TO_DB[OrderItemSortEnum.CREATED_AT],
          direction: SORT_DIRECTION.ASCENSION,
        },
      ];

    return sortQuery.split(',').map((query) => {
      // Default to "createdat asc" if nothing is provided
      const [rawKey, rawDirection] = query.split(':'); // ["name", "asc"]
      if (!EnumCheckerHelper.checkEnumValue(OrderItemSortEnum, rawKey))
        throw ErrorApiResponse.badRequest(`Invalid sort key: ${rawKey}`);

      const field = ORDER_ITEM_SORT_MAP_TO_DB[rawKey];
      const direction =
        rawDirection === SORT_DIRECTION.DESCENSION
          ? SORT_DIRECTION.DESCENSION
          : SORT_DIRECTION.ASCENSION;
      console.log(`parse sorts ${field}: direction ${direction}`, {
        field,
        direction,
      });
      return { field, direction };
    });
  };

  /**
   * Updates an order item.
   * @param data - The data to update the order item.
   * @returns The updated order item.
   * @throws {ErrorApiResponse} If the request is invalid.
   * @throws {ErrorApiResponse} If the order item does not exist.
   */
  public async updateOrderItem(
    data: UpdateOrderItemDto,
  ): Promise<OrderItemDomain> {
    // Validate the request
    if (!data || Object.keys(data).length === 0)
      throw ErrorApiResponse.badRequest(
        'Please provide the required information for this request.',
      );

    // Check if the order item exists
    const isOrderItemExist = await this.orderItemRepository.findById(data.id);

    if (!isOrderItemExist)
      throw ErrorApiResponse.notFoundRequest(
        `Order ID: ${data.id} could not be found.`,
      );

    // Update the order item
    return this.orderItemRepository.update(data);
  }

  public async updateManyQRCodeAfterCreated(
    data: UpdateOrderItemDto[],
  ): Promise<OrderItemDomain[]> {
    return this.orderItemRepository.transactionForUpdateMany(data);
  }
}
