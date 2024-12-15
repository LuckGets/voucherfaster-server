import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty({ type: String, example: 'johndoe@mail.com' })
  email: string;
  @ApiProperty({ type: String, example: '0812223333' })
  phone: string;
  @ApiProperty({ type: String, example: 'http://picsum.photos/100/100' })
  photo?: string;
  @ApiProperty({ type: String, example: 'Qwerty' })
  password?: string;
  @ApiProperty({ type: String, example: 'John Doe' })
  fullname: string;
  @ApiProperty({ type: String, example: 'sakj2asdv_ad214sf_sdf1423' })
  socialId?: string;
  @ApiProperty({ type: String, example: 'google' })
  account_provider?: string;
}
