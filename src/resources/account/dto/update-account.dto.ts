import { ApiProperty } from '@nestjs/swagger';
import { NullAble } from '@utils/types/common.type';

export class UpdateAccountDto {
  @ApiProperty({ type: String, required: false })
  email?: NullAble<string>;
  @ApiProperty({ type: String, required: false })
  phone?: NullAble<string>;
  @ApiProperty({ type: String, required: false })
  password?: NullAble<string>;
  @ApiProperty({ type: String, required: false })
  fullname?: NullAble<string>;
  @ApiProperty({ type: String, required: false })
  img?: NullAble<string>;
  @ApiProperty({ type: () => Date, required: false })
  verifiedAt?: NullAble<Date>;
}
