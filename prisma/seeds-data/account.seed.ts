import { Prisma } from '@prisma/client';
import {
  AccountProviderEnum,
  RoleEnum,
} from '../../src/resources/account/types/account.type';
import { v7 as uuidv7 } from 'uuid';

export const accounts: Prisma.AccountCreateInput[] = [
  {
    id: uuidv7(),
    email: 'johndoe@mail.com',
    fullname: 'John doe',
    phone: '0812345678',
    accountProvider: AccountProviderEnum.Local,
    role: RoleEnum.User,
  },
  {
    id: uuidv7(),
    email: 'verify@mail.com',
    fullname: 'Verify test',
    phone: '0812345555',
    verifiedAt: new Date(),
    accountProvider: AccountProviderEnum.Local,
    role: RoleEnum.User,
  },
  {
    id: uuidv7(),
    email: 'admin@admin.com',
    fullname: 'ADMIN1',
    phone: '0812345888',
    accountProvider: AccountProviderEnum.Local,
    role: RoleEnum.Admin,
  },
];
