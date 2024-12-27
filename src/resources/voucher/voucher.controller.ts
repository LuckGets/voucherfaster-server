import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  SerializeOptions,
  UploadedFile,
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
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import {
  CreateVoucherDto,
  CreateVoucherResponse,
} from './dto/create-voucher.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  VoucherCategoryDomain,
  VoucherDomain,
  VoucherTagDomain,
} from './domain/voucher.domain';
import { UnlinkFileInterceptor } from 'src/common/interceptor/unlink-file.interceptor';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import {
  AddVoucherImgDto,
  AddVoucherImgResponse,
  UpdateVoucherImgDto,
  VOUCHER_FILE_FILED,
} from './dto/voucher-img.dto';
import { QUERY_FIELD_NAME } from 'src/common/types/pagination.type';

@Controller({ path: VoucherPath.Base, version: '1' })
export class VoucherController {
  constructor(private voucherService: VoucherService) {}

  // -------------------------------------------------------------------- //
  // ------------------------- VOUCHER PART ----------------------------- //
  // -------------------------------------------------------------------- //

  @ApiBearerAuth()
  @SerializeOptions({
    groups: [RoleEnum.Admin, RoleEnum.Me],
  })
  @ApiConsumes('multipart/formdata')
  @ApiBody({})
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: VOUCHER_FILE_FILED.MainImg,
        maxCount: 1,
      },
      {
        name: VOUCHER_FILE_FILED.VoucherImg,
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
    @Query(QUERY_FIELD_NAME.CURSOR) cursor: VoucherDomain['id'],
  ) {
    return this.voucherService.getPaginationVoucher({
      tag,
      category,
      cursor,
    });
  }

  @Get(VoucherPath.SearchVoucher)
  async getSearchVoucher(
    @Param(VoucherPath.SearchVoucherParam) searchContent: string,
  ) {
    const voucherList =
      await this.voucherService.getSearchedVoucher(searchContent);
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

  // -------------------------------------------------------------------- //
  // ------------------------- VOUCHER TAG PART -------------------------
  // -------------------------------------------------------------------- //

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
  // -------------------------------------------------------------------- //
  // ------------------------- VOUCHER CATEGORY PART -------------------- //
  // -------------------------------------------------------------------- //

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

  // Adding new image to existing voucher
  // This endpoints can also be use to
  // update main image to a new one
  // and move the old one to sub-image
  @ApiBearerAuth()
  @ApiOperation({
    description:
      "This endpoints can be use for two cases.\n1). Add new image to the exisiting voucher. The newly added image will be marked as non-main image.\n 2).Adding new main image and move the old main image to be non-main image.\n If  provided value body's property: deleteMainImg equal true. The to-be-replace main image will be delete.",
  })
  @ApiConsumes('multipart/formdata')
  @UseGuards(AdminGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: VOUCHER_FILE_FILED.MainImg,
        maxCount: 1,
      },
      {
        name: VOUCHER_FILE_FILED.VoucherImg,
      },
    ]),
    UnlinkFileInterceptor,
  )
  @Post(VoucherPath.AddVoucherImg)
  async addVoucherImg(
    @UploadedFiles()
    files: {
      mainImg?: Express.Multer.File[];
      voucherImg?: Express.Multer.File[];
    },
    @Body() body: AddVoucherImgDto,
  ): Promise<AddVoucherImgResponse> {
    await this.voucherService.addVoucherImg({
      data: body,
      mainImg: files.mainImg[0],
      voucherImg: files.voucherImg,
    });
    return AddVoucherImgResponse.success(null);
  }

  // Updage existing voucher Image.

  @ApiBearerAuth()
  @ApiConsumes('multipart/formdata')
  @UseGuards(AdminGuard)
  @UseInterceptors(
    FileInterceptor(VOUCHER_FILE_FILED.VoucherImg),
    UnlinkFileInterceptor,
  )
  @Patch(VoucherPath.UpdateVoucherImg)
  async updateVoucherImg(
    @Body() body: UpdateVoucherImgDto,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    const voucherImg = await this.voucherService.updateSpecificVoucherImg(
      body,
      file,
    );
  }
}
