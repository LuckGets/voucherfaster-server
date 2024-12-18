import { IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidIdentifier } from '../../../utils/validators/IsValidIdentifier';

export class AuthEmailLoginReqDto {
  @ApiProperty({ type: String, examples: ['johndoe@mail.com', '0112223333'] })
  @IsValidIdentifier()
  identifier: string;

  @ApiProperty({ type: String, example: 'johndoe@mail.com' })
  @MinLength(6)
  @Matches(/(?=.*[A-Z])(?=.*[a-z])/)
  @IsString()
  password: string;
}
