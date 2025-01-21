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
import {
  HttpRequestWithUser,
  HttpRequestWithUserAndOrder,
} from 'src/common/http.type';
import { OrderDomain } from './domain/order.domain';
import {
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
import { ErrorApiResponse } from 'src/common/core-api-response';

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
  @ApiParam({
    name: OrderPath.OrderIdParam,
    description: 'Order ID',
    example: '0194462e-a077-7616-b2d8-f8f14121ec54',
  })
  @ApiOkResponse({ type: () => GetOrderByIdReponse })
  @UseGuards(AccessTokenAuthGuard, OrderOwnerGuard)
  @Get(OrderPath.GetOrderById)
  async getOrderById(
    @Param(OrderPath.OrderIdParam) orderId: OrderDomain['id'],
  ): Promise<GetOrderByIdReponse> {
    const order = await this.orderService.getOrderById(orderId);
    return CreateOrderResponse.success(order);
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
  @UseGuards(AccessTokenAuthGuard, OrderOwnerGuard)
  @Patch(OrderPath.ProcessPayment)
  async processPaymentWithOrderId(
    @Req() req: HttpRequestWithUserAndOrder,
    @Body() body: ProcessPaymentDto,
  ): Promise<OrderSuccessAfterPaymentResponse> {
    if (
      !req.order ||
      Object.keys(req.order).length === 0 ||
      !(req.order instanceof OrderDomain)
    )
      throw ErrorApiResponse.internalServerError(
        `The request did not have the order property. Please contact developer to fix the issue.`,
      );

    const updatedOrder = await this.orderService.processPaymentWithOrderId(
      body,
      req.user,
      req.order,
    );
    return OrderSuccessAfterPaymentResponse.success(updatedOrder);
  }
}
