import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Match } from '../../../utils/validators/Match';

export class AuthEmailRegisterReqDto {
  @ApiProperty({
    type: String,
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  fullname: string;
  @ApiProperty({
    type: String,
    example: 'johndoe@mail.com',
  })
  @IsEmail()
  email: string;
  @ApiProperty({
    type: String,
    example: '0812223333',
    minLength: 10,
  })
  @IsPhoneNumber('TH', {
    message: 'Phone number should be match with TH phone region code',
  })
  phone: string;
  @ApiProperty({
    type: String,
    example: 'Qwerty',
  })
  @IsString()
  @MinLength(6)
  @Matches(/(?=.*[A-Z])(?=.*[a-z])/)
  password: string;
  @ApiProperty({
    type: String,
    example: 'Qwerty',
  })
  @IsNotEmpty()
  @IsString()
  @Match('password')
  confirmPassword: string;
}
