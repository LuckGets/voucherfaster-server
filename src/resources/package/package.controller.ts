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

@Controller({ version: '1', path: PackageVoucherPath.Base })
export class PackageVoucherController {
  constructor(private packageVoucherService: PackageVoucherService) {}

  // -------------------------------------------------------------------- //
  // ------------------------- PACKAGE PART ----------------------------- //
  // -------------------------------------------------------------------- //

  @ApiBearerAuth()
  @ApiConsumes('multipart/formdata')
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
    const createPackage = await this.packageVoucherService.createPackageVoucher(
      {
        data: body,
        mainImg: files[PACKAGE_FILE_FIELD.MAIN_IMG][0],
        packageImg: files[PACKAGE_FILE_FIELD.PACKAGE_IMG],
      },
    );
    return CreatePackageVoucherResponse.success(createPackage);
  }

  @ApiQuery({
    name: PackageVoucherPath.GetPackageQueryCursor,
    description:
      'The last ID of the previous page package list. Provided the package ID to find the next page.',
  })
  @ApiOkResponse({ type: () => GetPaginationPackageVoucherResponse })
  @Get()
  async getPaginationPackageVoucher(
    @Query(PackageVoucherPath.GetPackageQueryCursor)
    cursor: PackageVoucherDomain['id'],
  ): Promise<GetPaginationPackageVoucherResponse> {
    const packageVoucherQueryList =
      await this.packageVoucherService.getAllPackageVoucher({ cursor });
    return GetPaginationPackageVoucherResponse.success(packageVoucherQueryList);
  }

  @ApiParam({ name: PackageVoucherPath.PackageParamId })
  @ApiOkResponse({ type: () => GetPackageVoucherByIdResponse })
  @Get(PackageVoucherPath.GetPackageById)
  async getPackageVoucherById(
    @Param(PackageVoucherPath.PackageParamId)
    packageId: PackageVoucherDomain['id'],
  ) {
    const packageVoucher =
      await this.packageVoucherService.getPackageVoucherById(packageId);
    console.log(packageVoucher);
    return GetPackageVoucherByIdResponse.success(packageVoucher);
  }

  @ApiBody({ type: UpdatePackageVoucherDto })
  @ApiParam({ name: PackageVoucherPath.PackageParamId })
  @ApiOkResponse({ type: () => UpdatePackageVoucherResponse })
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
  @ApiCreatedResponse({ type: () => DeletePackageVoucherByIdResponse })
  @ApiConsumes('multipart/formdata')
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
    const packageImg = await this.packageVoucherService.createPackageImg(
      body.packageId,
      files[PACKAGE_FILE_FIELD.PACKAGE_IMG],
    );
    return CreatePackageVoucherImgResponse.success(packageImg, body.packageId);
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({ type: () => DeletePackageVoucherByIdResponse })
  @ApiConsumes('multipart/formdata')
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
  @Patch(PackageVoucherPath.UpdatePackageImage)
  async updatePackageVoucherImg(
    @UploadedFiles()
    files: {
      [PACKAGE_FILE_FIELD.PACKAGE_IMG]: Express.Multer.File[];
    },
    @Body() body: UpdatePackageVoucherImgDto,
  ): Promise<UpdatePackageVoucherImgResponse> {
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
