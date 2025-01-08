import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { VoucherPromotionPath } from 'src/config/api-path';
import { GetManyVoucherResponse } from '../dto/vouchers/get-voucher.dto';
import { QUERY_FIELD_NAME } from 'src/common/types/pagination.type';
import { VoucherPromotionDomain } from '../domain/voucher-promotion.domain';
import { GetManyVoucherPromotionResponse } from '../dto/voucher-promotion/get-promotion.dto';
import { VoucherService } from '../voucher.service';

@Controller({ version: '1', path: VoucherPromotionPath.Base })
export class VoucherPromotionController {
  constructor(private voucherService: VoucherService) {}

  @ApiQuery({
    name: 'cursor',
    description: 'Cursor ID for pagination.',
    required: false,
    type: String, // Adjust to the correct type if needed
  })
  @ApiQuery({
    name: 'name',
    description: 'Name of the promotion to filter by.',
    required: false,
    type: String, // Adjust to the correct type if needed
  })
  @ApiOkResponse({
    type: () => GetManyVoucherResponse,
  })
  @Get()
  async getPaginationVoucherPromotion(
    @Query(QUERY_FIELD_NAME.CURSOR) cursor: VoucherPromotionDomain['id'],
    @Query(VoucherPromotionPath.PromotionNameQuery)
    name: VoucherPromotionDomain['name'],
  ): Promise<GetManyVoucherPromotionResponse> {
    const voucherPromotionQueryList =
      await this.voucherService.getPaginationVoucherPromotion({ cursor, name });
    return GetManyVoucherPromotionResponse.success(voucherPromotionQueryList);
  }
}
