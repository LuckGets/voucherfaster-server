import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import { AccountPath } from '../../config/api-path';
import { AccountService } from './account.service';
import { AccessTokenAuthGuard } from 'src/common/guards/access-token.guard';
import { RoleEnum } from './types/account.type';
import { GetMeResponseDto } from './dto/get-me-response.dto';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { HttpRequestWithUser } from 'src/common/http.type';
import {
  ChangePasswordDto,
  ChangePasswordResponse,
  ConfirmChangePasswordDto,
} from './dto/change-password.dto';

@ApiTags(AccountPath.Name)
@Controller({ path: AccountPath.Base, version: '1' })
export class AccountController {
  constructor(private accountService: AccountService) {}

  @ApiOkResponse({
    type: () => GetMeResponseDto,
  })
  @ApiBearerAuth('Bearer token')
  @SerializeOptions({
    groups: [RoleEnum.Me],
  })
  @UseGuards(AccessTokenAuthGuard)
  @Get('me')
  async me(@Req() req: HttpRequestWithUser): Promise<GetMeResponseDto> {
    const account = await this.accountService.findById(req.user.accountId);
    return GetMeResponseDto.success(account);
  }

  @ApiOkResponse({
    type: () => GetMeResponseDto,
  })
  @ApiBearerAuth('Bearer token')
  @SerializeOptions({
    groups: [RoleEnum.Me],
  })
  @UseGuards(AccessTokenAuthGuard)
  @Patch(AccountPath.Update)
  async update() {
    // @Body() body: string, // @Param(AccountPath.AccountIdParam) accountId: string,
    return 'Hello';
  }

  @ApiOkResponse({
    type: () => ChangePasswordResponse,
  })
  @ApiBearerAuth('Bearer token')
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

  @ApiOkResponse({
    type: () => ChangePasswordResponse,
  })
  @ApiBearerAuth('Bearer token')
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
}
