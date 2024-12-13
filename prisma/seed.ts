import { Prisma, PrismaClient, PrismaPromise } from '@prisma/client';
import { v7 as uuidv7 } from 'uuid';
import {
  AccountProviderEnum,
  RoleEnum,
} from '../src/resources/account/types/account.type';
const prisma = new PrismaClient();

const accounts: Prisma.AccountCreateInput[] = [
  {
    id: uuidv7(),
    email: 'johndoe@mail.com',
    fullname: 'John doe',
    phone: '0812345678',
    password: 'Qwerty',
    accountProvider: AccountProviderEnum.Local,
    role: RoleEnum.User,
  },
];

const seed = async (): Promise<void> => {
  try {
    console.log('START SEEDING...');
    prisma.account;
    await prisma.$transaction(async (tx) => {
      tx.account.createMany({ data: accounts });
    });
  } catch (err) {
    console.error(err);
  }
};
