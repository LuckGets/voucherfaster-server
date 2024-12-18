import { Controller, Get, SerializeOptions, UseGuards } from '@nestjs/common';
import { AccountPath } from '../../config/api-path';
import { AccountService } from './account.service';
import { AccessTokenAuthGuard } from 'src/common/guards/access-token.guard';
import { RoleEnum } from './types/account.type';
import { GetMeResponseDto } from './dto/get-me-response.dto';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';

@Controller({ path: AccountPath.Base, version: '1' })
export class AccountController {
  constructor(private accountService: AccountService) {}

  @ApiOkResponse({
    type: GetMeResponseDto,
  })
  @ApiBearerAuth()
  @SerializeOptions({
    groups: [RoleEnum.Me],
  })
  @UseGuards(AccessTokenAuthGuard)
  @Get('me')
  me(): Promise<GetMeResponseDto> {}
}
