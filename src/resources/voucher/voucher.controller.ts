import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
import {
  CreateVoucherTagDto,
  UpdateVoucherTagDto,
  VoucherTagResponse,
} from './dto/voucher-tag.dto';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { RoleEnum } from '@resources/account/types/account.type';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  CreateVoucherDto,
  CreateVoucherResponse,
} from './dto/create-voucher.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
} from '@nestjs/swagger';
import {
  VoucherCategoryDomain,
  VoucherDomain,
  VoucherTagDomain,
} from './domain/voucher.domain';
import { UnlinkFileInterceptor } from 'src/common/interceptor/unlink-file.interceptor';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { AddVoucherImgDto, UpdateVoucherImgDto } from './dto/voucher-img.dto';

@Controller({ path: VoucherPath.Base, version: '1' })
export class VoucherController {
  constructor(private voucherService: VoucherService) {}
  /**
   *
   * ---- Voucher ----
   * ---- PART ----
   */
  @ApiBearerAuth()
  @SerializeOptions({
    groups: [RoleEnum.Admin, RoleEnum.Me],
  })
  @ApiConsumes('multipart/formdata')
  @ApiBody({})
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
    return CreateVoucherResponse.success(
      voucher,
      `Voucher code: ${voucher.id} have been created successfully.`,
    );
  }

  @ApiOkResponse({
    description: 'Get many voucher with pagination.',
  })
  @Get()
  getPaginationVoucher(
    @Query(VoucherPath.TagQuery) tag: VoucherTagDomain['name'],
    @Query(VoucherPath.CategoryQuery) category: VoucherCategoryDomain['name'],
    @Query('cursor') cursor: VoucherDomain['id'],
  ) {
    return this.voucherService.getPaginationVoucher({
      tag,
      category,
      cursor,
    });
  }

  @ApiOkResponse({
    description: 'Get many voucher with pagination.',
  })
  @Get(VoucherPath.GetVoucherId)
  getSpecificVoucherById(
    @Param(VoucherPath.VoucherIdParm) voucherId: VoucherDomain['id'],
  ) {
    return this.voucherService.getVoucherById(voucherId);
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: [RoleEnum.Admin],
  })
  @ApiBody({ type: '' })
  @UseGuards(AdminGuard)
  @Patch(VoucherPath.UpdateVoucher)
  updateVoucher(@Body() body: UpdateVoucherDto) {
    return this.voucherService.updateVoucher(body);
  }

  // ------------------------- VOUCHER TAG PART -------------------------
  @ApiBearerAuth()
  @SerializeOptions({
    groups: [RoleEnum.Admin],
  })
  @UseGuards(AdminGuard)
  @Post(VoucherPath.CreateTag)
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
  @Patch(VoucherPath.UpdateTag)
  async updateVoucherTag(@Body() body: UpdateVoucherTagDto) {
    return this.voucherService.updateVoucherTag(body);
  }

  @SerializeOptions({
    groups: [RoleEnum.Admin, RoleEnum.User],
  })
  @Get(VoucherPath.TagsName)
  async getPaginationVoucherTag() {
    return this.voucherService.getPaginationVoucherTag();
  }
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
    return VoucherCategoryResponse.findManySuccess(voucherCat);
  }

  // -------------------------------------------------------------------- //
  // ------------------------- VOUCHER IMAGE PART ----------------------- //
  // -------------------------------------------------------------------- //

  @ApiBearerAuth()
  @ApiConsumes('multipart/formdata')
  @UseGuards(AdminGuard)
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
  @Post(VoucherPath.AddVoucherImg)
  addVoucherImg(
    @UploadedFiles()
    files: {
      mainImg: Express.Multer.File[];
      voucherImg: Express.Multer.File[];
    },
    @Body() body: AddVoucherImgDto,
  ) {
    return this.voucherService;
  }

  @Patch(VoucherPath.UpdateVoucherImg)
  updateVoucherImg(@Body() body: UpdateVoucherImgDto) {}
}
