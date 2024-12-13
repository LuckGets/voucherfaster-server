import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class RegisterResponseDto {
  @IsOptional()
  @IsString()
  @Transform((value) => {
    if (!value) {
      return 'Account has been created. Registered successful';
    }
  })
  massage: string;
}
