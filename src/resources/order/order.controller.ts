import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrderPath } from 'src/config/api-path';
import { OrderService } from './order.service';
import { AccessTokenAuthGuard } from 'src/common/guards/access-token.guard';
import { VerifiedAccountGuard } from './guards/verified-account.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CreateOrderDto, CreateOrderResponse } from './dto/create-order.dto';
import { HttpRequestWithUser } from 'src/common/http.type';
import { OrderDomain } from './domain/order.domain';
import {
  GetOrderByIdReponse,
  GetPaginationOrderResponse,
} from './dto/get-order.dto';

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

  @ApiParam({ name: OrderPath.OrderIdParam })
  @ApiOkResponse({ type: () => GetOrderByIdReponse })
  @Get(OrderPath.GetOrderById)
  async getOrderById(
    @Param(OrderPath.OrderIdParam) orderId: OrderDomain['id'],
  ): Promise<GetOrderByIdReponse> {
    const order = await this.orderService.getOrderById(orderId);
    return CreateOrderResponse.success(order);
  }

  @Get()
  async getPaginationOrders(
    @Query(OrderPath.GetOrdersQueryCursor) cursor: OrderDomain['id'],
  ): Promise<GetPaginationOrderResponse> {
    const ordersList = await this.orderService.getPaginationOrders({ cursor });
    return GetPaginationOrderResponse.success(ordersList);
  }
}
