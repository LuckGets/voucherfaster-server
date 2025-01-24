import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
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
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import {
  GetAllOwnerInformationResponse,
  GetOwnerPasswordForRedeemResponse,
} from './dto/get-owner.dto';
import {
  UpdateOwnerInformationDto,
  UpdateOwnerInformationResponse,
  UpdateOwnerPasswordForRedeem,
  UpdateOwnerPasswordForRedeemResponse,
} from './dto/update-owner.dto';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AtLeastOneFilePipe } from 'src/common/pipes/one-file.pipe';
import { UnlinkFileInterceptor } from 'src/common/interceptor/unlink-file.interceptor';
import { OwnerImgDomain } from './domain/owner.domain';
import {
  UPDATE_IMG_FILE_FIELD,
  UpdateOwnerImgDto,
  UpdateOwnerImgResponse,
} from './dto/img/update.dto';
import { DeleteOwnerImgByIdResponse } from './dto/img/delete.dto';
import { isUUID } from 'class-validator';
import { AddOwnerImgResponse } from './dto/img/add-img.dto';

@Controller({ version: '1', path: OwnerPath.Base })
export class OwnerController {
  private logger: Logger = new Logger(OwnerController.name);
  constructor(private ownerService: OwnerService) {}

  @ApiBearerAuth()
  @ApiOkResponse({ type: () => GetAllOwnerInformationResponse })
  @UseGuards(AdminGuard)
  @Get()
  async getOwnerInformation(): Promise<GetAllOwnerInformationResponse> {
    this.logger.log('Get owner information');
    const ownerInfo = await this.ownerService.getOwnerInformation();
    return GetAllOwnerInformationResponse.success(ownerInfo);
  }

  // NEED TO MODIFY THE LOGIC OF GETTING PASSWORD IF REALLY NEEDED TO RETRIEVE
  // @ApiBearerAuth()
  // @ApiOkResponse({ type: () => GetAllOwnerInformationResponse })
  // @UseGuards(AdminGuard)
  // @Get(OwnerPath.GetPasswordForRedeem)
  // async getOwnerPasswordForRedeem(): Promise<GetOwnerPasswordForRedeemResponse> {
  //   this.logger.log('Get owner password for redeem');
  //   const ownerPasswordForRedeem =
  //     await this.ownerService.getPasswordForRedeem();
  //   return GetOwnerPasswordForRedeemResponse.success({
  //     passwordForRedeem: ownerPasswordForRedeem,
  //   });
  // }

  @ApiBody({ type: () => UpdateOwnerInformationDto })
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => UpdateOwnerInformationResponse })
  @UseGuards(AdminGuard)
  @Patch()
  async updateOwnerInformation(
    @Body() body: UpdateOwnerInformationDto,
  ): Promise<UpdateOwnerInformationResponse> {
    if (!body || Object.keys(body).length < 1)
      throw ErrorApiResponse.badRequest(`Invalid request body`);

    const updatedInfo = await this.ownerService.updateInformation(body);
    return UpdateOwnerInformationResponse.success(updatedInfo);
  }

  @ApiBody({ type: () => UpdateOwnerPasswordForRedeem })
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => UpdateOwnerPasswordForRedeemResponse })
  @UseGuards(AdminGuard)
  @Patch(OwnerPath.UpdateOwnerPasswordForRedeem)
  async updateOwnerPasswordForRedeem(
    @Body() body: UpdateOwnerPasswordForRedeem,
  ): Promise<UpdateOwnerPasswordForRedeemResponse> {
    const isUpdateSucceed =
      await this.ownerService.updateOwnerPasswordForRedeem(body);
    if (!isUpdateSucceed)
      throw ErrorApiResponse.badRequest('Update password failed.');
    return UpdateOwnerPasswordForRedeemResponse.success({
      updatedNewPassword: body.newPassword,
    });
  }

  @ApiConsumes('multipart/formdata')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        [UPDATE_IMG_FILE_FIELD.IMAGE]: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: () => AddOwnerImgResponse })
  @UseGuards(AdminGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: UPDATE_IMG_FILE_FIELD.IMAGE,
      },
    ]),
    UnlinkFileInterceptor,
  )
  @UsePipes(AtLeastOneFilePipe([UPDATE_IMG_FILE_FIELD.IMAGE]))
  @Post(OwnerPath.Image)
  async addOwnerImg(
    @UploadedFiles()
    files: {
      [UPDATE_IMG_FILE_FIELD.IMAGE]: Express.Multer.File[];
    },
  ): Promise<AddOwnerImgResponse> {
    const numsOfCreatedImg = await this.ownerService.addOwnerImg(
      files[UPDATE_IMG_FILE_FIELD.IMAGE],
    );
    return AddOwnerImgResponse.success(numsOfCreatedImg);
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/formdata')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        [UPDATE_IMG_FILE_FIELD.IMAGE]: {
          type: 'string',
          format: 'binary',
        },
        imageId: {
          type: 'string',
        },
      },
    },
  })
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
  @Patch(OwnerPath.UpdateImage)
  async updateOwnerImg(
    @UploadedFiles()
    files: {
      [UPDATE_IMG_FILE_FIELD.IMAGE]?: Express.Multer.File[];
    },
    @Body()
    body: UpdateOwnerImgDto,
  ): Promise<UpdateOwnerImgResponse> {
    const file =
      files[UPDATE_IMG_FILE_FIELD.IMAGE] &&
      files[UPDATE_IMG_FILE_FIELD.IMAGE].length === 1;

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

  @ApiParam({ name: OwnerPath.ImageIdParam })
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => DeleteOwnerImgByIdResponse })
  @UseGuards(AdminGuard)
  @Delete(OwnerPath.DeleteImage)
  async deleteOwnerImgById(
    @Param(OwnerPath.ImageIdParam) imageId: OwnerImgDomain['id'],
  ): Promise<DeleteOwnerImgByIdResponse> {
    if (!imageId || !isUUID(imageId))
      throw ErrorApiResponse.badRequest(
        'Unprovided or malformed syntax request parameter.',
      );
    await this.ownerService.deleteOwnerImageById(imageId);
    return DeleteOwnerImgByIdResponse.success();
  }
}
