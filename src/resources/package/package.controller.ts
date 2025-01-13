import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { RoleEnum } from '@resources/account/types/account.type';
import { UnlinkFileInterceptor } from 'src/common/interceptor/unlink-file.interceptor';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { PackageVoucherService } from './package.service';
import {
  GetAllPackageVoucherResponse,
  GetPackageVoucherByIdResponse,
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

  @ApiOkResponse({ type: () => GetAllPackageVoucherResponse })
  @Get()
  async getAllPackageVoucher(): Promise<GetAllPackageVoucherResponse> {
    const packageVoucherQueryList =
      await this.packageVoucherService.getAllPackageVoucher();
    return GetAllPackageVoucherResponse.success(packageVoucherQueryList);
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
    return GetPackageVoucherByIdResponse.success(packageVoucher);
  }

  @ApiBody({ type: UpdatePackageVoucherDto })
  @ApiParam({ name: PackageVoucherPath.PackageParamId })
  @ApiOkResponse({ type: () => GetPackageVoucherByIdResponse })
  @Patch(PackageVoucherPath.UpdatePackage)
  async updatePackageVoucher(@Body() body: UpdatePackageVoucherDto) {
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
}
