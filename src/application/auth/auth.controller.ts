import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  SerializeOptions,
} from '@nestjs/common';
import { AuthPath } from '../../config/api-path';
import { AuthService } from './auth.service';
import {
  ApiOkResponse,
  ApiCreatedResponse,
  ApiTags,
  ApiConflictResponse,
} from '@nestjs/swagger';
import {
  LoginResponseDto,
  LoginResponseHATEOASLink,
} from './dto/login-response.dto';
import { AuthEmailRegisterReqDto } from './dto/auth-email-register-req.dto';
import { AuthEmailLoginReqDto } from './dto/auth-email-login-req.dto';
import { RoleEnum } from '../../resources/account/types/account.type';
import {
  REGISTER_RESPONSE_MESSAGE,
  RegisterHATEOASLinks,
  RegisterResponseDto,
} from './dto/register-response.dto';

@ApiTags(AuthPath.Name)
@Controller({ path: AuthPath.Base, version: '1' })
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiCreatedResponse({
    type: RegisterResponseDto,
  })
  @ApiConflictResponse()
  @HttpCode(HttpStatus.CREATED)
  @Post(AuthPath.Register)
  async register(
    @Body() body: AuthEmailRegisterReqDto,
  ): Promise<RegisterResponseDto> {
    await this.authService.register(body);
    return RegisterResponseDto.success(
      REGISTER_RESPONSE_MESSAGE.sucess,
      {
        login: RegisterHATEOASLinks.Login,
      },
      HttpStatus.CREATED,
    );
  }

  @SerializeOptions({
    groups: [RoleEnum.Me],
  })
  @ApiOkResponse({
    type: LoginResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  @Post(AuthPath.Login)
  async login(@Body() body: AuthEmailLoginReqDto): Promise<LoginResponseDto> {
    await this.authService.login(body);
    return LoginResponseDto.success(
      'Login Successfully.',
      LoginResponseHATEOASLink,
      HttpStatus.ACCEPTED,
    );
  }
}
