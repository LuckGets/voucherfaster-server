import { Body, Controller, Get, Patch, Query } from '@nestjs/common';
import { OrderItemPath } from 'src/config/api-path';
import { OrderItemService } from './order-item.service';
import {
  RedeemItemDto,
  RedeemItemResponse,
} from '../redeem/dto/redeem-item.dto';
import { ApiBody, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { QUERY_FIELD_NAME } from 'src/common/types/pagination.type';
import {
  OrderItemDomain,
  OrderItemRedeemStatusEnum,
  OrderItemTypeEnum,
} from '@resources/order/domain/order-item.domain';
import { VoucherCategoryDomain } from '@resources/voucher/domain/voucher.domain';
import { GetPaginationOrderItemsResponse } from './dto/get-order-item';

@Controller({ path: OrderItemPath.Base, version: '1' })
export class OrderItemController {
  constructor(private orderItemService: OrderItemService) {}

  // GET
  // Pagination voucher
  @ApiQuery({
    name: OrderItemPath.SortQuery,
    description:
      'Query for sorting order-item. Can pass as many, included, field as possible',
    required: false,
    example: [
      '?sort="fullname:asc", "?sort="createdAt:desc,expired:asc","?sort="fullname:desc,code:asc,createdAt:asc"',
    ],
    enum: ['fullname', 'code', 'createdAt', 'expired'],
    type: String,
  })
  @ApiQuery({
    name: OrderItemPath.CategoryQuery,
    description: 'Category name of the voucher to filter by.',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: QUERY_FIELD_NAME.CURSOR,
    description: 'Cursor ID for pagination.',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: OrderItemPath.StatusQuery,
    description: `Status of the order-item which consider on redeem status. If not provided, default will be ${OrderItemRedeemStatusEnum.ALL}. This query is case-insensitive`,
    required: false,
    enumName: 'OrderItemRedeemStatusEnum',
    enum: [
      OrderItemRedeemStatusEnum.ALL,
      OrderItemRedeemStatusEnum.REDEEMABLE,
      OrderItemRedeemStatusEnum.REDEEMED,
      OrderItemRedeemStatusEnum.EXPIRED,
    ],
    default: OrderItemRedeemStatusEnum.ALL,
    type: String,
  })
  @ApiQuery({
    name: OrderItemPath.TypeQuery,
    description: `Type of the order-voucher. If not provided, default will be ${OrderItemTypeEnum.ALL}. This query is case-insensitive`,
    required: false,
    enumName: 'OrderItemTypeEnum',
    enum: [
      OrderItemTypeEnum.ALL,
      OrderItemTypeEnum.VOUCHER,
      OrderItemTypeEnum.PROMOTION,
      OrderItemTypeEnum.PACKAGE,
    ],
    default: OrderItemTypeEnum.ALL,
    type: String,
  })
  @ApiOkResponse({
    type: () => GetPaginationOrderItemsResponse,
    description: 'Get many order-item with pagination.',
  })
  @Get()
  async getPaginationOrderItems(
    @Query(OrderItemPath.SortQuery) sortOption: string,
    @Query(OrderItemPath.CategoryQuery) category: VoucherCategoryDomain['name'],
    @Query(QUERY_FIELD_NAME.CURSOR) cursor: OrderItemDomain['id'],
    @Query(OrderItemPath.StatusQuery) status: OrderItemRedeemStatusEnum,
    @Query(OrderItemPath.TypeQuery) type: OrderItemTypeEnum,
  ): Promise<GetPaginationOrderItemsResponse> {
    const orderItemList = await this.orderItemService.getPagination({
      cursor,
      category,
      sortOption,
      status,
      type,
    });

    return GetPaginationOrderItemsResponse.success(orderItemList);
  }

  async getBySearchContent() {}
}
