import {
  Body,
  Controller,
  Delete,
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
import { PackageVoucherPath } from 'src/config/api-path';
import {
  CreatePackageVoucherDto,
  createPackageVoucherDtoSchemaDocument,
  CreatePackageVoucherResponse,
  PACKAGE_FILE_FIELD,
} from './dto/create-package.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { RoleEnum } from '@resources/account/types/account.type';
import { UnlinkFileInterceptor } from 'src/common/interceptor/unlink-file.interceptor';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { PackageVoucherService } from './package.service';
import {
  GetPackageVoucherByIdResponse,
  GetPaginationPackageVoucherResponse,
  PackageSellDateQueryEnum,
  PackageStatusQueryEnum,
} from './dto/get-package.dto';
import { PackageVoucherDomain } from './domain/package-voucher.domain';
import { DeletePackageVoucherByIdResponse } from './dto/delete-package.dto';
import {
  UpdatePackageVoucherDto,
  UpdatePackageVoucherResponse,
} from './dto/update-package.dto';
import {
  CreatePackageVoucherImgDto,
  CreatePackageVoucherImgResponse,
} from './dto/images/create-package-image.dto';
import {
  UpdatePackageVoucherImgDto,
  UpdatePackageVoucherImgResponse,
} from './dto/images/update-package-image.dto';
import { DeletePackageVoucherImgResponse } from './dto/images/delete-package-image.dto';
import { QUERY_FIELD_NAME } from 'src/common/types/pagination.type';
import { VoucherCategoryDomain } from '@resources/voucher/domain/voucher.domain';
import { ObjectHelper } from '@utils/services/object.helper';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { CompactService } from 'src/common/service/compact.service';
import { isUUID } from 'class-validator';

@Controller({ version: '1', path: PackageVoucherPath.Base })
export class PackageVoucherController {
  constructor(
    private packageVoucherService: PackageVoucherService,
    private compactService: CompactService,
  ) {}

  // -------------------------------------------------------------------- //
  // ------------------------- PACKAGE PART ----------------------------- //
  // -------------------------------------------------------------------- //

  @ApiBearerAuth()
  @ApiConsumes('multipart/formdata')
  @ApiBody(createPackageVoucherDtoSchemaDocument)
  @ApiCreatedResponse({
    type: () => CreatePackageVoucherResponse,
  })
  @SerializeOptions({ groups: [RoleEnum.Admin] })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: PACKAGE_FILE_FIELD.MAIN_IMG, maxCount: 1 },
      { name: PACKAGE_FILE_FIELD.PACKAGE_IMG },
    ]),
    UnlinkFileInterceptor,
  )
  @UseGuards(AdminGuard)
  @Post()
  async createPackageVoucher(
    @UploadedFiles()
    files: {
      [PACKAGE_FILE_FIELD.MAIN_IMG]: Express.Multer.File[];
      [PACKAGE_FILE_FIELD.PACKAGE_IMG]: Express.Multer.File[];
    },
    @Body() body: CreatePackageVoucherDto,
  ): Promise<CreatePackageVoucherResponse> {
    if (ObjectHelper.isObjectEmpty(files))
      throw ErrorApiResponse.badRequest(
        'This endpoint required attached file to process.',
      );

    const createPackage = await this.packageVoucherService.createPackageVoucher(
      {
        data: body,
        mainImg: files[PACKAGE_FILE_FIELD.MAIN_IMG],
        packageImg: files[PACKAGE_FILE_FIELD.PACKAGE_IMG],
      },
    );
    return CreatePackageVoucherResponse.success(createPackage);
  }

  @ApiQuery({
    name: QUERY_FIELD_NAME.CURSOR,
    description:
      'The last ID of the previous page package list. Provided the package ID to find the next page.',
  })
  @ApiQuery({
    name: PackageVoucherPath.GetPackageSellDateQuery,
    description: `Sell date of the package voucher. If not provided, default will be ${PackageSellDateQueryEnum.NOW}.`,
    required: false,
    enumName: 'PackageSellDateQueryEnum',
    enum: [
      PackageSellDateQueryEnum.ALL,
      PackageSellDateQueryEnum.EXPIRED,
      PackageSellDateQueryEnum.NOW,
    ],
    default: PackageSellDateQueryEnum.NOW,
    type: String,
  })
  @ApiQuery({
    name: PackageVoucherPath.GetPackageStatusQuery,
    description: `Status of the voucher. If not provided, default will be ${PackageStatusQueryEnum.ACTIVE}`,
    required: false,
    enumName: 'PackageStatusQueryEnum',
    enum: [
      PackageStatusQueryEnum.ALL,
      PackageStatusQueryEnum.ACTIVE,
      PackageStatusQueryEnum.INACTIVE,
    ],
    default: PackageStatusQueryEnum.ACTIVE,
    type: String,
  })
  @ApiQuery({
    name: PackageVoucherPath.GetPackageCategoryQuery,
    description: 'Category name of the voucher to filter by.',
    required: false,
    type: String,
  })
  @ApiOkResponse({ type: () => GetPaginationPackageVoucherResponse })
  @Get()
  async getPaginationPackageVoucher(
    @Query(QUERY_FIELD_NAME.CURSOR)
    cursor: PackageVoucherDomain['id'],
    @Query(PackageVoucherPath.GetPackageCategoryQuery)
    category: VoucherCategoryDomain['name'],
    @Query(PackageVoucherPath.GetPackageStatusQuery)
    status: PackageStatusQueryEnum,
    @Query(PackageVoucherPath.GetPackageSellDateQuery)
    sellDate: PackageSellDateQueryEnum,
  ): Promise<GetPaginationPackageVoucherResponse> {
    if (cursor) {
      cursor = this.compactService.compactBase64toUUID(cursor);

      if (!isUUID(cursor))
        throw ErrorApiResponse.badRequest('Invalid cursor data type.');
    }

    const packageVoucherQueryList =
      await this.packageVoucherService.getAllPackageVoucher({
        cursor,
        category,
        status,
        sellDate,
      });

    const nextPackageCursor =
      packageVoucherQueryList.length > 0
        ? this.compactService.compactUUIDtoBase64(
            packageVoucherQueryList[packageVoucherQueryList.length - 1].id,
          )
        : null;

    return GetPaginationPackageVoucherResponse.success(
      packageVoucherQueryList,
      nextPackageCursor,
    );
  }

  @ApiParam({ name: PackageVoucherPath.PackageParamId })
  @ApiOkResponse({ type: () => GetPackageVoucherByIdResponse })
  @Get(PackageVoucherPath.GetPackageById)
  async getPackageVoucherById(
    @Param(PackageVoucherPath.PackageParamId)
    packageId: PackageVoucherDomain['id'],
  ): Promise<GetPackageVoucherByIdResponse> {
    const packageVoucher =
      await this.packageVoucherService.getPackageVoucherById(packageId);
    return GetPackageVoucherByIdResponse.success(packageVoucher);
  }

  @ApiBody({ type: UpdatePackageVoucherDto })
  @ApiParam({ name: PackageVoucherPath.PackageParamId })
  @ApiOkResponse({ type: () => UpdatePackageVoucherResponse })
  @UseGuards(AdminGuard)
  @Patch(PackageVoucherPath.UpdatePackage)
  async updatePackageVoucher(
    @Body() body: UpdatePackageVoucherDto,
  ): Promise<UpdatePackageVoucherResponse> {
    const updatedPackage =
      await this.packageVoucherService.updatePackageVoucher(body);
    return UpdatePackageVoucherResponse.success(updatedPackage);
  }

  @ApiBearerAuth()
  @ApiParam({ name: PackageVoucherPath.PackageParamId })
  @ApiNoContentResponse({ type: () => DeletePackageVoucherByIdResponse })
  @UseGuards(AdminGuard)
  @Delete(PackageVoucherPath.DeletePackage)
  async deletePackageVoucherById(
    @Param(PackageVoucherPath.PackageParamId)
    paramId: PackageVoucherDomain['id'],
  ): Promise<DeletePackageVoucherByIdResponse> {
    await this.packageVoucherService.deletePackageVoucherById(paramId);
    return DeletePackageVoucherByIdResponse.success(paramId);
  }

  // -------------------------------------------------------------------- //
  // ------------------------- PACKAGE IMAGE PART ----------------------- //
  // -------------------------------------------------------------------- //

  @ApiBearerAuth()
  @ApiCreatedResponse({ type: () => CreatePackageVoucherImgResponse })
  @ApiConsumes('multipart/formdata')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        [PACKAGE_FILE_FIELD.PACKAGE_IMG]: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Additional images for the voucher',
          nullable: false,
        },
        packageId: {
          type: 'string',
          description: 'The requested voucher ID to add a new image.',
          nullable: false,
        },
      },
    },
  })
  @ApiOperation({
    description:
      'Add new images to the package voucher. All image adding in this endpoint will be count as non-main image.',
  })
  @SerializeOptions({ groups: [RoleEnum.Admin] })
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: PACKAGE_FILE_FIELD.PACKAGE_IMG,
      },
    ]),
    UnlinkFileInterceptor,
  )
  @UseGuards(AdminGuard)
  @Post(PackageVoucherPath.CreatePackageImage)
  async createPackageVoucherImg(
    @UploadedFiles()
    files: { [PACKAGE_FILE_FIELD.PACKAGE_IMG]: Express.Multer.File[] },
    @Body() body: CreatePackageVoucherImgDto,
  ): Promise<CreatePackageVoucherImgResponse> {
    if (ObjectHelper.isObjectEmpty(files))
      throw ErrorApiResponse.badRequest('This endpoint required file value.');

    const packageImg = await this.packageVoucherService.createPackageImg(
      body.packageId,
      files[PACKAGE_FILE_FIELD.PACKAGE_IMG],
    );
    return CreatePackageVoucherImgResponse.success(packageImg, body.packageId);
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({ type: () => UpdatePackageVoucherImgResponse })
  @ApiConsumes('multipart/formdata')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        [PACKAGE_FILE_FIELD.PACKAGE_IMG]: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Additional images for the voucher',
          nullable: false,
        },
        packageImgId: {
          type: 'string',
          description: 'The requested voucher ID to add a new image.',
          nullable: false,
        },
      },
    },
  })
  @SerializeOptions({ groups: [RoleEnum.Admin] })
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: PACKAGE_FILE_FIELD.PACKAGE_IMG,
        maxCount: 1,
      },
    ]),
    UnlinkFileInterceptor,
  )
  @UseGuards(AdminGuard)
  @Patch(PackageVoucherPath.UpdatePackageImage)
  async updatePackageVoucherImg(
    @UploadedFiles()
    files: {
      [PACKAGE_FILE_FIELD.PACKAGE_IMG]: Express.Multer.File[];
    },
    @Body() body: UpdatePackageVoucherImgDto,
  ): Promise<UpdatePackageVoucherImgResponse> {
    if (ObjectHelper.isObjectEmpty(files))
      throw ErrorApiResponse.badRequest('This endpoint required file value.');

    if (files[PACKAGE_FILE_FIELD.PACKAGE_IMG].length === 0)
      throw ErrorApiResponse.badRequest(
        `The ${PACKAGE_FILE_FIELD.PACKAGE_IMG} field required file value.`,
      );

    const updatedPackageImg = await this.packageVoucherService.updatePackageImg(
      body.packageImgId,
      files[PACKAGE_FILE_FIELD.PACKAGE_IMG][0],
    );
    return UpdatePackageVoucherImgResponse.success(updatedPackageImg);
  }

  @ApiBearerAuth()
  @ApiParam({ name: PackageVoucherPath.ImageIdParam })
  @ApiNoContentResponse({ type: () => DeletePackageVoucherImgResponse })
  @UseGuards(AdminGuard)
  @Delete(PackageVoucherPath.DeletePackageImage)
  async deletePackageVoucherImg(
    @Param(PackageVoucherPath.ImageIdParam) imageId: PackageVoucherDomain['id'],
  ): Promise<DeletePackageVoucherImgResponse> {
    await this.packageVoucherService.deletePackageImg(imageId);
    return DeletePackageVoucherImgResponse.success(imageId);
  }
}
