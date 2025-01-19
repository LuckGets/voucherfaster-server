import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  SerializeOptions,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AccountPath } from '../../config/api-path';
import { AccountService } from './account.service';
import { AccessTokenAuthGuard } from 'src/common/guards/access-token.guard';
import { RoleEnum } from './types/account.type';
import { GetMeResponseDto } from './dto/get-me-response.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { HttpRequestWithUser } from 'src/common/http.type';
import {
  ChangePasswordDto,
  ChangePasswordResponse,
  ConfirmChangePasswordDto,
} from './dto/change-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  UpdateAccountDto,
  UpdateAccountResponse,
} from './dto/update-account.dto';
import { MediaService } from '@application/media/media.service';
import { VerifyEmailResponse } from './dto/verify-emai.dto';
import { UnlinkFileInterceptor } from 'src/common/interceptor/unlink-file.interceptor';

@ApiTags(AccountPath.Name)
@Controller({ path: AccountPath.Base, version: '1' })
export class AccountController {
  constructor(
    private accountService: AccountService,
    private mediaService: MediaService,
  ) {}

  @ApiOkResponse({
    type: () => GetMeResponseDto,
  })
  @ApiBearerAuth()
  @SerializeOptions({
    groups: [RoleEnum.Me],
  })
  @UseGuards(AccessTokenAuthGuard)
  @Get(AccountPath.Me)
  async me(@Req() req: HttpRequestWithUser): Promise<GetMeResponseDto> {
    const account = await this.accountService.findById(req.user.accountId);
    return GetMeResponseDto.success(account);
  }

  @ApiParam({ name: 'account ID' })
  @ApiBody({
    description: 'Update the account with expected field',
    schema: {
      type: 'object',
      properties: {
        accountImage: {
          type: 'string',
          format: 'binary',
          description: 'Main image for the voucher',
        },
        email: {
          type: 'string',
          nullable: true,
          description: 'email',
        },
        fullname: {
          type: 'string',
          description: 'fullname',
          nullable: true,
        },
      },
    },
  })
  @ApiConsumes('multipart/formdata')
  @ApiOkResponse({
    type: () => UpdateAccountResponse,
  })
  @ApiBearerAuth()
  @SerializeOptions({
    groups: [RoleEnum.Me],
  })
  @UseGuards(AccessTokenAuthGuard)
  @UseInterceptors(FileInterceptor('accountImage'), UnlinkFileInterceptor)
  @Patch(AccountPath.Update)
  async update(
    @Req() req: HttpRequestWithUser,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UpdateAccountDto,
  ): Promise<UpdateAccountResponse> {
    if (file) {
      body.photo = await this.mediaService.uploadFile(
        file.buffer,
        file.filename,
        file.mimetype,
        'account-image',
      );
    }
    const account = await this.accountService.update(req.user.accountId, body);
    return UpdateAccountResponse.success(account);
  }

  @ApiBody({ type: ChangePasswordDto })
  @ApiOkResponse({
    type: () => ChangePasswordResponse,
  })
  @ApiBearerAuth()
  @SerializeOptions({
    groups: [RoleEnum.Me],
  })
  @UseGuards(AccessTokenAuthGuard)
  @Patch(AccountPath.ChangePassword)
  async changePassword(
    @Req() req: HttpRequestWithUser,
    @Body() body: ChangePasswordDto,
  ) {
    const account = await this.accountService.changePassword(req.user, body);
    return ChangePasswordResponse.success({
      id: account.id,
      verifiedAt: account.verifiedAt,
    });
  }

  @ApiBody({
    type: () => ConfirmChangePasswordDto,
  })
  @ApiOkResponse({
    type: () => ChangePasswordResponse,
  })
  @ApiBearerAuth()
  @SerializeOptions({
    groups: [RoleEnum.Me],
  })
  @UseGuards(AccessTokenAuthGuard)
  @Patch(AccountPath.ConfirmChangePassword)
  async confirmChangePassword(
    @Body() body: ConfirmChangePasswordDto,
  ): Promise<ChangePasswordResponse> {
    const account = await this.accountService.confirmChangePassword(body.token);
    return ChangePasswordResponse.success(
      {
        id: account.id,
        verifiedAt: account.verifiedAt,
      },
      `Changed password successfully. Please Login with the newly changed password.`,
    );
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          description: 'Token which provided via hash field in URL query.',
        },
      },
    },
  })
  @ApiOkResponse({
    type: () => VerifyEmailResponse,
  })
  @SerializeOptions({
    groups: [RoleEnum.Me],
  })
  @Patch(AccountPath.Verify)
  async verfiyEmail(
    @Body() body: { token: string },
  ): Promise<VerifyEmailResponse> {
    const account = await this.accountService.verifyEmail(body.token);
    return VerifyEmailResponse.success(account);
  }

  @ApiOkResponse({
    type: () => VerifyEmailResponse,
  })
  @UseGuards(AccessTokenAuthGuard)
  @Get(AccountPath.Verify)
  async resendVerifyEmail(
    @Req() req: HttpRequestWithUser,
  ): Promise<VerifyEmailResponse> {
    const account = await this.accountService.resendVerifyEmail(
      req.user.accountId,
    );
    return VerifyEmailResponse.success(
      account,
      'Resend Email verification successful',
    );
  }
}
