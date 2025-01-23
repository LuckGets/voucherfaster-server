import { Body, Controller, Patch } from '@nestjs/common';
import { OrderItemPath } from 'src/config/api-path';
import { OrderItemService } from './order-item.service';
import { RedeemItemDto, RedeemItemResponse } from './dto/redeem-item.dto';

@Controller({ path: OrderItemPath.Base, version: '1' })
export class OrderItemController {
  constructor(private orderItemService: OrderItemService) {}

  @Patch()
  async redeemItem(@Body() body: RedeemItemDto): Promise<RedeemItemResponse> {}
}
