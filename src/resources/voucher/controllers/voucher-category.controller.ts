import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { VoucherCategoryPath } from 'src/config/api-path';
import {
  CreateVoucherTagDto,
  UpdateVoucherTagDto,
  VoucherTagResponse,
} from '../dto/voucher-tag.dto';
import { VoucherService } from '../voucher.service';
import { RoleEnum } from '@resources/account/types/account.type';
import { QUERY_FIELD_NAME } from 'src/common/types/pagination.type';
import { VoucherCategoryDomain, VoucherDomain } from '../domain/voucher.domain';
import {
  CreateVoucherCategoryDto,
  VoucherCategoryResponse,
} from '../dto/voucher-category.dto';

@Controller({ version: '1', path: VoucherCategoryPath.Base })
export class VoucherCategoryController {
  constructor(private voucherService: VoucherService) {}
  // -------------------------------------------------------------------- //
  // ------------------------- VOUCHER TAG PART -------------------------
  // -------------------------------------------------------------------- //

  @ApiBearerAuth()
  @SerializeOptions({
    groups: [RoleEnum.Admin],
  })
  @UseGuards(AdminGuard)
  @Post(VoucherCategoryPath.CreateTag)
  async createVoucherTag(
    @Body() body: CreateVoucherTagDto,
  ): Promise<VoucherTagResponse> {
    const newVoucherTag = await this.voucherService.createVoucherTag(body);
    return VoucherTagResponse.createSuccess(newVoucherTag);
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: [RoleEnum.Admin],
  })
  @UseGuards(AdminGuard)
  @Patch(VoucherCategoryPath.UpdateTag)
  async updateVoucherTag(@Body() body: UpdateVoucherTagDto) {
    return this.voucherService.updateVoucherTag(body);
  }

  @SerializeOptions({
    groups: [RoleEnum.Admin, RoleEnum.User],
  })
  @Get(VoucherCategoryPath.TagsName)
  async getPaginationVoucherTag(
    @Query(VoucherCategoryPath.CategoryQuery)
    category: VoucherCategoryDomain['name'],
    @Query(QUERY_FIELD_NAME.CURSOR) cursor: VoucherDomain['id'],
  ) {
    return this.voucherService.getPaginationVoucherTag({
      category,
      cursor,
    });
  }
  // -------------------------------------------------------------------- //
  // ------------------------- VOUCHER CATEGORY PART -------------------- //
  // -------------------------------------------------------------------- //

  @SerializeOptions({
    groups: [RoleEnum.Admin],
  })
  @UseGuards(AdminGuard)
  @Post()
  async createVoucherCategory(
    @Body() body: CreateVoucherCategoryDto,
  ): Promise<VoucherCategoryResponse<VoucherCategoryDomain>> {
    const newVoucherCategory =
      await this.voucherService.createVoucherCategory(body);
    return VoucherCategoryResponse.createSuccess(newVoucherCategory);
  }

  @Get()
  async getPaginationVoucherCategory(): Promise<VoucherCategoryResponse<any>> {
    const voucherCat = await this.voucherService.getPaginationVoucherCategory();
    return VoucherCategoryResponse.findManySuccess(voucherCat);
  }
}
