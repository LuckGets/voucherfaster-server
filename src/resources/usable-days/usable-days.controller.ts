import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { UsableDaysPath } from 'src/config/api-path';
import { UsableDaysService } from './usable-days.service';
import { ApiBearerAuth, ApiBody, ApiOkResponse } from '@nestjs/swagger';
import {
  UpdateUsableDaysAfterPurchasedDayDto,
  UpdateUsableDaysAfterPurchasedResponse,
} from './dto/update-usable-day.dto';
import { AdminGuard } from 'src/common/guards/admin.guard';

@Controller({ path: UsableDaysPath.Base, version: '1' })
export class UsableDaysController {
  constructor(private usableDaysService: UsableDaysService) {}
  // -------------------------------------------------------------------- //
  // ------------------------- VOUCHER USAGE DAY PART ------------------- //
  // -------------------------------------------------------------------- //
  @ApiBearerAuth()
  @ApiBody({ type: () => UpdateUsableDaysAfterPurchasedDayDto })
  @ApiOkResponse({
    type: () => UpdateUsableDaysAfterPurchasedResponse,
  })
  @UseGuards(AdminGuard)
  @Patch()
  async updateVoucherUsageDay(
    @Body() body: UpdateUsableDaysAfterPurchasedDayDto,
  ): Promise<UpdateUsableDaysAfterPurchasedResponse> {
    const updatedVoucherUsageDay =
      await this.usableDaysService.updateUsableDaysAfterPurchased(body);
    return UpdateUsableDaysAfterPurchasedResponse.success(
      updatedVoucherUsageDay,
    );
  }
}
