import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UsableDaysPath } from 'src/config/api-path';
import { UsableDaysService } from './usable-days.service';
import { ApiBearerAuth, ApiBody, ApiOkResponse } from '@nestjs/swagger';
import {
  UpdateUsableDaysAfterPurchasedDayDto,
  UpdateUsableDaysAfterPurchasedResponse,
} from './dto/update-usable-day.dto';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { GetUsableDaysAfterPurchasedResponse } from './dto/get-usableday.dto';

@Controller({ path: UsableDaysPath.Base, version: '1' })
export class UsableDaysController {
  constructor(private usableDaysService: UsableDaysService) {}

  @ApiBearerAuth()
  @ApiOkResponse({ type: () => GetUsableDaysAfterPurchasedResponse })
  @UseGuards(AdminGuard)
  @Get()
  async getCurrentUsableDaysAfterPurchased(): Promise<GetUsableDaysAfterPurchasedResponse> {
    const currentUsableDaysAfterPurchased =
      await this.usableDaysService.getCurrentUsableDaysAfterPurchased();
    return GetUsableDaysAfterPurchasedResponse.success(
      currentUsableDaysAfterPurchased,
    );
  }

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
