import { Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidIdentifier } from '../../../utils/validators/IsValidIdentifier';
import { IsPasswordValid } from '@utils/validators/PasswordFormat';

export class AuthEmailLoginReqDto {
  @ApiProperty({ type: String, examples: ['johndoe@mail.com', '0112223333'] })
  @IsValidIdentifier()
  identifier: string;

  @ApiProperty({ type: String, example: 'johndoe@mail.com' })
  @Length(6, 20)
  @IsPasswordValid()
  password: string;
}
