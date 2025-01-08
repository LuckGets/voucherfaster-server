import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
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
import { VoucherPath, VoucherPromotionPath } from 'src/config/api-path';
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
} from '../dto/vouchers/create-voucher.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import {
  VoucherCategoryDomain,
  VoucherDomain,
  VoucherTagDomain,
} from '../domain/voucher.domain';
import { UnlinkFileInterceptor } from 'src/common/interceptor/unlink-file.interceptor';
import {
  UpdateVoucherDto,
  UpdateVoucherResponse,
} from '../dto/vouchers/update-voucher.dto';
import {
  AddVoucherImgDto,
  AddVoucherImgResponse,
  UpdateVoucherImgDto,
  UpdateVoucherImgResponse,
  VOUCHER_FILE_FILED,
} from '../dto/voucher-img/voucher-img.dto';
import { QUERY_FIELD_NAME } from 'src/common/types/pagination.type';
import {
  GetManyVoucherResponse,
  GetVoucherByIdResponse,
  GetVoucherBySearchContentResponse,
} from '../dto/vouchers/get-voucher.dto';
import {
  CreateVoucherPromotionDto,
  CreateVoucherPromotionResponse,
} from '../dto/voucher-promotion/create-promotion.dto';
import {
  UpdateVoucherPromotionDto,
  UpdateVoucherPromotionResponse,
} from '../dto/voucher-promotion/update-promotion.dto';
import { VoucherPromotionDomain } from '../domain/voucher-promotion.domain';
import { DeleteVoucherPromotionResponse } from '../dto/voucher-promotion/delete-promotion.dto';
import {
  GetManyVoucherPromotionResponse,
  GetVoucherPromotionByIdResponse,
} from '../dto/voucher-promotion/get-promotion.dto';

@Controller({ path: VoucherPath.Base, version: '1' })
export class VoucherController {
  constructor(private voucherService: VoucherService) {}

  // -------------------------------------------------------------------- //
  // ------------------------- VOUCHER PART ----------------------------- //
  // -------------------------------------------------------------------- //

  @ApiBearerAuth()
  @SerializeOptions({
    groups: [RoleEnum.Admin],
  })
  @ApiConsumes('multipart/formdata')
  @ApiBody({
    ...createVoucherFormDataDocumentation,
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: VOUCHER_FILE_FILED.MAIN_IMG,
        maxCount: 1,
      },
      {
        name: VOUCHER_FILE_FILED.VOUCHER_IMG,
      },
    ]),
    UnlinkFileInterceptor,
  )
  @UseGuards(AdminGuard)
  @Post()
  async createVoucher(
    @UploadedFiles()
    files: {
      [VOUCHER_FILE_FILED.MAIN_IMG]: Express.Multer.File[];
      [VOUCHER_FILE_FILED.VOUCHER_IMG]?: Express.Multer.File[];
    },
    @Body() body: CreateVoucherDto,
  ) {
    const voucher = await this.voucherService.createVoucher(
      body,
      files[VOUCHER_FILE_FILED.MAIN_IMG],
      files[VOUCHER_FILE_FILED.VOUCHER_IMG],
    );
    return CreateVoucherResponse.success(
      voucher,
      `Voucher code: ${voucher.code} have been created successfully.`,
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
    type: () => GetManyVoucherResponse,
    description: 'Get many voucher with pagination.',
  })
  @Get()
  async getPaginationVoucher(
    @Query(VoucherPath.TagQuery) tag: VoucherTagDomain['name'],
    @Query(VoucherPath.CategoryQuery) category: VoucherCategoryDomain['name'],
    @Query(QUERY_FIELD_NAME.CURSOR) cursor: VoucherDomain['id'],
  ): Promise<GetManyVoucherResponse> {
    const voucherQueryList = await this.voucherService.getPaginationVoucher({
      tag,
      category,
      cursor,
    });
    return GetManyVoucherResponse.success(voucherQueryList);
  }

  // GET
  // voucher via search content
  @ApiOkResponse({
    type: () => GetVoucherBySearchContentResponse,
    description:
      'Get specific voucher information via search content provided in URL path parameter.',
  })
  @Get(VoucherPath.SearchVoucher)
  async getSearchVoucher(
    @Param(VoucherPath.SearchVoucherParam) searchContent: string,
  ): Promise<GetVoucherBySearchContentResponse> {
    const voucher = await this.voucherService.getSearchedVoucher(searchContent);
    return GetVoucherBySearchContentResponse.success(voucher, searchContent);
  }

  @ApiParam({ name: 'voucherId' })
  @ApiOkResponse({
    type: () => GetVoucherByIdResponse,
    description:
      'Get specific voucher information via ID provided in URL path parameter.',
  })
  @Get(VoucherPath.GetVoucherId)
  async getSpecificVoucherById(
    @Param(VoucherPath.VoucherIdParm) voucherId: string,
  ): Promise<GetVoucherByIdResponse> {
    const voucher = await this.voucherService.getVoucherById(voucherId);
    return GetVoucherByIdResponse.success(voucher, voucherId);
  }

  // PATCH
  // voucher
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
        name: VOUCHER_FILE_FILED.MAIN_IMG,
        maxCount: 1,
      },
      {
        name: VOUCHER_FILE_FILED.VOUCHER_IMG,
      },
    ]),
    UnlinkFileInterceptor,
  )
  @Post(VoucherPath.AddVoucherImg)
  async addVoucherImg(
    @UploadedFiles()
    files: {
      [VOUCHER_FILE_FILED.MAIN_IMG]?: Express.Multer.File[];
      [VOUCHER_FILE_FILED.VOUCHER_IMG]?: Express.Multer.File[];
    },
    @Body() body: AddVoucherImgDto,
  ): Promise<AddVoucherImgResponse> {
    await this.voucherService.addVoucherImg({
      data: body,
      mainImg: files[VOUCHER_FILE_FILED.MAIN_IMG][0],
      voucherImg: files[VOUCHER_FILE_FILED.VOUCHER_IMG],
    });
    return AddVoucherImgResponse.success(null);
  }

  // Updage existing voucher Image.

  @ApiBearerAuth()
  @ApiConsumes('multipart/formdata')
  @ApiOkResponse({
    type: () => UpdateVoucherImgResponse,
  })
  @UseGuards(AdminGuard)
  @UseInterceptors(
    FileInterceptor(VOUCHER_FILE_FILED.VOUCHER_IMG),
    UnlinkFileInterceptor,
  )
  @Patch(VoucherPath.UpdateVoucherImg)
  async updateVoucherImg(
    @Body() body: UpdateVoucherImgDto,
    @UploadedFile()
    file: Express.Multer.File,
  ): Promise<UpdateVoucherImgResponse> {
    const voucherImg = await this.voucherService.updateSpecificVoucherImg(
      body,
      file,
    );
    return UpdateVoucherImgResponse.success(voucherImg, body.voucherImgId);
  }

  // -------------------------------------------------------------------- //
  // ------------------------- VOUCHER PROMOTION PART ------------------- //
  // -------------------------------------------------------------------- //

  @ApiBearerAuth()
  @ApiBody({
    type: () => CreateVoucherPromotionDto,
  })
  @ApiOkResponse({ type: () => CreateVoucherResponse })
  @UseGuards(AdminGuard)
  @Post(VoucherPromotionPath.CreatePromotion)
  async createVoucherPromotion(
    @Body() body: CreateVoucherPromotionDto,
  ): Promise<CreateVoucherPromotionResponse> {
    const createdVoucherPromotion =
      await this.voucherService.createVoucherPromotion(body);
    return CreateVoucherPromotionResponse.success(
      createdVoucherPromotion,
      body.voucherId,
    );
  }

  @ApiParam({
    name: 'voucherId',
    type: String,
    description:
      'Does not need to provide the correct param ID as this value does not going to be use in query process.',
    required: false,
  })
  @ApiParam({ name: 'promotionId', type: String })
  @ApiOkResponse({
    type: () => GetVoucherPromotionByIdResponse,
  })
  @Get(VoucherPromotionPath.GetPromotionById)
  async getVoucherPromotionById(
    @Param(VoucherPromotionPath.PromotionParmId)
    promotionId: VoucherPromotionDomain['id'],
  ): Promise<GetVoucherPromotionByIdResponse> {
    const voucherPromotion =
      await this.voucherService.getVoucherPromotionById(promotionId);
    return GetVoucherPromotionByIdResponse.success(voucherPromotion);
  }

  @ApiBearerAuth()
  @ApiBody({
    type: () => CreateVoucherPromotionDto,
  })
  @ApiOkResponse({ type: () => UpdateVoucherResponse })
  @UseGuards(AdminGuard)
  @Patch(VoucherPromotionPath.UpdatePromotion)
  async updateVoucherPromotion(
    @Body() body: UpdateVoucherPromotionDto,
  ): Promise<UpdateVoucherPromotionResponse> {
    const updatedVoucher =
      await this.voucherService.updateVoucherPromotion(body);
    return UpdateVoucherPromotionResponse.success(updatedVoucher);
  }

  @ApiBearerAuth()
  @ApiParam({
    name: 'promotionId',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    type: () => DeleteVoucherPromotionResponse,
  })
  @UseGuards(AdminGuard)
  @Delete(VoucherPromotionPath.DeletePromotion)
  async deleteVoucherPromotion(
    @Param(VoucherPromotionPath.PromotionParmId)
    voucherPromotionId: VoucherPromotionDomain['id'],
  ): Promise<DeleteVoucherPromotionResponse> {
    await this.voucherService.deleteVoucherPromotion(voucherPromotionId);
    return DeleteVoucherPromotionResponse.success(voucherPromotionId);
  }
}
