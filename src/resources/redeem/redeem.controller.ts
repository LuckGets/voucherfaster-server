import { Body, Controller, Post } from '@nestjs/common';
import { RedeemService } from './redeem.service';
import { RedeemItemDto, RedeemItemResponse } from './dto/redeem-item.dto';
import { ApiBody, ApiCreatedResponse } from '@nestjs/swagger';
import { RedeemItemPath } from 'src/config/api-path';

@Controller({ path: RedeemItemPath.Base, version: '1' })
export class RedeemItemController {
  constructor(private redeemService: RedeemService) {}
  @ApiCreatedResponse({ type: () => RedeemItemResponse })
  @ApiBody({ type: () => RedeemItemDto })
  @Post()
  private async redeem(
    @Body() body: RedeemItemDto,
  ): Promise<RedeemItemResponse> {
    const redeemedOrderItem = await this.redeemService.redeemItemById(body);
    return RedeemItemResponse.success(redeemedOrderItem);
  }
}
