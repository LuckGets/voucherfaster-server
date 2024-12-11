import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Allow } from 'class-validator';
import { UUID } from 'crypto';
import {
  AccountProvider,
  AccountProviderEnum,
} from 'src/resources/type/account.type';
import { Role } from 'src/resources/type/role.type';

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
  password?: string;

  @ApiProperty({ example: 'John Doe' })
  fullname: string;

  @ApiProperty()
  @Allow()
  img?: string | null;

  @ApiProperty()
  @Expose({ groups: ['admin'] })
  role: Role;

  @ApiProperty({ example: 'sfq131200a9123sds' })
  @Allow()
  socialId?: string;

  @ApiProperty({ example: AccountProviderEnum.Google })
  account_provider: AccountProvider;

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
