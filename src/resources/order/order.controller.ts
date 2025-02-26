import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import { OrderPath } from 'src/config/api-path';
import { OrderService } from './order.service';
import { AccessTokenAuthGuard } from 'src/common/guards/access-token.guard';
import { VerifiedAccountGuard } from '../../common/guards/verified-account.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateOrderDto, CreateOrderResponse } from './dto/create-order.dto';
import { HttpRequestWithUser } from 'src/common/http.type';
import { OrderDomain } from './domain/order.domain';
import {
  GetMyOrdersResponse,
  GetOrderByIdReponse,
  GetPaginationOrderResponse,
} from './dto/get-order.dto';
import {
  TransactionDomain,
  TransactionStatusEnum,
} from '@resources/transaction/domain/transaction.domain';
import { RoleEnum } from '@resources/account/types/account.type';
import {
  OrderSuccessAfterPaymentResponse,
  ProcessPaymentDto,
} from './dto/transactions/process-payment.dto';
import { OrderOwnerGuard } from 'src/common/guards/order-owner.guard';
import {
  IPaginationOption,
  QUERY_FIELD_NAME,
} from 'src/common/types/pagination.type';
import { OrderItemDomain } from '@resources/order-item/domain/order-item.domain';

@Controller({ version: '1', path: OrderPath.Base })
export class OrderController {
  constructor(private orderService: OrderService) {}

  @ApiBearerAuth()
  @ApiBody({ type: () => CreateOrderDto })
  @ApiCreatedResponse({ type: () => CreateOrderResponse })
  @UseGuards(AccessTokenAuthGuard, VerifiedAccountGuard)
  @Post()
  async createOrder(
    @Req() req: HttpRequestWithUser,
    @Body() body: CreateOrderDto,
  ): Promise<CreateOrderResponse> {
    const createdOrder = await this.orderService.createOrder(
      body,
      req.user.accountId,
    );

    return CreateOrderResponse.success(createdOrder, req.user.accountId);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ type: () => GetMyOrdersResponse })
  @UseGuards(AccessTokenAuthGuard)
  @Get(OrderPath.Me)
  async getMyOrders(
    @Req() req: HttpRequestWithUser,
    @Query(QUERY_FIELD_NAME.PAGE) page: IPaginationOption['page'],
    @Query(QUERY_FIELD_NAME.CURSOR) cursor: OrderDomain['id'],
  ): Promise<GetMyOrdersResponse> {
    const ordersList = await this.orderService.getMyOrders(req.user.accountId, {
      cursor,
      paginationOptions: { page },
    });

    return GetMyOrdersResponse.success(ordersList, page ?? 1);
  }

  @ApiBearerAuth()
  @ApiParam({
    name: OrderPath.OrderIdParam,
    description: 'Order ID',
    example: '0194462e-a077-7616-b2d8-f8f14121ec54',
  })
  @ApiQuery({
    name: QUERY_FIELD_NAME.CURSOR,
    required: false,
    description:
      'Cursor ID for order-item, which default will send only first 10 items.',
    type: String,
  })
  @ApiQuery({
    name: QUERY_FIELD_NAME.LIMIT,
    required: false,
    description:
      'Provided this query if desired to limit the number of order-item, default will be 10',
    type: String,
  })
  @ApiOkResponse({ type: () => GetOrderByIdReponse })
  @UseGuards(AccessTokenAuthGuard, OrderOwnerGuard)
  @Get(OrderPath.GetOrderById)
  async getOrderById(
    @Param(OrderPath.OrderIdParam) orderId: OrderDomain['id'],
    @Query(QUERY_FIELD_NAME.CURSOR) cursor: OrderItemDomain['id'],
    @Query(QUERY_FIELD_NAME.LIMIT) take: number,
  ): Promise<GetOrderByIdReponse> {
    const order = await this.orderService.getOrderById(orderId, {
      cursor,
      take,
    });
    return GetOrderByIdReponse.success(order);
  }

  @ApiQuery({ name: OrderPath.GetOrdersQueryCursor, required: false })
  @ApiQuery({
    name: OrderPath.GetOrdersQueryTransactionStatus,
    required: false,
    enumName: 'TransactionStatus',
    description:
      "Provided this query to get order by transaction status. If this query is not provided, then it will get all of the order which has transaction status 'SUCCESS'.",
    enum: [
      TransactionStatusEnum.SUCCESS,
      TransactionStatusEnum.FAILED,
      TransactionStatusEnum.PENDING,
    ],
  })
  @ApiOkResponse({ type: () => GetPaginationOrderResponse })
  @SerializeOptions({ groups: [RoleEnum.Admin] })
  @Get()
  async getPaginationOrders(
    @Query(OrderPath.GetOrdersQueryCursor) cursor: OrderDomain['id'],
    @Query(OrderPath.GetOrdersQueryTransactionStatus)
    transactionStatus: TransactionDomain['status'],
  ): Promise<GetPaginationOrderResponse> {
    const ordersList = await this.orderService.getPaginationOrders({
      cursor,
      transactionStatus,
    });
    return GetPaginationOrderResponse.success(ordersList);
  }

  // -------------------------------------------------------------------- //
  // ------------------------- TRANSACTION PART ------------------------- //
  // -------------------------------------------------------------------- //
  @ApiBearerAuth()
  @ApiBody({ type: () => ProcessPaymentDto })
  @ApiOkResponse({ type: () => OrderSuccessAfterPaymentResponse })
  @UseGuards(AccessTokenAuthGuard)
  @Patch(OrderPath.ProcessPayment)
  async processPaymentWithOrderId(
    @Body() body: ProcessPaymentDto,
  ): Promise<OrderSuccessAfterPaymentResponse> {
    const updatedOrder =
      await this.orderService.processPaymentWithOrderId(body);
    return OrderSuccessAfterPaymentResponse.success(updatedOrder);
  }
}
