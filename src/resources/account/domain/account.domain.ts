import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Allow } from 'class-validator';
import {
  AccountProvider,
  AccountProviderEnum,
  Role,
  RoleEnum,
} from '../types/account.type';
import { NullAble } from '../../../utils/types/NullAble.type';
import { UUIDTypes } from 'uuid';

export type IDType = number | UUIDTypes;

export class AccountDomain {
  @ApiProperty()
  id: IDType;

  @ApiProperty({ type: String, example: 'johndoe@mail.com' })
  @Expose({ groups: [RoleEnum.Me, RoleEnum.Admin] })
  email: string;

  @ApiProperty({ type: String, example: '0812345679' })
  @Expose({ groups: [RoleEnum.Me, RoleEnum.Admin] })
  phone: string;

  @Exclude({ toPlainOnly: true })
  password?: string;

  @ApiProperty({ type: String, example: 'John Doe' })
  fullname: string;

  @ApiProperty({
    type: String,
    example: 'https://picsum.photo/100',
  })
  @Allow()
  img?: NullAble<string>;

  @ApiProperty({ type: () => RoleEnum })
  @Expose({ groups: [RoleEnum.Admin] })
  role: Role;

  @ApiProperty({ type: String, example: 'sfq131200a9123sds' })
  @Allow()
  socialId?: NullAble<string>;

  @ApiProperty({
    type: () => AccountProviderEnum,
    example: AccountProviderEnum.Google,
  })
  accountProvider: AccountProvider;
  @ApiProperty()
  @Expose({ groups: [RoleEnum.Me, RoleEnum.Admin] })
  createdAt: NullAble<Date>;
  @ApiProperty()
  @Expose({ groups: [RoleEnum.Me, RoleEnum.Admin] })
  updatedAt: NullAble<Date>;
  @ApiProperty()
  @Expose({ groups: [RoleEnum.Me, RoleEnum.Admin] })
  deletedAt?: NullAble<Date>;
  verifiedAt: NullAble<Date>;
}
