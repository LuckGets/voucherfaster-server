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
import { VoucherService } from '../voucher.service';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { RoleEnum } from '@resources/account/types/account.type';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import {
  CreateVoucherDto,
  createVoucherFormDataDocumentation,
  CreateVoucherResponse,
} from '../dto/create-voucher.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  VoucherCategoryDomain,
  VoucherDomain,
  VoucherTagDomain,
} from '../domain/voucher.domain';
import { UnlinkFileInterceptor } from 'src/common/interceptor/unlink-file.interceptor';
import { UpdateVoucherDto } from '../dto/update-voucher.dto';
import {
  AddVoucherImgDto,
  AddVoucherImgResponse,
  UpdateVoucherImgDto,
  VOUCHER_FILE_FILED,
} from '../dto/voucher-img.dto';
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
  @ApiBody({
    ...createVoucherFormDataDocumentation,
  })
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
      voucherImg?: Express.Multer.File[];
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

  // GET
  // Pagination voucher
  @ApiQuery({
    name: 'tag',
    description: 'Tag name of the voucher to filter by.',
    required: false,
    type: String, // Adjust to the correct type if needed
  })
  @ApiQuery({
    name: 'category',
    description: 'Category name of the voucher to filter by.',
    required: false,
    type: String, // Adjust to the correct type if needed
  })
  @ApiQuery({
    name: 'cursor',
    description: 'Cursor ID for pagination.',
    required: false,
    type: String, // Adjust to the correct type if needed
  })
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

  @ApiParam({ name: 'search content', type: String })
  @Get(VoucherPath.SearchVoucher)
  async getSearchVoucher(
    @Param(VoucherPath.SearchVoucherParam) searchContent: string,
  ) {
    return this.voucherService.getSearchedVoucher(searchContent);
  }

  @ApiOkResponse({
    description:
      'Get specific voucher information via ID provided in URL path parameter.',
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
  @ApiBody({
    type: UpdateVoucherDto,
    description: 'Update specific voucher with a given ID.',
  })
  @UseGuards(AdminGuard)
  @Patch(VoucherPath.UpdateVoucher)
  updateVoucher(@Body() body: UpdateVoucherDto) {
    return this.voucherService.updateVoucher(body);
  }

  // -------------------------------------------------------------------- //
  // ------------------------- VOUCHER IMAGE PART ----------------------- //
  // -------------------------------------------------------------------- //

  // Adding new image to existing voucher
  // This endpoints can also be use to
  // update main image to a new one
  // and move the old one to sub-image
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        mainImg: {
          type: 'string',
          format: 'binary',
          description: 'Main image for the voucher',
          maxItems: 1,
          nullable: true,
        },
        voucherImg: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Additional images for the voucher',
          nullable: true,
        },
        voucherId: {
          type: 'string',
          description: 'The requested voucher ID to add a new image.',
          nullable: false,
        },
        deleteMainImg: {
          type: 'boolean',
          description:
            'If set to true, the previous main image will be delete and not be used as a image.',
          nullable: true,
        },
      },
    },
  })
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
