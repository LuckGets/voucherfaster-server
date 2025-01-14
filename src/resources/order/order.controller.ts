import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { OrderPath } from 'src/config/api-path';
import { OrderService } from './order.service';
import { AccessTokenAuthGuard } from 'src/common/guards/access-token.guard';
import { VerifiedAccountGuard } from './guards/verified-account.guard';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse } from '@nestjs/swagger';
import { CreateOrderDto, CreateOrderResponse } from './dto/create-order.dto';
import { HttpRequestWithUser } from 'src/common/http.type';

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
}
