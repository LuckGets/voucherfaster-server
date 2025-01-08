import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { GetAllPackageVoucherResponse } from './dto/get-package.dto';
import { PackageVoucherDomain } from './domain/package-voucher.domain';
import { DeletePackageVoucherByIdResponse } from './dto/delete-package.dto';

@Controller({ version: '1', path: PackageVoucherPath.Base })
export class PackageVoucherController {
  constructor(private packageVoucherService: PackageVoucherService) {}

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
}
