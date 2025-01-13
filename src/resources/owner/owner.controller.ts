import {
  Body,
  Controller,
  Get,
  Patch,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { OwnerService } from './owner.service';
import { OwnerPath } from 'src/config/api-path';
import { AdminGuard } from 'src/common/guards/admin.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
} from '@nestjs/swagger';
import { GetAllOwnerInformationResponse } from './dto/get-owner.dto';
import {
  UPDATE_IMG_FILE_FIELD,
  UpdateOwnerImgDto,
  UpdateOwnerImgResponse,
  UpdateOwnerInformationDto,
  UpdateOwnerInformationResponse,
} from './dto/update-owner.dto';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AtLeastOneFilePipe } from 'src/common/pipes/one-file.pipe';
import { UnlinkFileInterceptor } from 'src/common/interceptor/unlink-file.interceptor';

@Controller({ version: '1', path: OwnerPath.Base })
export class OwnerController {
  constructor(private ownerService: OwnerService) {}

  @ApiOkResponse({ type: () => GetAllOwnerInformationResponse })
  @UseGuards(AdminGuard)
  @Get()
  async getAllOwnerInformation(): Promise<GetAllOwnerInformationResponse> {
    const ownerInfo = await this.ownerService.getAllInformation();
    return GetAllOwnerInformationResponse.success(ownerInfo);
  }

  @ApiBody({ type: () => UpdateOwnerInformationDto })
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => UpdateOwnerInformationResponse })
  @UseGuards(AdminGuard)
  @Patch()
  async updateOwnerInformation(
    @Body() body: UpdateOwnerInformationDto,
  ): Promise<UpdateOwnerInformationResponse> {
    if (!body || Object.keys(body).length < 1)
      throw ErrorApiResponse.badRequest();

    const updatedInfo = await this.ownerService.updateInformation(body);
    return UpdateOwnerInformationResponse.success(updatedInfo);
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/formdata')
  @ApiBody({})
  @ApiOkResponse({ type: () => UpdateOwnerImgResponse })
  @UseGuards(AdminGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: UPDATE_IMG_FILE_FIELD.IMAGE,
        maxCount: 1,
      },
    ]),
    UnlinkFileInterceptor,
  )
  @UsePipes(AtLeastOneFilePipe([UPDATE_IMG_FILE_FIELD.IMAGE]))
  @Patch(OwnerPath.UpdateImage)
  async updateOwnerImage(
    @UploadedFiles()
    files: {
      [UPDATE_IMG_FILE_FIELD.IMAGE]?: Express.Multer.File[];
    },
    body: UpdateOwnerImgDto,
  ): Promise<UpdateOwnerImgResponse> {
    const file =
      files[UPDATE_IMG_FILE_FIELD.IMAGE] &&
      files[UPDATE_IMG_FILE_FIELD.IMAGE].length > 0;

    if (file && !body.imageId)
      throw ErrorApiResponse.badRequest(
        `Request provided files for upload ${UPDATE_IMG_FILE_FIELD.IMAGE} should also provide image ID.`,
      );

    const updatedImg = await this.ownerService.updateOwnerImage(
      files[UPDATE_IMG_FILE_FIELD.IMAGE][0],
      body.imageId,
    );
    return UpdateOwnerImgResponse.success(updatedImg);
  }
}
