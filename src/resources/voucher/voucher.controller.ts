import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  SerializeOptions,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { VoucherPath } from 'src/config/api-path';
import {
  CreateVoucherCategoryDto,
  VoucherCategoryResponse,
} from './dto/voucher-category.dto';
import { VoucherService } from './voucher.service';
import { CreateVoucherTagDto, VoucherTagResponse } from './dto/voucher-tag.dto';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { RoleEnum } from '@resources/account/types/account.type';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { ApiConsumes } from '@nestjs/swagger';
import { VoucherCategoryDomain } from './domain/voucher.domain';
import { UnlinkFileInterceptor } from 'src/common/interceptor/unlink-file.interceptor';

@Controller({ path: VoucherPath.Base, version: '1' })
export class VoucherController {
  constructor(private voucherService: VoucherService) {}
  /**
   *
   * ---- Voucher ----
   * ---- PART ----
   */
  @ApiConsumes('multipart/formdata')
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'mainImg',
        maxCount: 1,
      },
      {
        name: 'voucherImg',
      },
    ]),
    UnlinkFileInterceptor,
  )
  @UseGuards(AdminGuard)
  @Post()
  async createVoucher(
    @UploadedFiles()
    files: {
      mainImg: Express.Multer.File[];
      voucherImg: Express.Multer.File[];
    },
    @Body() body: CreateVoucherDto,
  ) {
    const voucher = await this.voucherService.createVoucher(
      body,
      files.mainImg,
      files.voucherImg,
    );
    console.log('VOUCHER HOORAY!!:', voucher);
  }

  /**
   *
   * ---- Voucher ----
   * ---- TAG ----
   * ---- PART ----
   */
  @SerializeOptions({
    groups: [RoleEnum.Admin],
  })
  @UseGuards(AdminGuard)
  @Post(VoucherPath.Tag)
  async createVoucherTag(
    @Body() body: CreateVoucherTagDto,
  ): Promise<VoucherTagResponse> {
    const newVoucherTag = await this.voucherService.createVoucherTag(body);
    return VoucherTagResponse.createSuccess(newVoucherTag);
  }

  @Patch(VoucherPath.Tag)
  async updateVoucherTag() {}

  @Get()
  async getPaginationVoucherTag() {}
  /**
   *
   * ---- Voucher ----
   * ---- CATEGORY ----
   * ---- PART ----
   */
  @SerializeOptions({
    groups: [RoleEnum.Admin],
  })
  @UseGuards(AdminGuard)
  @Post(VoucherPath.Category)
  async createVoucherCategory(
    @Body() body: CreateVoucherCategoryDto,
  ): Promise<VoucherCategoryResponse<VoucherCategoryDomain>> {
    const newVoucherCategory =
      await this.voucherService.createVoucherCategory(body);
    return VoucherCategoryResponse.createSuccess(newVoucherCategory);
  }
  @Get(VoucherPath.Category)
  async getPaginationVoucherCategory(): Promise<VoucherCategoryResponse<any>> {
    const voucherCat = await this.voucherService.getPaginationVoucherCategory();
    return VoucherCategoryResponse.success(voucherCat);
  }
}
