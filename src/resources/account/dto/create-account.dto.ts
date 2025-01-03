import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { AccountProvider } from '../types/account.type';

export class CreateAccountDto {
  id?: string;
  @ApiProperty({ type: String, example: 'johndoe@mail.com' })
  email: string;
  @ApiProperty({ type: String, example: '0812223333' })
  phone?: string;
  @IsOptional()
  @ApiProperty({ type: String, example: 'http://picsum.photos/100/100' })
  photo?: string;
  @ApiProperty({ type: String, example: 'Qwerty' })
  password?: string;
  @ApiProperty({ type: String, example: 'John Doe' })
  fullname: string;
  @IsOptional()
  @ApiProperty({ type: String, example: 'sakj2asdv_ad214sf_sdf1423' })
  socialId?: string;
  @IsOptional()
  @ApiProperty({ type: String, example: 'google' })
  accountProvider?: AccountProvider;
}
