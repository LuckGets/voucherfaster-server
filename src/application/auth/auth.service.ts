import { Injectable } from '@nestjs/common';
import { AccountService } from '../../resources/account/account.service';
import { RegisterResponseDto } from './dto/register-response.dto';
import { plainToClass } from 'class-transformer';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(accountService: AccountService) {}
  async register(): Promise<RegisterResponseDto> {
    return plainToClass(RegisterResponseDto, {
      message: 'Account has been created. Registered successful',
    });
  }

  async login(): Promise<LoginResponseDto> {
    return new LoginResponseDto();
  }
}
