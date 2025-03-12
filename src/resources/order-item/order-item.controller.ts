import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ORDER_ITEM_CONST, OrderItemPath } from 'src/config/api-path';
import { OrderItemService } from './order-item.service';
import { ApiBearerAuth, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { QUERY_FIELD_NAME } from 'src/common/types/pagination.type';
import {
  OrderItemDomain,
  OrderItemRedeemStatusEnum,
  OrderItemTypeEnum,
} from '@resources/order-item/domain/order-item.domain';
import {
  GetByOrderItemIdResponse,
  GetPaginationOrderItemsResponse,
} from './dto/get-order-item';
import { isUUID } from 'class-validator';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { CategoryDomain } from '@resources/category/domain/category.domain';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { UpdateOrderItemDto } from './dto/update-order-item';
import { ResendOrderItemResponse } from './dto/resend.dto';

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
    @Query(OrderItemPath.CategoryQuery) category: CategoryDomain['name'],
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

  @ApiOkResponse({
    type: () => GetByOrderItemIdResponse,
  })
  @Get(OrderItemPath.GetById)
  async getById(
    @Param(ORDER_ITEM_CONST.PARAM_ID) itemId: OrderItemDomain['id'],
  ): Promise<GetByOrderItemIdResponse> {
    if (!itemId || !isUUID(itemId))
      throw ErrorApiResponse.badRequest(
        'Provided parameter for order-item id is invaid.',
      );

    const orderItem = await this.orderItemService.findById(itemId);

    return GetByOrderItemIdResponse.success(orderItem);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    type: () => ResendOrderItemResponse,
  })
  @UseGuards(AdminGuard)
  @Get(OrderItemPath.ResendQRCode)
  async resendEmail(
    @Param(ORDER_ITEM_CONST.PARAM_ID) itemId: OrderItemDomain['id'],
  ): Promise<ResendOrderItemResponse> {
    const orderItem = await this.orderItemService.resendEmail(itemId);

    return ResendOrderItemResponse.success(orderItem);
  }

  @UseGuards(AdminGuard)
  @Patch(OrderItemPath.UpdateOrderItem)
  async updateOrderItemById(@Body() body: UpdateOrderItemDto) {}
}
