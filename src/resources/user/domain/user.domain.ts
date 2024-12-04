import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Allow } from 'class-validator';
import { UUID } from 'crypto';

type IDType = number | UUID;

export class UserDomain {
  @ApiProperty()
  id: IDType;

  @ApiProperty({ example: 'johndoe@mail.com' })
  @Expose({ groups: ['me', 'admin'] })
  email: string;

  @ApiProperty()
  @Expose({ groups: ['me', 'admin'] })
  phone: string;

  @Exclude({ toPlainOnly: true })
  password: string;

  @ApiProperty({ example: 'John Doe' })
  fullname: string;

  @ApiProperty()
  @Allow()
  img?: string | null;

  role: Role;
}
