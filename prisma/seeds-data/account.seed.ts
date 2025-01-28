import { Prisma } from '@prisma/client';
import {
  AccountProviderEnum,
  RoleEnum,
} from '../../src/resources/account/types/account.type';
import { v7 as uuidv7 } from 'uuid';

export const accounts: Prisma.AccountCreateManyInput[] = [
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
    email: 'verify1@mail.com',
    fullname: 'Mr. Verify No.1',
    phone: '0812345555',
    verifiedAt: new Date(),
    accountProvider: AccountProviderEnum.Local,
    role: RoleEnum.User,
  },
  {
    id: uuidv7(),
    email: 'verify2@mail.com',
    fullname: 'Mrs. Verify No.2',
    phone: '0812345511',
    verifiedAt: new Date(),
    accountProvider: AccountProviderEnum.Local,
    role: RoleEnum.User,
  },
  {
    id: uuidv7(),
    email: 'verify3@mail.com',
    fullname: 'Mrs. Verify No.3',
    phone: '0812345522',
    verifiedAt: new Date(),
    accountProvider: AccountProviderEnum.Local,
    role: RoleEnum.User,
  },
  {
    id: uuidv7(),
    email: 'kasides15@gmail.com',
    fullname: 'Me Me',
    phone: '0812345556',
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
